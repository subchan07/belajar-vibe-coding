import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { usersRoutes } from "./routes/users-routes";

const app = new Elysia()
    .use(swagger({
        path: '/swagger',
        documentation: {
            info: {
                title: "Belajar Vibe Coding API",
                version: "1.0.0",
                description: "Interactive API Documentation for Belajar Vibe Coding"
            },
            tags: [
                { name: 'Users', description: 'User Management' }
            ],
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT'
                    }
                }
            }
        }
    }))

    .use(usersRoutes)
    .get("/", () => "Hello Elysia")
    .get("/health", () => ({ status: "ok" }))
    .listen(3000);

console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
