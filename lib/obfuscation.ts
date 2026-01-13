
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

// Use a consistent secret for ID obfuscation. 
// In production, this should be in env vars. 
// For now, we'll use a hardcoded fallback or generated one if not present,
// but for persistence across restarts/installs without env, we need something stable.
// Let's rely on a fixed string for this project context since user requested "any random encryption".
const SECRET_KEY = process.env.ID_ENCRYPTION_KEY || "galing-pup-secure-id-key-32-bytes!!";
const IV_LENGTH = 16;
// Ensure key is 32 bytes for aes-256-cbc
const key = Buffer.from(SECRET_KEY.padEnd(32, "0").slice(0, 32));

export function encryptId(id: number | string, userId?: number | string): string {
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv("aes-256-cbc", key, iv);

    // Create payload object
    const payload = JSON.stringify({ d: id, u: userId });

    let encrypted = cipher.update(payload);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString("hex") + ":" + encrypted.toString("hex");
}

export function decryptId(text: string): { docId: number; userId?: string | number } | null {
    try {
        const textParts = text.split(":");
        const iv = Buffer.from(textParts.shift() as string, "hex");
        const encryptedText = Buffer.from(textParts.join(":"), "hex");
        const decipher = createDecipheriv("aes-256-cbc", key, iv);

        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);

        const payload = JSON.parse(decrypted.toString());

        return {
            docId: Number(payload.d),
            userId: payload.u
        };
    } catch (error) {
        return null;
    }
}
