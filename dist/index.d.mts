declare class RollResult {
    readonly raw: readonly number[];
    constructor(raw: number[]);
    get value(): number;
    getHits(threshold: number): number;
    getMisses(threshold: number): number;
    getNetHits(hit: number, miss: number): number;
    valueOf(): number;
}
declare class MultiRollResult {
    readonly results: readonly RollResult[];
    constructor(results: RollResult[]);
    get highest(): RollResult;
    get lowest(): RollResult;
}
declare function roll(count: number, sides: number): RollResult;
declare function rollMulti(count: number, sides: number, rolls: number): MultiRollResult;
declare function rollAdvantage(count: number, sides: number): RollResult;
declare function rollDisadvantage(count: number, sides: number): RollResult;

declare class RollQueryItem {
    count: number;
    sides: number;
    negative: boolean;
    lastResult: RollResult | null;
    constructor(count: number, sides: number, negative?: boolean);
    private get rawMax();
    get min(): number;
    get max(): number;
    get lastValue(): number | null;
    roll(): number;
    rollMulti(rolls: number): MultiRollResult;
    rollAdvantage(): number;
    rollDisadvantage(): number;
    toString(forceSign?: boolean): string;
}
type RollQueryOptions = {
    items?: RollQueryItem[];
    constant?: number;
};
declare class RollQuery {
    items: RollQueryItem[];
    constant: number;
    constructor({ items, constant }?: RollQueryOptions);
    static parse(query: string): RollQuery | null;
    get min(): number;
    get max(): number;
    get lastValue(): number | null;
    roll(): number;
    rollAdvantage(): number;
    rollDisadvantage(): number;
    toString(): string;
}

declare const RollQueryPattern: RegExp;
/**
 * Includes the `sign`, `count`, and `sides` groups
 *
 * If `count` is null, the item is a constant of value `sides`
 */
declare const RollQueryItemPattern: RegExp;

export { MultiRollResult, RollQuery, RollQueryItem, RollQueryItemPattern, RollQueryOptions, RollQueryPattern, RollResult, roll, rollAdvantage, rollDisadvantage, rollMulti };
