import crypto from "crypto";
import {
  db,
  json,
  readBody,
  normalize,
  hashPassword,
  verifyPassword,
  createToken,
  rows,
  ensureSchema,
  requireSession,
  addLog
} from "./_db.js";

const planPrices = {
  "5G 베이직": 55000,
  "5G 스탠다드": 75000,
  "LTE 라이트": 33000
};

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return json(200, { ok: true });
  }

  await ensureSchema();

  try {
    const path = event.path.replace("/.netlify/functions/api", "") || "/";
    const method = event.httpMethod;

    if (method === "POST" && path === "/signup/branch") return await signupBranch(event);
    if (method === "POST" && path === "/signup/employee") return await signupEmployee(event);
    if (method === "POST" && path === "/login") return await login(event);
    if (method === "POST" && path === "/logout") return await logout(event);

    if (method === "GET" && path === "/me") return await me(event);
    if (method === "GET" && path === "/branches") return await listBranches();

    if (method === "GET" && path === "/dashboard") return await dashboard(event);
    if (method === "GET" && path === "/customers") return await listCustomers(event);
    if (method === "POST" && path === "/customers") return await createCustomer(event);
    if (method === "PATCH" && path.startsWith("/customers/")) return await updateCustomer(event, path);
    if (method === "GET" && path === "/logs") return await listLogs(event);

    return json(404, { ok: false, message: "없는 API 주소야." });
  } catch (error) {
    console.error(error);
    return json(error.statusCode || 500, {
      ok: false,
      message: error.message || "서버 오류가 발생했어."
    });
  }
}

async function signupBranch(event) {
  const body = await readBody(event);
  const branchName = String(body.branchName || "").trim();
  const branchCode = String(body.branchCode || "").trim();

  if (!branchName || !branchCode) {
    return json(400, { ok: false, message: "지점명과 지점 코드를 입력해줘." });
  }

  const exists = rows(await db.sql`
    SELECT id FROM branches
    WHERE branch_name_key = ${normalize(branchName)} OR branch_code = ${branchCode}
    LIMIT 1
  `)[0];

  if (exists) {
    return json(409, { ok: false, message: "이미 등록된 지점명 또는 지점 코드야." });
  }

  const branchId = crypto.randomUUID();

  await db.sql`
    INSERT INTO branches (id, branch_name, branch_name_key, branch_code)
    VALUES (${branchId}, ${branchName}, ${normalize(branchName)}, ${branchCode})
  `;

  await addLog({
    branchId,
    employeeId: null,
    branchName,
    employeeName: "SYSTEM",
    action: "지점 가입"
  });

  return json(201, { ok: true, message: "지점 가입 완료!" });
}

async function signupEmployee(event) {
  const body = await readBody(event);
  const branchName = String(body.branchName || "").trim();
  const employeeName = String(body.employeeName || "").trim();
  const password = String(body.password || "");
  const role = body.role === "manager" ? "manager" : "staff";

  if (!branchName || !employeeName || password.length < 4) {
    return json(400, { ok: false, message: "지점, 직원명, 4자 이상 비밀번호를 입력해줘." });
  }

  const branch = rows(await db.sql`
    SELECT id, branch_name FROM branches
    WHERE branch_name = ${branchName}
    LIMIT 1
  `)[0];

  if (!branch) {
    return json(404, { ok: false, message: "등록되지 않은 지점이야." });
  }

  const duplicate = rows(await db.sql`
    SELECT id FROM employees
    WHERE branch_id = ${branch.id} AND employee_name_key = ${normalize(employeeName)}
    LIMIT 1
  `)[0];

  if (duplicate) {
    return json(409, { ok: false, message: "이 지점에 이미 같은 직원명이 있어." });
  }

  const employeeId = crypto.randomUUID();

  await db.sql`
    INSERT INTO employees (id, branch_id, employee_name, employee_name_key, password_hash, role)
    VALUES (${employeeId}, ${branch.id}, ${employeeName}, ${normalize(employeeName)}, ${hashPassword(password)}, ${role})
  `;

  await addLog({
    branchId: branch.id,
    employeeId,
    branchName: branch.branch_name,
    employeeName,
    action: "직원 가입"
  });

  return json(201, { ok: true, message: "직원 가입 완료!" });
}

