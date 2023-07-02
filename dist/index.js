"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  RollQuery: () => RollQuery,
  RollQueryItem: () => RollQueryItem,
  RollQueryItemPattern: () => RollQueryItemPattern,
  RollQueryPattern: () => RollQueryPattern,
  RollResult: () => RollResult,
  roll: () => roll
});
module.exports = __toCommonJS(src_exports);

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
  rollAdvantage() {
    return this.items.reduce((result, item) => result + item.rollAdvantage(), this.constant);
  }
  rollDisadvantage() {
    return this.items.reduce((result, item) => result + item.rollDisadvantage(), this.constant);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  RollQuery,
  RollQueryItem,
  RollQueryItemPattern,
  RollQueryPattern,
  RollResult,
  roll
});
//# sourceMappingURL=index.js.map