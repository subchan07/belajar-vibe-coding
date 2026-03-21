import { Elysia, t } from "elysia";
import { UsersService } from "../services/users-service";
import { authPlugin } from "../middlewares/auth-middleware";

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
            name: t.String({ maxLength: 255 }),
            email: t.String({ maxLength: 255 }),
            password: t.String({ maxLength: 255 }),
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
            email: t.String({ maxLength: 255 }),
            password: t.String({ maxLength: 255 }),
        })
    })
    .use(authPlugin)
    .get("/users/current", async ({ token, set }) => {
        try {
            const result = await UsersService.getCurrentUser(token!);
            return result;
        } catch (error: any) {
            if (error.message === "Unauthorized") {
                set.status = 401;
                return { error: "Unauthorized" };
            }
            set.status = 500;
            return { error: "Internal Server Error" };
        }
    })
    .delete("/users/logout", async ({ token, set }) => {
        try {
            const result = await UsersService.logout(token!);
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
