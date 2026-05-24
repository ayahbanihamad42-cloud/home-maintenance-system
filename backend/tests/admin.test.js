import request from "supertest";
import app from "../app.js";
import { loginAndGetToken } from "./helpers.js";

describe("Admin Security Unit Tests", () => {
  test("4. Admin route without token should return 401", async () => {
    const res = await request(app).get("/api/admin/users");

    expect(res.statusCode).toBe(401);
  });

  test("5. User token on admin route should return 403", async () => {
    const token = await loginAndGetToken("user");

    const res = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(403);
  });

  test("6. Admin token on admin route should return 200", async () => {
    const token = await loginAndGetToken("admin");

    const res = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
  });
});