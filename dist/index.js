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
function rawRoll(count, sides) {
  let result = 0;
  for (let i = 0; i < count; i++) {
    result += Math.ceil(Math.random() * sides);
  }
  return result;
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
  roll() {
    this.lastResult = rawRoll(this.count, this.sides) * (this.negative ? -1 : 1);
    return this.lastResult;
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
  roll
});
//# sourceMappingURL=index.js.map