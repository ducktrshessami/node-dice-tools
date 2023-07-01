import { rawRoll } from "./roll";
import { validateDiceAttribute } from "./validate";

export const RollQueryPattern = /^(?:[+-]?\s*(?:\d*d)?\d+)(?:\s*[+-]\s*(?:\d*d)?\d+)*$/i;

/**
 * Includes the `sign`, `count`, and `sides` groups
 * 
 * If `count` is null, the item is a constant of value `sides`
 */
export const RollQueryItemPattern = /(?<sign>[+-])?\s*(?:(?<count>\d*)d)?(?<sides>\d+)/gi;

export class RollQueryItem {
    public lastResult: number | null;

    constructor(
        public count: number,
        public sides: number,
        public negative: boolean = false
    ) {
        this.lastResult = null;
        validateDiceAttribute(count, "Dice count");
        validateDiceAttribute(sides, "Sides");
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

    roll(): number {
        return this.constant + this.items.reduce((result, item) => result + item.roll(), 0);
    }
}
