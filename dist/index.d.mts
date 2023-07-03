type RollMethod = (sides: number) => number;
declare function setRollMethod(method: RollMethod): void;
declare function getRollMethod(): RollMethod;
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
type Bounds = [number, number];
declare function roll(count: number, sides: number, explode?: number | Bounds): RollResult;
declare function rollMulti(count: number, sides: number, rolls: number, explode?: number | Bounds): MultiRollResult;
declare function rollAdvantage(count: number, sides: number, explode?: number | Bounds): RollResult;
declare function rollDisadvantage(count: number, sides: number, explode?: number | Bounds): RollResult;

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
    roll(explode?: number | Bounds): number;
    rollMulti(rolls: number, explode?: number | Bounds): MultiRollResult;
    rollAdvantage(explode?: number | Bounds): number;
    rollDisadvantage(explode?: number | Bounds): number;
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
    get minNat(): number;
    get min(): number;
    get maxNat(): number;
    get max(): number;
    get lastNat(): number | null;
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

export { Bounds, MultiRollResult, RollMethod, RollQuery, RollQueryItem, RollQueryItemPattern, RollQueryOptions, RollQueryPattern, RollResult, getRollMethod, roll, rollAdvantage, rollDisadvantage, rollMulti, setRollMethod };
