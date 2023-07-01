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
function validateDiceAttribute(n, label) {
  if (n < 1 || Math.floor(n) !== n) {
    const value = typeof n === "string" ? `'${n}'` : n;
    throw new RollQueryError(`${label} must be a positive whole number. Received ${value}`);
  }
}

// src/roll.ts
function rawRoll(count, sides) {
  let result = 0;
  for (let i = 0; i < count; i++) {
    result += Math.ceil(Math.random() * sides);
  }
  return result;
}
function roll(count, sides) {
  validateDiceAttribute(count, "Dice count");
  validateDiceAttribute(sides, "Sides");
  return rawRoll(count, sides);
}

// src/query.ts
var RollQueryPattern = /^(?:[+-]?\s*(?:\d*d)?\d+)(?:\s*[+-]\s*(?:\d*d)?\d+)*$/i;
var RollQueryItemPattern = /(?<sign>[+-])?\s*(?:(?<count>\d*)d)?(?<sides>\d+)/gi;
var RollQueryItem = class {
  constructor(count, sides, negative = false) {
    this.count = count;
    this.sides = sides;
    this.negative = negative;
    this.lastResult = null;
    validateDiceAttribute(count, "Dice count");
    validateDiceAttribute(sides, "Sides");
  }
  roll() {
    this.lastResult = rawRoll(this.count, this.sides) * (this.negative ? -1 : 1);
    return this.lastResult;
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
  get lastResult() {
    let result = this.constant;
    for (const item of this.items) {
      if (item.lastResult == null) {
        return null;
      } else {
        result += item.lastResult;
      }
    }
    return result;
  }
  roll() {
    return this.constant + this.items.reduce((result, item) => result + item.roll(), 0);
  }
};
export {
  RollQuery,
  RollQueryItem,
  RollQueryItemPattern,
  RollQueryPattern,
  roll
};
//# sourceMappingURL=index.mjs.map