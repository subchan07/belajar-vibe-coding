import { Elysia, t } from "elysia";
import { UsersService } from "../services/users-service";

export const usersRoutes = new Elysia({ prefix: "/api" })
    .post("/users", async ({ body, set }) => {
        try {
            const result = await UsersService.register(body);
            return result;
        } catch (error: any) {
            if (error.message === "Email sudah terdaftar") {
                set.status = 400;
                return { error: error.message };
            }
            set.status = 500;
            return { error: "Internal Server Error" };
        }
    }, {
        body: t.Object({
            name: t.String(),
            email: t.String(),
            password: t.String(),
        })
    })
    .post("/users/login", async ({ body, set }) => {
        try {
            const result = await UsersService.login(body);
            return result;
        } catch (error: any) {
            if (error.message === "Email atau password salah") {
                set.status = 401;
                return { error: error.message };
            }
            set.status = 500;
            return { error: "Internal Server Error" };
        }
    }, {
        body: t.Object({
            email: t.String(),
            password: t.String(),
        })
    })
    .get("/users/current", async ({ headers, set }) => {
        const authHeader = headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            set.status = 401;
            return { error: "Unauthorized" };
        }

        const token = authHeader!.split(" ")[1];
        try {
            const result = await UsersService.getCurrentUser(token);
            return result;
        } catch (error: any) {
            if (error.message === "Unauthorized") {
                set.status = 401;
                return { error: "Unauthorized" };
            }
            set.status = 500;
            return { error: "Internal Server Error" };
        }
    });
