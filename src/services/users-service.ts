import { db } from "../db";
import { users, sessions } from "../db/schema";
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

    static async login(data: any) {
        const { email, password } = data;

        // Find user by email
        const user = await db.query.users.findFirst({
            where: eq(users.email, email),
        });

        if (!user) {
            throw new Error("Email atau password salah");
        }

        // Verify password
        const isPasswordValid = await Bun.password.verify(password, user.password);

        if (!isPasswordValid) {
            throw new Error("Email atau password salah");
        }

        // Generate session token (UUID)
        const token = crypto.randomUUID();

        // Store session in database
        await db.insert(sessions).values({
            token,
            userId: user.id as any,
        });

        return { data: token };
    }

    static async getCurrentUser(token: string) {
        // Find session and user
        const sessionWithUser = await db.query.sessions.findFirst({
            where: eq(sessions.token, token),
        });

        if (!sessionWithUser) {
            throw new Error("Unauthorized");
        }

        const user = await db.query.users.findFirst({
            where: eq(users.id, sessionWithUser.userId),
        });

        if (!user) {
            throw new Error("Unauthorized");
        }

        return {
            data: {
                id: Number(user.id),
                name: user.name,
                email: user.email,
                created_at: user.createdAt,
            }
        };
    }

    static async logout(token: string) {
        // Find session
        const session = await db.query.sessions.findFirst({
            where: eq(sessions.token, token),
        });

        if (!session) {
            throw new Error("Unauthorized");
        }

        // Delete session
        await db.delete(sessions).where(eq(sessions.token, token));

        return { data: "OK" };
    }
}
