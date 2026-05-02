import { getStore, connectLambda } from "@netlify/blobs";
import crypto from "crypto";

const STORE_NAME = "neverlab-telecom-cs";
const DB_KEY = "main";

const planPrices = {
  "5G 베이직": 55000,
  "5G 스탠다드": 75000,
  "LTE 라이트": 33000
};

function json(statusCode, data) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS"
    },
    body: JSON.stringify(data)
  };
}

async function readBody(event) {
  try {
    return event.body ? JSON.parse(event.body) : {};
  } catch {
    return {};
  }
}

function emptyDB() {
  return {
    branches: [],
    employees: [],
    sessions: [],
    customers: [],
    logs: []
  };
}

async function readDB(store) {
  const data = await store.get(DB_KEY, { type: "json" });
  return data || emptyDB();
}

async function writeDB(store, data) {
  await store.setJSON(DB_KEY, data);
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.pbkdf2Sync(String(password), salt, 120000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  if (!stored || !stored.includes(":")) return false;
  const [salt, originalHash] = stored.split(":");
  const candidate = hashPassword(password, salt).split(":")[1];
  return crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(originalHash));
}

function createToken() {
  return crypto.randomBytes(32).toString("hex");
}

function now() {
  return new Date().toISOString();
}

function addLog(data, { branchId, employeeId, branchName, employeeName, action }) {
  data.logs.push({
    id: crypto.randomUUID(),
    branchId,
    employeeId,
    branchName,
    employeeName,
    action,
    createdAt: now()
  });
}

function getToken(event) {
  const header = event.headers.authorization || event.headers.Authorization || "";
  return header.replace("Bearer ", "").trim();
}

function getSession(data, event) {
  const token = getToken(event);
  if (!token) return null;

  const session = data.sessions.find(s => s.token === token);
  if (!session) return null;

  const branch = data.branches.find(b => b.id === session.branchId);
  const employee = data.employees.find(e => e.id === session.employeeId);

  if (!branch || !employee) return null;

  return {
    token,
    branchId: branch.id,
    branchName: branch.branchName,
    employeeId: employee.id,
    employeeName: employee.employeeName,
    role: employee.role
  };
}

function requireSession(data, event) {
  const session = getSession(data, event);
  if (!session) {
    const err = new Error("로그인이 필요해.");
    err.statusCode = 401;
    throw err;
  }
  return session;
}

function mapCustomer(c) {
  return {
    id: c.id,
    name: c.name,
    phone: c.phone,
    plan: c.plan,
    monthlyFee: c.monthlyFee,
    unpaid: c.unpaid,
    status: c.status,
    usage: {
      data: c.dataGb,
      call: c.callMinutes,
      sms: c.smsCount
    },
    createdAt: c.createdAt
  };
}

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return json(200, { ok: true });
  }

  try {
    connectLambda(event);
    const store = getStore(STORE_NAME);

    const path = event.path.replace("/.netlify/functions/api", "") || "/";
    const method = event.httpMethod;
    const data = await readDB(store);

    if (method === "POST" && path === "/signup/branch") return await signupBranch(event, data, store);
    if (method === "POST" && path === "/signup/employee") return await signupEmployee(event, data, store);
    if (method === "POST" && path === "/login") return await login(event, data, store);
    if (method === "POST" && path === "/logout") return await logout(event, data, store);

    if (method === "GET" && path === "/me") return await me(event, data);
    if (method === "GET" && path === "/branches") return await listBranches(data);

    if (method === "GET" && path === "/dashboard") return await dashboard(event, data);
    if (method === "GET" && path === "/customers") return await listCustomers(event, data);
    if (method === "POST" && path === "/customers") return await createCustomer(event, data, store);
    if (method === "PATCH" && path.startsWith("/customers/")) return await updateCustomer(event, path, data, store);
    if (method === "GET" && path === "/logs") return await listLogs(event, data);

    return json(404, { ok: false, message: "없는 API 주소야." });
  } catch (error) {
    console.error(error);
    return json(error.statusCode || 500, {
      ok: false,
      message: error.message || "서버 오류가 발생했어."
    });
  }
}

