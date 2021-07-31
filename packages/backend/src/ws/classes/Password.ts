import { blake2sHex } from "blakets";
import crypto from "crypto";

export default class Password {
    public static hash(password: string): string {
        const salt =
            process.env.PASSWORD_SALT ?? "";
        const hash = blake2sHex(`$BLAKE2s$${password}$${salt}`);
        return `BLAKE2s$${hash}$${salt}`;
    }

    public static validate(newPass: string, hashed: string): boolean {
        return crypto.timingSafeEqual(
            Buffer.from(hashed),
            Buffer.from(Password.hash(newPass))
        );
    }
}
