import { Elysia } from "elysia";

export const authPlugin = (app: Elysia) => 
    app
        .derive(({ headers }) => {
            const authHeader = headers.authorization;
            
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                return {
                    token: null as string | null
                };
            }

            const token = authHeader.split(" ")[1];
            return {
                token
            };
        })
        .onBeforeHandle(({ token, set }) => {
            if (!token) {
                set.status = 401;
                return { error: "Unauthorized" };
            }
        });