async function signupBranch(event, data, store) {
  const body = await readBody(event);
  const branchName = String(body.branchName || "").trim();
  const branchCode = String(body.branchCode || "").trim();

  if (!branchName || !branchCode) {
    return json(400, { ok: false, message: "지점명과 지점 코드를 입력해줘." });
  }

  const exists = data.branches.some(b =>
    normalize(b.branchName) === normalize(branchName) ||
    normalize(b.branchCode) === normalize(branchCode)
  );

  if (exists) {
    return json(409, { ok: false, message: "이미 등록된 지점명 또는 지점 코드야." });
  }

  const branch = {
    id: crypto.randomUUID(),
    branchName,
    branchCode,
    createdAt: now()
  };

  data.branches.push(branch);

  addLog(data, {
    branchId: branch.id,
    employeeId: null,
    branchName,
    employeeName: "SYSTEM",
    action: "지점 가입"
  });

  await writeDB(store, data);
  return json(201, { ok: true, message: "지점 가입 완료!" });
}

async function signupEmployee(event, data, store) {
  const body = await readBody(event);
  const branchName = String(body.branchName || "").trim();
  const employeeName = String(body.employeeName || "").trim();
  const password = String(body.password || "");
  const role = body.role === "manager" ? "manager" : "staff";

  if (!branchName || !employeeName || password.length < 4) {
    return json(400, { ok: false, message: "지점, 직원명, 4자 이상 비밀번호를 입력해줘." });
  }

  const branch = data.branches.find(b => b.branchName === branchName);

  if (!branch) {
    return json(404, { ok: false, message: "등록되지 않은 지점이야." });
  }

  const duplicate = data.employees.some(e =>
    e.branchId === branch.id &&
    normalize(e.employeeName) === normalize(employeeName)
  );

  if (duplicate) {
    return json(409, { ok: false, message: "이 지점에 이미 같은 직원명이 있어." });
  }

  const employee = {
    id: crypto.randomUUID(),
    branchId: branch.id,
    employeeName,
    employeeNameKey: normalize(employeeName),
    passwordHash: hashPassword(password),
    role,
    createdAt: now()
  };

  data.employees.push(employee);

  addLog(data, {
    branchId: branch.id,
    employeeId: employee.id,
    branchName: branch.branchName,
    employeeName,
    action: "직원 가입"
  });

  await writeDB(store, data);
  return json(201, { ok: true, message: "직원 가입 완료!" });
}

async function login(event, data, store) {
  const body = await readBody(event);
  const branchName = String(body.branchName || "").trim();
  const employeeName = String(body.employeeName || "").trim();
  const password = String(body.password || "");

  const branch = data.branches.find(b => b.branchName === branchName);
  if (!branch) {
    return json(401, { ok: false, message: "지점명, 직원명 또는 비밀번호가 맞지 않아." });
  }

  const employee = data.employees.find(e =>
    e.branchId === branch.id &&
    normalize(e.employeeName) === normalize(employeeName)
  );

  if (!employee || !verifyPassword(password, employee.passwordHash)) {
    return json(401, { ok: false, message: "지점명, 직원명 또는 비밀번호가 맞지 않아." });
  }

  const token = createToken();

  data.sessions.push({
    token,
    branchId: branch.id,
    employeeId: employee.id,
    createdAt: now()
  });

  addLog(data, {
    branchId: branch.id,
    employeeId: employee.id,
    branchName: branch.branchName,
    employeeName: employee.employeeName,
    action: "로그인"
  });

  await writeDB(store, data);

  return json(200, {
    ok: true,
    token,
    user: {
      branchName: branch.branchName,
      employeeName: employee.employeeName,
      role: employee.role
    }
  });
}

async function logout(event, data, store) {
  const session = requireSession(data, event);

  data.sessions = data.sessions.filter(s => s.token !== session.token);

  addLog(data, {
    branchId: session.branchId,
    employeeId: session.employeeId,
    branchName: session.branchName,
    employeeName: session.employeeName,
    action: "로그아웃"
  });

  await writeDB(store, data);
  return json(200, { ok: true, message: "로그아웃 완료." });
}

async function me(event, data) {
  const session = requireSession(data, event);
  return json(200, {
    ok: true,
    user: {
      branchName: session.branchName,
      employeeName: session.employeeName,
      role: session.role
    }
  });
}

async function listBranches(data) {
  return json(200, {
    ok: true,
    branches: data.branches
      .slice()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(b => ({
        branch_name: b.branchName,
        branch_code: b.branchCode
      }))
  });
}

