declare class RollResult {
    readonly raw: readonly number[];
    constructor(raw: number[]);
    get value(): number;
    valueOf(): number;
}
declare function roll(count: number, sides: number): RollResult;

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
    toString(): string;
}

declare const RollQueryPattern: RegExp;
/**
 * Includes the `sign`, `count`, and `sides` groups
 *
 * If `count` is null, the item is a constant of value `sides`
 */
declare const RollQueryItemPattern: RegExp;

export { RollQuery, RollQueryItem, RollQueryItemPattern, RollQueryOptions, RollQueryPattern, RollResult, roll };
