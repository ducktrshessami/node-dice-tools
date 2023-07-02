// src/error.ts
var CustomError = class extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
};
var RollQueryError = class extends CustomError {
};

// src/validate.ts
var RollQueryPattern = /^(?:[+-]?\s*(?:\d*d)?\d+)(?:\s*[+-]\s*(?:\d*d)?\d+)*$/i;
var RollQueryItemPattern = /(?<sign>[+-])?\s*(?:(?<count>\d*)d)?(?<sides>\d+)/gi;
function validateDiceAttribute(n, label) {
  if (n < 1 || Math.floor(n) !== n) {
    const value = typeof n === "string" ? `'${n}'` : n;
    throw new RollQueryError(`${label} must be a positive whole number. Received ${value}`);
  }
}
function validateDiceAttributes(count, sides) {
  validateDiceAttribute(count, "Dice count");
  validateDiceAttribute(sides, "Sides");
}

// src/roll.ts
var RollResult = class {
  constructor(raw) {
    this.raw = Object.freeze(raw);
  }
  get value() {
    return this.raw.reduce((total, result) => total + result);
  }
  valueOf() {
    return this.value;
  }
};
function rawRoll(count, sides) {
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(Math.ceil(Math.random() * sides));
  }
  return new RollResult(result);
}
function roll(count, sides) {
  validateDiceAttributes(count, sides);
  return rawRoll(count, sides);
}

// src/query.ts
var RollQueryItem = class {
  constructor(count, sides, negative = false) {
    this.count = count;
    this.sides = sides;
    this.negative = negative;
    this.lastResult = null;
    validateDiceAttributes(count, sides);
  }
  get rawMax() {
    return this.count * this.sides;
  }
  get min() {
    return this.negative ? this.rawMax * -1 : this.count;
  }
  get max() {
    return this.negative ? this.count * -1 : this.rawMax;
  }
  get lastValue() {
    return this.lastResult ? this.lastResult.value * (this.negative ? -1 : 1) : null;
  }
  roll() {
    this.lastResult = rawRoll(this.count, this.sides);
    return this.lastValue;
  }
  toString(forceSign = false) {
    const sign = this.negative ? "-" : forceSign ? "+" : "";
    return `${sign}${this.count}d${this.sides}`;
  }
};
var RollQuery = class _RollQuery {
  constructor({ items, constant } = {}) {
    this.items = items ?? [];
    this.constant = constant ?? 0;
  }
  static parse(query) {
    if (!RollQueryPattern.test(query)) {
      return null;
    }
    const q = new _RollQuery();
    const matches = query.matchAll(RollQueryItemPattern);
    for (const match of matches) {
      if (match.groups?.count == null) {
        q.constant += parseInt(match.groups.sides) * (match.groups.sign === "-" ? -1 : 1);
      } else
        try {
          q.items.push(new RollQueryItem(
            match.groups.count ? parseInt(match.groups.count) : 1,
            parseInt(match.groups.sides),
            match.groups.sign === "-"
          ));
        } catch {
          return null;
        }
    }
    return q;
  }
  get min() {
    return this.items.reduce((min, item) => min + item.min, this.constant);
  }
  get max() {
    return this.items.reduce((max, item) => max + item.max, this.constant);
  }
  get lastValue() {
    let result = this.constant;
    for (const item of this.items) {
      if (item.lastValue == null) {
        return null;
      } else {
        result += item.lastValue;
      }
    }
    return result;
  }
  roll() {
    return this.items.reduce((result, item) => result + item.roll(), this.constant);
  }
  toString() {
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
};
export {
  RollQuery,
  RollQueryItem,
  RollQueryItemPattern,
  RollQueryPattern,
  RollResult,
  roll
};
//# sourceMappingURL=index.mjs.map