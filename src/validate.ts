import { RollQueryError, RollResultError } from "./error";

export const RollQueryPattern = /^(?:[+-]?\s*(?:\d*d)?\d+)(?:\s*[+-]\s*(?:\d*d)?\d+)*$/i;

/**
 * Includes the `sign`, `count`, and `sides` groups
 * 
 * If `count` is null, the item is a constant of value `sides`
 */
export const RollQueryItemPattern = /(?<sign>[+-])?\s*(?:(?<count>\d*)d)?(?<sides>\d+)/gi;

function validateDiceAttribute(
    n: number,
    lowerBound: number,
    message: string
): void {
    if (n < lowerBound || Math.floor(n) !== n) {
        const value = typeof n === "string" ? `'${n}'` : n;
        throw new RollQueryError(`${message}. Received ${value}`);
    }
}

export function validateDiceAttributes(count: number, sides: number): void {
    validateDiceAttribute(count, 1, "Dice count must be a positive whole number");
    validateDiceAttribute(sides, 2, "Sides must be >= 2 and a whole number");
}

export function validateNonEmptyArray(arr: any[]): void {
    if (!arr.length) {
        throw new RollResultError(`Result array must not be empty`);
    }
}