async function login(event) {
  const body = await readBody(event);
  const branchName = String(body.branchName || "").trim();
  const employeeName = String(body.employeeName || "").trim();
  const password = String(body.password || "");

  const result = rows(await db.sql`
    SELECT
      b.id AS branch_id,
      b.branch_name,
      e.id AS employee_id,
      e.employee_name,
      e.password_hash,
      e.role
    FROM employees e
    JOIN branches b ON b.id = e.branch_id
    WHERE b.branch_name = ${branchName}
      AND e.employee_name_key = ${normalize(employeeName)}
    LIMIT 1
  `)[0];

  if (!result || !verifyPassword(password, result.password_hash)) {
    return json(401, { ok: false, message: "지점명, 직원명 또는 비밀번호가 맞지 않아." });
  }

  const token = createToken();

  await db.sql`
    INSERT INTO sessions (token, branch_id, employee_id)
    VALUES (${token}, ${result.branch_id}, ${result.employee_id})
  `;

  await addLog({
    branchId: result.branch_id,
    employeeId: result.employee_id,
    branchName: result.branch_name,
    employeeName: result.employee_name,
    action: "로그인"
  });

  return json(200, {
    ok: true,
    token,
    user: {
      branchName: result.branch_name,
      employeeName: result.employee_name,
      role: result.role
    }
  });
}

async function logout(event) {
  const session = await requireSession(event);

  await addLog({
    branchId: session.branch_id,
    employeeId: session.employee_id,
    branchName: session.branch_name,
    employeeName: session.employee_name,
    action: "로그아웃"
  });

  await db.sql`DELETE FROM sessions WHERE token = ${session.token}`;

  return json(200, { ok: true, message: "로그아웃 완료." });
}

async function me(event) {
  const session = await requireSession(event);
  return json(200, {
    ok: true,
    user: {
      branchName: session.branch_name,
      employeeName: session.employee_name,
      role: session.role
    }
  });
}

async function listBranches() {
  const result = rows(await db.sql`
    SELECT branch_name, branch_code
    FROM branches
    ORDER BY created_at DESC
  `);

  return json(200, { ok: true, branches: result });
}

async function dashboard(event) {
  const session = await requireSession(event);

  const stats = rows(await db.sql`
    SELECT
      COUNT(*)::int AS total_customers,
      COUNT(*) FILTER (WHERE status = 'active')::int AS active_lines,
      COUNT(*) FILTER (WHERE unpaid = true)::int AS unpaid_customers
    FROM customers
    WHERE branch_id = ${session.branch_id}
  `)[0];

  const todayLogs = rows(await db.sql`
    SELECT COUNT(*)::int AS count
    FROM logs
    WHERE branch_id = ${session.branch_id}
      AND created_at::date = CURRENT_DATE
  `)[0];

  const recentLogs = rows(await db.sql`
    SELECT employee_name, action, created_at
    FROM logs
    WHERE branch_id = ${session.branch_id}
    ORDER BY created_at DESC
    LIMIT 5
  `);

  return json(200, {
    ok: true,
    stats: {
      totalCustomers: stats?.total_customers || 0,
      activeLines: stats?.active_lines || 0,
      unpaidCustomers: stats?.unpaid_customers || 0,
      todayLogs: todayLogs?.count || 0
    },
    recentLogs
  });
}

async function listCustomers(event) {
  const session = await requireSession(event);
  const phone = event.queryStringParameters?.phone || "";

  const result = phone
    ? rows(await db.sql`
        SELECT *
        FROM customers
        WHERE branch_id = ${session.branch_id}
          AND phone LIKE ${"%" + phone + "%"}
        ORDER BY created_at DESC
      `)
    : rows(await db.sql`
        SELECT *
        FROM customers
        WHERE branch_id = ${session.branch_id}
        ORDER BY created_at DESC
      `);

  return json(200, { ok: true, customers: result.map(mapCustomer) });
}

