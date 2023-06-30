import { validateDiceAttribute } from "./validate";

export function rawRoll(count: number, sides: number): number {
    let result = 0;
    for (let i = 0; i < count; i++) {
        result += Math.ceil(Math.random() * sides);
    }
    return result;
}

export function roll(count: number, sides: number): number {
    validateDiceAttribute(count, "Dice count");
    validateDiceAttribute(sides, "Sides");
    return rawRoll(count, sides);
}
