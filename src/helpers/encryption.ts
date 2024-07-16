import crypto from "crypto";

export const sha512Encrypt = (string: string): string => {
    return crypto.createHash('sha512').update(string).digest('hex');
};