async function createCustomer(event) {
  const session = await requireSession(event);
  const body = await readBody(event);

  const name = String(body.name || "").trim();
  const phone = String(body.phone || "").trim();
  const plan = String(body.plan || "").trim();

  if (!name || !phone || !planPrices[plan]) {
    return json(400, { ok: false, message: "고객명, 전화번호, 요금제를 확인해줘." });
  }

  const duplicate = rows(await db.sql`
    SELECT id FROM customers WHERE phone = ${phone} LIMIT 1
  `)[0];

  if (duplicate) {
    return json(409, { ok: false, message: "이미 등록된 전화번호야." });
  }

  const customerId = crypto.randomUUID();

  await db.sql`
    INSERT INTO customers (id, branch_id, name, phone, plan, monthly_fee)
    VALUES (${customerId}, ${session.branch_id}, ${name}, ${phone}, ${plan}, ${planPrices[plan]})
  `;

  await addLog({
    branchId: session.branch_id,
    employeeId: session.employee_id,
    branchName: session.branch_name,
    employeeName: session.employee_name,
    action: `신규 개통: ${name} / ${phone} / ${plan}`
  });

  return json(201, { ok: true, message: "신규 개통 완료." });
}

async function updateCustomer(event, path) {
  const session = await requireSession(event);
  const customerId = decodeURIComponent(path.split("/")[2]);
  const body = await readBody(event);
  const action = body.action;

  const customer = rows(await db.sql`
    SELECT * FROM customers
    WHERE id = ${customerId} AND branch_id = ${session.branch_id}
    LIMIT 1
  `)[0];

  if (!customer) {
    return json(404, { ok: false, message: "고객을 찾을 수 없어." });
  }

  let logText = "";

  if (action === "close") {
    await db.sql`UPDATE customers SET status = 'closed' WHERE id = ${customerId}`;
    logText = `회선 해지: ${customer.name} / ${customer.phone}`;
  } else if (action === "reopen") {
    await db.sql`UPDATE customers SET status = 'active' WHERE id = ${customerId}`;
    logText = `회선 재개통: ${customer.name} / ${customer.phone}`;
  } else if (action === "pay") {
    await db.sql`UPDATE customers SET unpaid = false WHERE id = ${customerId}`;
    logText = `요금 납부 처리: ${customer.name} / ${customer.phone}`;
  } else if (action === "unpaid") {
    await db.sql`UPDATE customers SET unpaid = true WHERE id = ${customerId}`;
    logText = `요금 미납 처리: ${customer.name} / ${customer.phone}`;
  } else if (action === "usage") {
    const type = body.type;
    if (type === "data") {
      await db.sql`UPDATE customers SET data_gb = data_gb + 1 WHERE id = ${customerId}`;
      logText = `사용량 증가: 데이터 +1GB / ${customer.name}`;
    } else if (type === "call") {
      await db.sql`UPDATE customers SET call_minutes = call_minutes + 10 WHERE id = ${customerId}`;
      logText = `사용량 증가: 통화 +10분 / ${customer.name}`;
    } else if (type === "sms") {
      await db.sql`UPDATE customers SET sms_count = sms_count + 5 WHERE id = ${customerId}`;
      logText = `사용량 증가: 문자 +5건 / ${customer.name}`;
    } else {
      return json(400, { ok: false, message: "사용량 타입이 잘못됐어." });
    }
  } else {
    return json(400, { ok: false, message: "처리할 action이 잘못됐어." });
  }

  await addLog({
    branchId: session.branch_id,
    employeeId: session.employee_id,
    branchName: session.branch_name,
    employeeName: session.employee_name,
    action: logText
  });

  return json(200, { ok: true, message: "처리 완료." });
}

async function listLogs(event) {
  const session = await requireSession(event);

  const result = rows(await db.sql`
    SELECT employee_name, action, created_at
    FROM logs
    WHERE branch_id = ${session.branch_id}
    ORDER BY created_at DESC
    LIMIT 100
  `);

  return json(200, { ok: true, logs: result });
}

function mapCustomer(c) {
  return {
    id: c.id,
    name: c.name,
    phone: c.phone,
    plan: c.plan,
    monthlyFee: c.monthly_fee,
    unpaid: c.unpaid,
    status: c.status,
    usage: {
      data: c.data_gb,
      call: c.call_minutes,
      sms: c.sms_count
    },
    createdAt: c.created_at
  };
}
