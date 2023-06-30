import { RollQueryError } from "./error";

export const RollQueryPattern = /^(?:[+-]?\s*(?:\d*d)?\d+)(?:\s*[+-]\s*(?:\d*d)?\d+)*$/i;
export const RollQueryItemPattern = /(?<sign>[+-])?\s*(?:(?<count>\d*)d)?(?<sides>\d+)/gi;

function validateAttribute(n: number, label: string): void {
    if (n < 1 || Math.floor(n) !== n) {
        const value = typeof n === "string" ? `'${n}'` : n;
        throw new RollQueryError(`${label} must be a positive whole number. Received ${value}`);
    }
}

export class RollQueryItem {
    constructor(
        public count: number,
        public sides: number,
        public negative: boolean = false
    ) {
        validateAttribute(count, "Dice count");
        validateAttribute(sides, "Sides");
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
}
