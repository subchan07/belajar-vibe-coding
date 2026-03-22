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
            name: t.String({ maxLength: 255, default: 'Jono Jojo', description: 'Nama lengkap user' }),
            email: t.String({ maxLength: 255, default: 'jono@example.com', description: 'Alamat email user' }),
            password: t.String({ maxLength: 255, default: 'rahasia123', description: 'Password user' }),
        }),
        response: {
            200: t.Object({
                data: t.String({ default: 'string' })
            }),
            400: t.Object({
                error: t.String({ default: 'Email sudah terdaftar' })
            }),
            500: t.Object({
                error: t.String({ default: 'Internal Server Error' })
            })
        },
        detail: {
            summary: 'Register User Baru',
            description: 'Endpoint untuk mendaftarkan user baru',
            tags: ['Users']
        },
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
            email: t.String({ maxLength: 255, default: 'jono@example.com' }),
            password: t.String({ maxLength: 255, default: 'rahasia123' }),
        }),
        response: {
            200: t.Object({
                data: t.String({ default: 'string' })
            }),
            401: t.Object({
                error: t.String({ default: 'Email atau password salah' })
            }),
            500: t.Object({
                error: t.String({ default: 'Internal Server Error' })
            })
        },
        detail: {
            summary: 'Login User',
            description: 'Endpoint untuk login user',
            tags: ['Users']
        }
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
    }, {
        response: {
            200: t.Object({
                data: t.Object({
                    id: t.Number({ default: 1 }),
                    name: t.String({ default: 'Jono Jojo' }),
                    email: t.String({ default: 'jono@example.com' }),
                    created_at: t.Date()
                })
            }),
            401: t.Object({
                error: t.String({ default: 'Unauthorized' })
            }),
            500: t.Object({
                error: t.String({ default: 'Internal Server Error' })
            })
        },
        detail: {
            summary: 'Get Current User',
            description: 'Endpoint untuk mendapatkan user yang sedang login',
            tags: ['Users']
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
    }, {
        response: {
            200: t.Object({
                data: t.String({ default: 'string' })
            }),
            401: t.Object({
                error: t.String({ default: 'Unauthorized' })
            }),
            500: t.Object({
                error: t.String({ default: 'Internal Server Error' })
            })
        },
        detail: {
            summary: 'Logout User',
            description: 'Endpoint untuk logout user',
            tags: ['Users']
        }
    });
