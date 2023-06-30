import { RollQueryError } from "./error";

export function validateDiceAttribute(n: number, label: string): void {
    if (n < 1 || Math.floor(n) !== n) {
        const value = typeof n === "string" ? `'${n}'` : n;
        throw new RollQueryError(`${label} must be a positive whole number. Received ${value}`);
    }
}
