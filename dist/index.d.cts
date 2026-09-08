//#region src/roll.d.ts
type RollMethod = (sides: number) => number;
export declare function setRollMethod(method: RollMethod | null): void;
export declare function getRollMethod(): RollMethod;
type Bounds = [number, number];
type ExplodeOption = boolean | number | Bounds | Readonly<Bounds>;
export declare class RollResult {
  readonly explode: Readonly<ExplodeOption>;
  readonly raw: readonly number[];
  constructor(raw: number[], explode: Readonly<ExplodeOption>);
  get value(): number;
  getHits(threshold: number): number;
  getMisses(threshold: number): number;
  getNetHits(hit: number, miss: number): number;
  valueOf(): number;
}
export declare class MultiRollResult {
  readonly results: readonly RollResult[];
  constructor(results: RollResult[]);
  get explode(): Readonly<ExplodeOption>;
  get highest(): RollResult;
  get lowest(): RollResult;
}
export declare function roll(count: number, sides: number, explode?: ExplodeOption): RollResult;
export declare function rollMulti(count: number, sides: number, rolls: number, explode?: ExplodeOption): MultiRollResult;
export declare function rollAdvantage(count: number, sides: number, explode?: ExplodeOption): RollResult;
export declare function rollDisadvantage(count: number, sides: number, explode?: ExplodeOption): RollResult;
//#endregion
//#region src/query.d.ts
export declare class RollQueryItem {
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
export type RollQueryOptions = {
  items?: RollQueryItem[];
  constant?: number;
};
export declare class RollQuery {
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
//#endregion
//#region src/validate.d.ts
export declare const RollQueryPattern: RegExp;
/**
 * Includes the `sign`, `count`, and `sides` groups
 *
 * If `count` is null, the item is a constant of value `sides`
 */
export declare const RollQueryItemPattern: RegExp;
//#endregion
export type { Bounds, RollMethod };
//# sourceMappingURL=index.d.cts.map