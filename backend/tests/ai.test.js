import request from "supertest";
import app from "../app.js";
import { loginAndGetToken } from "./helpers.js";

describe("AI Unit Tests", () => {
  test("16. AI chat without token should return 401", async () => {
    const res = await request(app)
      .post("/api/ai/chat")
      .send({
        message: "How can I fix a leaking pipe?",
      });

    expect(res.statusCode).toBe(401);
  });

  test("17. AI chat with empty message should return 400", async () => {
    const token = await loginAndGetToken("user");

    const res = await request(app)
      .post("/api/ai/chat")
      .set("Authorization", `Bearer ${token}`)
      .send({
        message: "",
      });

    expect(res.statusCode).toBe(400);
  });

  test("18. AI chat with valid message should return 200", async () => {
    const token = await loginAndGetToken("user");

    const res = await request(app)
      .post("/api/ai/chat")
      .set("Authorization", `Bearer ${token}`)
      .send({
        message: "Suggest a solution for AC not cooling",
      });

    expect(res.statusCode).toBe(200);
  });
});