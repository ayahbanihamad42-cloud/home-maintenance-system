import request from "supertest";
import app from "../app.js";

export const testUsers = {
  user: {
    email: process.env.TEST_USER_EMAIL || "user@test.com",
    password: process.env.TEST_USER_PASSWORD || "123456",
  },
  technician: {
    email: process.env.TEST_TECH_EMAIL || "tech@test.com",
    password: process.env.TEST_TECH_PASSWORD || "123456",
  },
  admin: {
    email: process.env.TEST_ADMIN_EMAIL || "admin@test.com",
    password: process.env.TEST_ADMIN_PASSWORD || "123456",
  },
};

export async function loginAndGetToken(role = "user") {
  const credentials = testUsers[role];

  const res = await request(app)
    .post("/api/auth/login")
    .send(credentials);

  if (!res.body.token) {
    throw new Error(
      `Login failed for ${role}. Status: ${res.statusCode}. Response: ${JSON.stringify(
        res.body
      )}`
    );
  }

  return res.body.token;
}