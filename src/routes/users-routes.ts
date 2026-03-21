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
    });
