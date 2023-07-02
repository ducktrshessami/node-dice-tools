import { RollQueryError, RollResultError } from "./error";

export const RollQueryPattern = /^(?:[+-]?\s*(?:\d*d)?\d+)(?:\s*[+-]\s*(?:\d*d)?\d+)*$/i;

/**
 * Includes the `sign`, `count`, and `sides` groups
 * 
 * If `count` is null, the item is a constant of value `sides`
 */
export const RollQueryItemPattern = /(?<sign>[+-])?\s*(?:(?<count>\d*)d)?(?<sides>\d+)/gi;

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

export function validateNonEmptyArray(arr: any[]): void {
    if (!arr.length) {
        throw new RollResultError(`Result array must not be empty`);
    }
}
