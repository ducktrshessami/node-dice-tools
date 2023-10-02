import {
    MultiRollResult,
    RollResult,
    rawRoll,
    rawRollMulti,
    ExplodeOption,
    resolveExplodeOption,
    isResolvedExplodeOption
} from "./roll";
import {
    RollQueryItemPattern,
    RollQueryPattern,
    validateDiceAttributes
} from "./validate";

export class RollQueryItem {
    public lastResult: RollResult | null;

    constructor(
        public count: number,
        public sides: number,
        public negative: boolean = false
    ) {
        this.lastResult = null;
        validateDiceAttributes(count, sides);
    }

    private get rawMax(): number {
        return this.count * this.sides;
    }

    get min(): number {
        return this.negative ? this.rawMax * -1 : this.count;
    }

    get max(): number {
        return this.negative ? this.count * -1 : this.rawMax;
    }

    get lastValue(): number | null {
        return this.lastResult ? this.lastResult.value * (this.negative ? -1 : 1) : null;
    }

    roll(explode?: ExplodeOption): number {
        const explodeOption = isResolvedExplodeOption(explode) ? explode ?? false : resolveExplodeOption(explode);
        this.lastResult = rawRoll(this.count, this.sides, explodeOption);
        return this.lastValue!;
    }

    rollMulti(rolls: number, explode?: ExplodeOption): MultiRollResult {
        const explodeOption = isResolvedExplodeOption(explode) ? explode ?? false : resolveExplodeOption(explode);
        const result = rawRollMulti(this.count, this.sides, rolls, explodeOption);
        this.lastResult = result.results[rolls - 1];
        return result;
    }

    rollAdvantage(explode?: ExplodeOption): number {
        const explodeOption = isResolvedExplodeOption(explode) ? explode ?? false : resolveExplodeOption(explode);
        const { highest } = rawRollMulti(this.count, this.sides, 2, explodeOption);
        this.lastResult = highest;
        return this.lastValue!;
    }

    rollDisadvantage(explode?: ExplodeOption): number {
        const explodeOption = isResolvedExplodeOption(explode) ? explode ?? false : resolveExplodeOption(explode);
        const { lowest } = rawRollMulti(this.count, this.sides, 2, explodeOption);
        this.lastResult = lowest;
        return this.lastValue!;
    }

    toString(forceSign: boolean = false): string {
        const sign = this.negative ? "-" : forceSign ? "+" : "";
        return `${sign}${this.count}d${this.sides}`;
    }
}

export type RollQueryOptions = {
    items?: RollQueryItem[];
    constant?: number;
};

export class RollQuery {
    public items: RollQueryItem[];
    public constant: number;

    constructor({ items, constant }: RollQueryOptions = {}) {
        this.items = items ?? [];
        this.constant = constant ?? 0;
    }

    static parse(query: string): RollQuery | null {
        if (!RollQueryPattern.test(query)) {
            return null;
        }
        const q = new RollQuery();
        const matches = query.matchAll(RollQueryItemPattern);
        for (const match of matches) {
            if (match.groups?.count == null) {
                q.constant += parseInt(match.groups!.sides) * (match.groups!.sign === "-" ? -1 : 1);
            }
            else try {
                q.items.push(new RollQueryItem(
                    match.groups.count ? parseInt(match.groups.count) : 1,
                    parseInt(match.groups.sides),
                    match.groups.sign === "-"
                ));
            }
            catch {
                return null;
            }
        }
        return q;
    }

    get minNat(): number {
        return this.items.reduce((min, item) => min + item.min, 0);
    }

    get min(): number {
        return this.minNat + this.constant;
    }

    get maxNat(): number {
        return this.items.reduce((max, item) => max + item.max, 0);
    }

    get max(): number {
        return this.maxNat + this.constant;
    }

    get lastNat(): number | null {
        let result = 0;
        for (const item of this.items) {
            if (item.lastValue == null) {
                return null;
            }
            else {
                result += item.lastValue;
            }
        }
        return result;
    }

    get lastValue(): number | null {
        const natural = this.lastNat;
        return natural == null ? null : natural + this.constant;
    }

    roll(explode?: ExplodeOption): number {
        const explodeOption = resolveExplodeOption(explode);
        return this.items.reduce((result, item) => result + item.roll(explodeOption), this.constant);
    }

    rollAdvantage(explode?: ExplodeOption): number {
        const explodeOption = resolveExplodeOption(explode);
        return this.items.reduce((result, item) => result + item.rollAdvantage(explodeOption), this.constant);
    }

    rollDisadvantage(explode?: ExplodeOption): number {
        const explodeOption = resolveExplodeOption(explode);
        return this.items.reduce((result, item) => result + item.rollDisadvantage(explodeOption), this.constant);
    }

    toString(): string {
        if (!this.items.length) {
            return this.constant.toString();
        }
        const constant = this.constant ?
            this.constant < 0 ?
                this.constant.toString() :
                "+" + this.constant :
            "";
        let query = this.items[0].toString();
        for (let i = 1; i < this.items.length; i++) {
            query += this.items[i].toString(true);
        }
        return query + constant;
    }
}