async function dashboard(event, data) {
  const session = requireSession(data, event);
  const customers = data.customers.filter(c => c.branchId === session.branchId);
  const logs = data.logs.filter(l => l.branchId === session.branchId);
  const today = new Date().toISOString().slice(0, 10);

  return json(200, {
    ok: true,
    stats: {
      totalCustomers: customers.length,
      activeLines: customers.filter(c => c.status === "active").length,
      unpaidCustomers: customers.filter(c => c.unpaid).length,
      todayLogs: logs.filter(l => l.createdAt.slice(0, 10) === today).length
    },
    recentLogs: logs.slice().reverse().slice(0, 5).map(l => ({
      employee_name: l.employeeName,
      action: l.action,
      created_at: l.createdAt
    }))
  });
}

async function listCustomers(event, data) {
  const session = requireSession(data, event);
  const phone = event.queryStringParameters?.phone || "";

  let customers = data.customers.filter(c => c.branchId === session.branchId);

  if (phone) {
    customers = customers.filter(c => c.phone.includes(phone));
  }

  customers = customers
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(mapCustomer);

  return json(200, { ok: true, customers });
}

async function createCustomer(event, data, store) {
  const session = requireSession(data, event);
  const body = await readBody(event);

  const name = String(body.name || "").trim();
  const phone = String(body.phone || "").trim();
  const plan = String(body.plan || "").trim();

  if (!name || !phone || !planPrices[plan]) {
    return json(400, { ok: false, message: "고객명, 전화번호, 요금제를 확인해줘." });
  }

  const duplicate = data.customers.some(c => c.phone === phone);
  if (duplicate) {
    return json(409, { ok: false, message: "이미 등록된 전화번호야." });
  }

  const customer = {
    id: crypto.randomUUID(),
    branchId: session.branchId,
    name,
    phone,
    plan,
    monthlyFee: planPrices[plan],
    unpaid: false,
    status: "active",
    dataGb: 0,
    callMinutes: 0,
    smsCount: 0,
    createdAt: now()
  };

  data.customers.push(customer);

  addLog(data, {
    branchId: session.branchId,
    employeeId: session.employeeId,
    branchName: session.branchName,
    employeeName: session.employeeName,
    action: `신규 개통: ${name} / ${phone} / ${plan}`
  });

  await writeDB(store, data);
  return json(201, { ok: true, message: "신규 개통 완료." });
}

async function updateCustomer(event, path, data, store) {
  const session = requireSession(data, event);
  const customerId = decodeURIComponent(path.split("/")[2]);
  const body = await readBody(event);
  const customer = data.customers.find(c => c.id === customerId && c.branchId === session.branchId);

  if (!customer) {
    return json(404, { ok: false, message: "고객을 찾을 수 없어." });
  }

  let logText = "";

  if (body.action === "close") {
    customer.status = "closed";
    logText = `회선 해지: ${customer.name} / ${customer.phone}`;
  } else if (body.action === "reopen") {
    customer.status = "active";
    logText = `회선 재개통: ${customer.name} / ${customer.phone}`;
  } else if (body.action === "pay") {
    customer.unpaid = false;
    logText = `요금 납부 처리: ${customer.name} / ${customer.phone}`;
  } else if (body.action === "unpaid") {
    customer.unpaid = true;
    logText = `요금 미납 처리: ${customer.name} / ${customer.phone}`;
  } else if (body.action === "usage") {
    if (body.type === "data") {
      customer.dataGb += 1;
      logText = `사용량 증가: 데이터 +1GB / ${customer.name}`;
    } else if (body.type === "call") {
      customer.callMinutes += 10;
      logText = `사용량 증가: 통화 +10분 / ${customer.name}`;
    } else if (body.type === "sms") {
      customer.smsCount += 5;
      logText = `사용량 증가: 문자 +5건 / ${customer.name}`;
    } else {
      return json(400, { ok: false, message: "사용량 타입이 잘못됐어." });
    }
  } else {
    return json(400, { ok: false, message: "처리할 action이 잘못됐어." });
  }

  addLog(data, {
    branchId: session.branchId,
    employeeId: session.employeeId,
    branchName: session.branchName,
    employeeName: session.employeeName,
    action: logText
  });

  await writeDB(store, data);
  return json(200, { ok: true, message: "처리 완료." });
}

async function listLogs(event, data) {
  const session = requireSession(data, event);

  const logs = data.logs
    .filter(l => l.branchId === session.branchId)
    .slice()
    .reverse()
    .slice(0, 100)
    .map(l => ({
      employee_name: l.employeeName,
      action: l.action,
      created_at: l.createdAt
    }));

  return json(200, { ok: true, logs });
}
