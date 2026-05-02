import { getDatabase } from "@netlify/database";
import crypto from "crypto";

export const db = getDatabase();

export function json(statusCode, data) {
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

export async function readBody(event) {
  try {
    return event.body ? JSON.parse(event.body) : {};
  } catch {
    return {};
  }
}

export function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

export function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.pbkdf2Sync(String(password), salt, 120000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  if (!stored || !stored.includes(":")) return false;
  const [salt, originalHash] = stored.split(":");
  const candidate = hashPassword(password, salt).split(":")[1];
  return crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(originalHash));
}

export function createToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function rows(result) {
  if (Array.isArray(result)) return result;
  if (result && Array.isArray(result.rows)) return result.rows;
  return [];
}

export async function ensureSchema() {
  await db.sql`
    CREATE TABLE IF NOT EXISTS branches (
      id TEXT PRIMARY KEY,
      branch_name TEXT NOT NULL UNIQUE,
      branch_name_key TEXT NOT NULL UNIQUE,
      branch_code TEXT NOT NULL UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await db.sql`
    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      branch_id TEXT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
      employee_name TEXT NOT NULL,
      employee_name_key TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'staff',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(branch_id, employee_name_key)
    )
  `;

  await db.sql`
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      branch_id TEXT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
      employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await db.sql`
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      branch_id TEXT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      phone TEXT NOT NULL UNIQUE,
      plan TEXT NOT NULL,
      monthly_fee INTEGER NOT NULL,
      unpaid BOOLEAN NOT NULL DEFAULT FALSE,
      status TEXT NOT NULL DEFAULT 'active',
      data_gb INTEGER NOT NULL DEFAULT 0,
      call_minutes INTEGER NOT NULL DEFAULT 0,
      sms_count INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await db.sql`
    CREATE TABLE IF NOT EXISTS logs (
      id TEXT PRIMARY KEY,
      branch_id TEXT REFERENCES branches(id) ON DELETE SET NULL,
      employee_id TEXT REFERENCES employees(id) ON DELETE SET NULL,
      branch_name TEXT NOT NULL,
      employee_name TEXT NOT NULL,
      action TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

export async function getSession(event) {
  const header = event.headers.authorization || event.headers.Authorization || "";
  const token = header.replace("Bearer ", "").trim();
  if (!token) return null;

  const result = await db.sql`
    SELECT
      s.token,
      b.id AS branch_id,
      b.branch_name,
      e.id AS employee_id,
      e.employee_name,
      e.role
    FROM sessions s
    JOIN branches b ON b.id = s.branch_id
    JOIN employees e ON e.id = s.employee_id
    WHERE s.token = ${token}
    LIMIT 1
  `;

  return rows(result)[0] || null;
}

export async function requireSession(event) {
  const session = await getSession(event);
  if (!session) {
    throw Object.assign(new Error("로그인이 필요해."), { statusCode: 401 });
  }
  return session;
}

export async function addLog({ branchId, employeeId, branchName, employeeName, action }) {
  await db.sql`
    INSERT INTO logs (id, branch_id, employee_id, branch_name, employee_name, action)
    VALUES (${crypto.randomUUID()}, ${branchId}, ${employeeId}, ${branchName}, ${employeeName}, ${action})
  `;
}
