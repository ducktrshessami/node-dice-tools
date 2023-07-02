import { validateDiceAttributes } from "./validate";

export class RollResult {
    public readonly raw: readonly number[];

    constructor(raw: number[]) {
        this.raw = Object.freeze(raw);
    }

    get value(): number {
        return this.raw.reduce((total, result) => total + result);
    }

    valueOf(): number {
        return this.value;
    }
}

export function rawRoll(count: number, sides: number): RollResult {
    const result = [];
    for (let i = 0; i < count; i++) {
        result.push(Math.ceil(Math.random() * sides));
    }
    return new RollResult(result);
}

export function roll(count: number, sides: number): RollResult {
    validateDiceAttributes(count, sides);
    return rawRoll(count, sides);
}
