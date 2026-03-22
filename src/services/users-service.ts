import { db } from "../db";
import { users, sessions } from "../db/schema";
import { eq } from "drizzle-orm";

export class UsersService {
    /**
     * Mendaftarkan pengguna baru ke dalam sistem.
     * Akan memeriksa apakah email sudah digunakan, melakukan hashing pada password,
     * dan menyimpan data pengguna baru ke database.
     * 
     * @param data Objek yang berisi name, email, dan password dari request body
     * @returns Objek dengan status keberhasilan
     * @throws Error jika email sudah terdaftar
     */
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

    /**
     * Memproses otentikasi login pengguna.
     * Mencari pengguna berdasarkan email, memverifikasi password dengan hash yang tersimpan,
     * dan menghasilkan session token (UUID) jika berhasil.
     * 
     * @param data Objek yang berisi email dan password dari request body
     * @returns Objek berisi session token
     * @throws Error jika email tidak ditemukan atau password salah
     */
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

    /**
     * Mengambil data profil klien/pengguna yang sedang login berdasarkan token sesi aktif.
     * Fungsi ini memvalidasi token yang diberikan terhadap database session.
     * 
     * @param token String Bearer token otentikasi
     * @returns Data profil pengguna (id, name, email, created_at) tanpa password
     * @throws Error (Unauthorized) jika token tidak valid atau tidak ditemukan
     */
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

    /**
     * Memproses proses keluar (logout) pengguna.
     * Menghapus catatan token session dari database sehingga token tersebut
     * tidak dapat digunakan kembali untuk otentikasi.
     * 
     * @param token String Bearer token otentikasi yang ingin dihapus (invalidated)
     * @returns Objek dengan status keberhasilan
     * @throws Error (Unauthorized) jika token tersebut sebenarnya sudah tidak ada/valid
     */
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
