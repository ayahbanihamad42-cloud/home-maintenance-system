import request from "supertest";
import app from "../app.js";
import { loginAndGetToken } from "./helpers.js";

describe("Chat Unit Tests", () => {
  test("13. Send chat message without token should return 401", async () => {
    const res = await request(app)
      .post("/api/chat")
      .send({
        receiver_id: 2,
        message: "Hello",
        message_type: "text",
      });

    expect(res.statusCode).toBe(401);
  });

  test("14. Send empty message should return 400", async () => {
    const token = await loginAndGetToken("user");

    const res = await request(app)
      .post("/api/chat")
      .set("Authorization", `Bearer ${token}`)
      .send({
        receiver_id: 2,
        message: "",
        message_type: "text",
      });

    expect(res.statusCode).toBe(400);
  });

  test("15. Send message without receiver should return 400", async () => {
    const token = await loginAndGetToken("user");

    const res = await request(app)
      .post("/api/chat")
      .set("Authorization", `Bearer ${token}`)
      .send({
        message: "Hello",
        message_type: "text",
      });

    expect(res.statusCode).toBe(400);
  });
});