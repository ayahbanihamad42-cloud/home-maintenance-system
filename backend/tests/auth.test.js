import request from "supertest";
import app from "../app.js";
import { testUsers } from "./helpers.js";

describe("Auth Unit Tests", () => {
  test("1. Login without email/password should return 400", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({});

    expect(res.statusCode).toBe(400);
  });

  test("2. Login with wrong credentials should return 401", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "wrong@test.com",
        password: "wrong-password",
      });

    expect(res.statusCode).toBe(401);
  });

  test("3. Login with valid user should return token", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send(testUsers.user);

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user).toBeDefined();
  });
});