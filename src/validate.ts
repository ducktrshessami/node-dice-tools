import { RollQueryError } from "./error";

function validateDiceAttribute(n: number, label: string): void {
    if (n < 1 || Math.floor(n) !== n) {
        const value = typeof n === "string" ? `'${n}'` : n;
        throw new RollQueryError(`${label} must be a positive whole number. Received ${value}`);
    }
}

export function validateDiceAttributes(count: number, sides: number): void {
    validateDiceAttribute(count, "Dice count");
    validateDiceAttribute(sides, "Sides");
}
