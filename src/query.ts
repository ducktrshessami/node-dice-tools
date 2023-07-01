import { rawRoll } from "./roll";
import {
    RollQueryItemPattern,
    RollQueryPattern,
    validateDiceAttributes
} from "./validate";

export class RollQueryItem {
    public lastResult: number | null;

    constructor(
        public count: number,
        public sides: number,
        public negative: boolean = false
    ) {
        this.lastResult = null;
        validateDiceAttributes(count, sides);
    }

    roll(): number {
        this.lastResult = rawRoll(this.count, this.sides) * (this.negative ? -1 : 1);
        return this.lastResult;
    }
}

export type RollQueryOptions = {
    items?: RollQueryItem[];
    constant?: number;
};

export class RollQuery {
    items: RollQueryItem[];
    constant: number;

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

    get lastResult(): number | null {
        let result = this.constant;
        for (const item of this.items) {
            if (item.lastResult == null) {
                return null;
            }
            else {
                result += item.lastResult;
            }
        }
        return result;
    }

    roll(): number {
        return this.constant + this.items.reduce((result, item) => result + item.roll(), 0);
    }
}
