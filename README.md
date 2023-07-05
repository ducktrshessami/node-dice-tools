# node-dice-tools
Standard dice notation parsing and rolling

# Usage
```js
const { RollQuery, roll } = require("dice-tools");

const query = RollQuery.parse("-2d8+3+10d6+7+12d4");
console.log(`${query.roll()}/${query.max}`); // x/116

const result = roll(16, 6); // 16d6
console.log(result.getHits(5)); // >=5 success
```
