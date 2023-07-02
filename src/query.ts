import { RollResult, rawRoll } from "./roll";
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

    roll(): number {
        this.lastResult = rawRoll(this.count, this.sides);
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

    get min(): number {
        return this.items.reduce((min, item) => min + item.min, this.constant);
    }

    get max(): number {
        return this.items.reduce((max, item) => max + item.max, this.constant);
    }

    get lastResult(): number | null {
        let result = this.constant;
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

    roll(): number {
        return this.items.reduce((result, item) => result + item.roll(), this.constant);
    }

    toString(): string {
        const constant = this.constant ? (this.constant < 0 ? "-" : "+") + this.constant : "";
        if (!this.items.length) {
            return constant;
        }
        let query = this.items[0].toString();
        for (let i = 1; i < this.items.length; i++) {
            query += this.items[i].toString(true);
        }
        return query + constant;
    }
}
