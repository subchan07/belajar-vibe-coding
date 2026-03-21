import { describe, expect, it, beforeEach } from "bun:test";
import { Elysia } from "elysia";
import { usersRoutes } from "../src/routes/users-routes";
import { db } from "../src/db";
import { users, sessions } from "../src/db/schema";
import { eq } from "drizzle-orm";

const app = new Elysia().use(usersRoutes);

describe("Users API", () => {
    beforeEach(async () => {
        // Clear database before each test
        await db.delete(sessions);
        await db.delete(users);
    });

    describe("POST /api/users (Registration)", () => {
        it("should register a user successfully", async () => {
            const response = await app.handle(
                new Request("http://localhost/api/users", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: "Test User",
                        email: "test@example.com",
                        password: "password123"
                    })
                })
            );

            expect(response.status).toBe(200);
            const data = await response.json() as any;
            expect(data.data).toBe("OK");

            // Verify in DB
            const user = await db.query.users.findFirst({
                where: eq(users.email, "test@example.com")
            });
            expect(user).toBeDefined();
            expect(user?.name).toBe("Test User");
        });

        it("should fail if email is already registered", async () => {
            // First registration
            await app.handle(
                new Request("http://localhost/api/users", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: "Test User",
                        email: "test@example.com",
                        password: "password123"
                    })
                })
            );

            // Second registration
            const response = await app.handle(
                new Request("http://localhost/api/users", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: "Test User 2",
                        email: "test@example.com",
                        password: "password123"
                    })
                })
            );

            expect(response.status).toBe(400);
            const data = await response.json() as any;
            expect(data.error).toBe("Email sudah terdaftar");
        });

        it("should fail if name is longer than 255 characters", async () => {
            const longName = "a".repeat(256);
            const response = await app.handle(
                new Request("http://localhost/api/users", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: longName,
                        email: "long@example.com",
                        password: "password123"
                    })
                })
            );

            expect(response.status).toBe(422);
            const data = await response.json() as any;
            expect(data.type).toBe("validation");
        });
    });

    describe("POST /api/users/login (Login)", () => {
        beforeEach(async () => {
            // Register a user first
            await app.handle(
                new Request("http://localhost/api/users", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: "Test User",
                        email: "test@example.com",
                        password: "password123"
                    })
                })
            );
        });

        it("should login successfully with correct credentials", async () => {
            const response = await app.handle(
                new Request("http://localhost/api/users/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: "test@example.com",
                        password: "password123"
                    })
                })
            );

            expect(response.status).toBe(200);
            const data = await response.json() as any;
            expect(data.data).toBeDefined();
            expect(typeof data.data).toBe("string"); // token
        });

        it("should fail with incorrect password", async () => {
            const response = await app.handle(
                new Request("http://localhost/api/users/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: "test@example.com",
                        password: "wrongpassword"
                    })
                })
            );

            expect(response.status).toBe(401);
            const data = await response.json() as any;
            expect(data.error).toBe("Email atau password salah");
        });
    });

    describe("Protected Routes (/current and /logout)", () => {
        let token: string;

        beforeEach(async () => {
            // Register and login to get a token
            await app.handle(
                new Request("http://localhost/api/users", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: "Auth User",
                        email: "auth@example.com",
                        password: "password123"
                    })
                })
            );

            const loginResponse = await app.handle(
                new Request("http://localhost/api/users/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: "auth@example.com",
                        password: "password123"
                    })
                })
            );
            const loginData = await loginResponse.json() as any;
            token = loginData.data;
        });

        it("should get current user info with valid token", async () => {
            const response = await app.handle(
                new Request("http://localhost/api/users/current", {
                    method: "GET",
                    headers: { "Authorization": `Bearer ${token}` }
                })
            );

            expect(response.status).toBe(200);
            const data = await response.json() as any;
            expect(data.data.email).toBe("auth@example.com");
            expect(data.data.name).toBe("Auth User");
        });

        it("should logout successfully", async () => {
            const response = await app.handle(
                new Request("http://localhost/api/users/logout", {
                    method: "DELETE",
                    headers: { "Authorization": `Bearer ${token}` }
                })
            );

            expect(response.status).toBe(200);
            const data = await response.json() as any;
            expect(data.data).toBe("OK");

            // Verify token is invalidated
            const profileResponse = await app.handle(
                new Request("http://localhost/api/users/current", {
                    method: "GET",
                    headers: { "Authorization": `Bearer ${token}` }
                })
            );
            expect(profileResponse.status).toBe(401);
        });

        it("should fail access if token is missing", async () => {
            const response = await app.handle(
                new Request("http://localhost/api/users/current", {
                    method: "GET"
                })
            );
            expect(response.status).toBe(401);
            const data = await response.json() as any;
            expect(data.error).toBe("Unauthorized");
        });
    });
});
