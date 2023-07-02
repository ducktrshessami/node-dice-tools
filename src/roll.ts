import { RollResultParseError } from "./error";
import { validateDiceAttributes } from "./validate";

export class RollResult {
    public readonly raw: readonly number[];

    constructor(raw: number[]) {
        this.raw = Object.freeze(raw);
    }

    get value(): number {
        return this.raw.reduce((total, result) => total + result);
    }

    getHits(threshold: number): number {
        return this.raw.reduce((hits, result) => {
            if (result >= threshold) {
                hits++;
            }
            return hits;
        }, 0);
    }

    getMisses(threshold: number): number {
        return this.raw.reduce((misses, result) => {
            if (result <= threshold) {
                misses++;
            }
            return misses;
        }, 0);
    }

    getNetHits(hit: number, miss: number): number {
        if (hit <= miss) {
            throw new RollResultParseError(`Hit threshold must be greater than miss threshold. Received hit:${hit} miss:${miss}`);
        }
        return this.raw.reduce((hits, result) => {
            if (result >= hit) {
                hits++;
            }
            else if (result <= miss) {
                hits--;
            }
            return hits;
        }, 0);
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
