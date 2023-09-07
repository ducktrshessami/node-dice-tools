type RollMethod = (sides: number) => number;
declare function setRollMethod(method: RollMethod | null): void;
declare function getRollMethod(): RollMethod;
type Bounds = [number, number];
type ExplodeOption = boolean | number | Bounds | Readonly<Bounds>;
declare class RollResult {
    readonly explode: Readonly<ExplodeOption>;
    readonly raw: readonly number[];
    constructor(raw: number[], explode: Readonly<ExplodeOption>);
    get value(): number;
    getHits(threshold: number): number;
    getMisses(threshold: number): number;
    getNetHits(hit: number, miss: number): number;
    valueOf(): number;
}
declare class MultiRollResult {
    readonly results: readonly RollResult[];
    constructor(results: RollResult[]);
    get explode(): Readonly<ExplodeOption>;
    get highest(): RollResult;
    get lowest(): RollResult;
}
declare function roll(count: number, sides: number, explode?: ExplodeOption): RollResult;
declare function rollMulti(count: number, sides: number, rolls: number, explode?: ExplodeOption): MultiRollResult;
declare function rollAdvantage(count: number, sides: number, explode?: ExplodeOption): RollResult;
declare function rollDisadvantage(count: number, sides: number, explode?: ExplodeOption): RollResult;

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
    roll(explode?: ExplodeOption): number;
    rollMulti(rolls: number, explode?: ExplodeOption): MultiRollResult;
    rollAdvantage(explode?: ExplodeOption): number;
    rollDisadvantage(explode?: ExplodeOption): number;
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
    roll(explode?: ExplodeOption): number;
    rollAdvantage(explode?: ExplodeOption): number;
    rollDisadvantage(explode?: ExplodeOption): number;
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
