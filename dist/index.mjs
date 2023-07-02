// src/error.ts
var CustomError = class extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
};
var RollQueryError = class extends CustomError {
};
var RollResultError = class extends CustomError {
};
var RollResultParseError = class extends CustomError {
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
function validateNonEmptyArray(arr) {
  if (!arr.length) {
    throw new RollResultError(`Result array must not be empty`);
  }
}

// src/roll.ts
var RollResult = class {
  constructor(raw) {
    validateNonEmptyArray(raw);
    this.raw = Object.freeze(raw);
  }
  get value() {
    return this.raw.reduce((total, result) => total + result);
  }
  getHits(threshold) {
    return this.raw.reduce((hits, result) => {
      if (result >= threshold) {
        hits++;
      }
      return hits;
    }, 0);
  }
  getMisses(threshold) {
    return this.raw.reduce((misses, result) => {
      if (result <= threshold) {
        misses++;
      }
      return misses;
    }, 0);
  }
  getNetHits(hit, miss) {
    if (hit <= miss) {
      throw new RollResultParseError(`Hit threshold must be greater than miss threshold. Received hit:${hit} miss:${miss}`);
    }
    return this.raw.reduce((hits, result) => {
      if (result >= hit) {
        hits++;
      } else if (result <= miss) {
        hits--;
      }
      return hits;
    }, 0);
  }
  valueOf() {
    return this.value;
  }
};
var MultiRollResult = class {
  constructor(results) {
    validateNonEmptyArray(results);
    this.results = Object.freeze(results);
  }
  get highest() {
    return this.results.reduce((highest, result) => result.value > highest.value ? result : highest);
  }
  get lowest() {
    return this.results.reduce((lowest, result) => result.value < lowest.value ? result : lowest);
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
function rawRollMulti(count, sides, rolls) {
  const results = [];
  for (let i = 0; i < rolls; i++) {
    results.push(rawRoll(count, sides));
  }
  return new MultiRollResult(results);
}
function rollMulti(count, sides, rolls) {
  validateDiceAttributes(count, sides);
  return rawRollMulti(count, sides, rolls);
}
function rollAdvantage(count, sides) {
  const { highest } = rollMulti(count, sides, 2);
  return highest;
}
function rollDisadvantage(count, sides) {
  const { lowest } = rollMulti(count, sides, 2);
  return lowest;
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
  rollMulti(rolls) {
    const result = rawRollMulti(this.count, this.sides, rolls);
    this.lastResult = result.results[rolls - 1];
    return result;
  }
  rollAdvantage() {
    const { highest } = rawRollMulti(this.count, this.sides, 2);
    this.lastResult = highest;
    return this.lastValue;
  }
  rollDisadvantage() {
    const { lowest } = rawRollMulti(this.count, this.sides, 2);
    this.lastResult = lowest;
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
  get minNat() {
    return this.items.reduce((min, item) => min + item.min, 0);
  }
  get min() {
    return this.minNat + this.constant;
  }
  get maxNat() {
    return this.items.reduce((max, item) => max + item.max, 0);
  }
  get max() {
    return this.maxNat + this.constant;
  }
  get lastNat() {
    let result = 0;
    for (const item of this.items) {
      if (item.lastValue == null) {
        return null;
      } else {
        result += item.lastValue;
      }
    }
    return result;
  }
  get lastValue() {
    const natural = this.lastNat;
    return natural == null ? null : natural + this.constant;
  }
  roll() {
    return this.items.reduce((result, item) => result + item.roll(), this.constant);
  }
  rollAdvantage() {
    return this.items.reduce((result, item) => result + item.rollAdvantage(), this.constant);
  }
  rollDisadvantage() {
    return this.items.reduce((result, item) => result + item.rollDisadvantage(), this.constant);
  }
  toString() {
    if (!this.items.length) {
      return this.constant < 0 ? "-" + this.constant : this.constant.toString();
    }
    const constant = this.constant ? (this.constant < 0 ? "-" : "+") + this.constant : "";
    let query = this.items[0].toString();
    for (let i = 1; i < this.items.length; i++) {
      query += this.items[i].toString(true);
    }
    return query + constant;
  }
};
export {
  MultiRollResult,
  RollQuery,
  RollQueryItem,
  RollQueryItemPattern,
  RollQueryPattern,
  RollResult,
  roll,
  rollAdvantage,
  rollDisadvantage,
  rollMulti
};
//# sourceMappingURL=index.mjs.map