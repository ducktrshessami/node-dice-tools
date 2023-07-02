import { RollResultParseError } from "./error";
import { validateDiceAttributes, validateNonEmptyArray } from "./validate";

export class RollResult {
    public readonly raw: readonly number[];

    constructor(raw: number[]) {
        validateNonEmptyArray(raw);
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

export class MultiRollResult {
    public readonly results: readonly RollResult[]

    constructor(results: RollResult[]) {
        validateNonEmptyArray(results);
        this.results = Object.freeze(results);
    }

    get highest(): RollResult {
        return this.results.reduce((highest, result) => result.value > highest.value ? result : highest);
    }

    get lowest(): RollResult {
        return this.results.reduce((lowest, result) => result.value < lowest.value ? result : lowest);
    }
}

export type Bounds = [number, number];

export function rawRoll(
    count: number,
    sides: number,
    explode?: number | Bounds
): RollResult {
    const result: number[] = [];
    for (let i = 0; i < count; i++) {
        const value = Math.ceil(Math.random() * sides);
        result.push(value);
        if (
            explode && (
                typeof explode === "number" ?
                    value === explode : (
                        value >= Math.min(...explode) &&
                        value <= Math.max(...explode)
                    )
            )
        ) {
            i--;
        }
    }
    return new RollResult(result);
}

export function roll(
    count: number,
    sides: number,
    explode?: number | Bounds
): RollResult {
    validateDiceAttributes(count, sides);
    return rawRoll(count, sides, explode);
}

export function rawRollMulti(
    count: number,
    sides: number,
    rolls: number,
    explode?: number | Bounds
): MultiRollResult {
    const results: RollResult[] = [];
    for (let i = 0; i < rolls; i++) {
        results.push(rawRoll(count, sides, explode));
    }
    return new MultiRollResult(results);
}

export function rollMulti(
    count: number,
    sides: number,
    rolls: number,
    explode?: number | Bounds
): MultiRollResult {
    validateDiceAttributes(count, sides);
    return rawRollMulti(count, sides, rolls, explode);
}

export function rollAdvantage(count: number, sides: number, explode?: number | Bounds): RollResult {
    const { highest } = rollMulti(count, sides, 2, explode);
    return highest;
}

export function rollDisadvantage(count: number, sides: number, explode?: number | Bounds): RollResult {
    const { lowest } = rollMulti(count, sides, 2, explode);
    return lowest;
}