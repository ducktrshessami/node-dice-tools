import { RollQueryError } from "./error";

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

export class RollQuery {
    items: RollQueryItem[];
    constant: number;

    constructor() {
        this.items = [];
        this.constant = 0;
    }
}
