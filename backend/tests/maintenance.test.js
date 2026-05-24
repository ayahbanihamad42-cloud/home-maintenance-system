import request from "supertest";
import app from "../app.js";
import { loginAndGetToken } from "./helpers.js";

describe("Maintenance Unit Tests", () => {
  test("7. Create maintenance request without token should return 401", async () => {
    const res = await request(app)
      .post("/api/maintenance")
      .send({});

    expect(res.statusCode).toBe(401);
  });

  test("8. Create maintenance request with missing data should return 400", async () => {
    const token = await loginAndGetToken("user");

    const res = await request(app)
      .post("/api/maintenance")
      .set("Authorization", `Bearer ${token}`)
      .send({
        description: "",
      });

    expect(res.statusCode).toBe(400);
  });

  test("9. User cannot view another user's history", async () => {
    const token = await loginAndGetToken("user");

    const res = await request(app)
      .get("/api/maintenance/user/999999")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(403);
  });

  test("10. Invalid request status should return 400", async () => {
    const token = await loginAndGetToken("technician");

    const res = await request(app)
      .put("/api/maintenance/1/status")
      .set("Authorization", `Bearer ${token}`)
      .send({
        status: "wrong_status",
      });

    expect(res.statusCode).toBe(400);
  });
});