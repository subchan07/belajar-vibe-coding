import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

export class UsersService {
    static async register(data: any) {
        const { name, email, password } = data;

        // Check if email already exists
        const existingUser = await db.query.users.findFirst({
            where: eq(users.email, email),
        });

        if (existingUser) {
            throw new Error("Email sudah terdaftar");
        }

        // Hash password using Bun's native bcrypt
        const hashedPassword = await Bun.password.hash(password);

        // Insert new user
        await db.insert(users).values({
            name,
            email,
            password: hashedPassword,
        });

        return { data: "OK" };
    }
}
