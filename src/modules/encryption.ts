import * as crypto from 'crypto';
export const hash = (password: string) => {
    return crypto.createHash('sha256').update(password).digest('hex');
}