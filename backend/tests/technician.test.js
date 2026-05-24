import request from "supertest";
import app from "../app.js";
import { loginAndGetToken } from "./helpers.js";

describe("Technician Unit Tests", () => {
  test("11. Add availability without token should return 401", async () => {
    const res = await request(app)
      .post("/api/technicians/availability")
      .send({});

    expect(res.statusCode).toBe(401);
  });

  test("12. Add availability with start time after end time should return 400", async () => {
    const token = await loginAndGetToken("technician");

    const res = await request(app)
      .post("/api/technicians/availability")
      .set("Authorization", `Bearer ${token}`)
      .send({
        available_date: "2030-01-01",
        start_time: "15:00",
        end_time: "10:00",
      });

    expect(res.statusCode).toBe(400);
  });
});