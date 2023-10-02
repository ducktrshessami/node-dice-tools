var CustomError=class extends Error{constructor(message){super(message),this.name=this.constructor.name}},RollQueryError=class extends CustomError{},RollResultError=class extends CustomError{},RollResultParseError=class extends CustomError{};var RollQueryPattern=/^(?:[+-]?\s*(?:\d*d)?\d+)(?:\s*[+-]\s*(?:\d*d)?\d+)*$/i,RollQueryItemPattern=/(?<sign>[+-])?\s*(?:(?<count>\d*)d)?(?<sides>\d+)/gi;function validateDiceAttribute(n,lowerBound,message){if(n<lowerBound||Math.floor(n)!==n){let value=typeof n=="string"?`'${n}'`:n;throw new RollQueryError(`${message}. Received ${value}`)}}function validateDiceAttributes(count,sides){validateDiceAttribute(count,1,"Dice count must be a positive whole number"),validateDiceAttribute(sides,2,"Sides must be >= 2 and a whole number")}function validateNonEmptyArray(arr){if(!arr.length)throw new RollResultError("Result array must not be empty")}var rollMethod=null;function setRollMethod(method){rollMethod=method}function defaultRollMethod(sides){return Math.ceil(Math.random()*sides)}function getRollMethod(){return rollMethod??defaultRollMethod}var RollResult=class{constructor(raw,explode){this.explode=explode;validateNonEmptyArray(raw),this.raw=Object.freeze(raw)}get value(){return this.raw.reduce((total,result)=>total+result)}getHits(threshold){return this.raw.reduce((hits,result)=>(result>=threshold&&hits++,hits),0)}getMisses(threshold){return this.raw.reduce((misses,result)=>(result<=threshold&&misses++,misses),0)}getNetHits(hit,miss){if(hit<=miss)throw new RollResultParseError(`Hit threshold must be greater than miss threshold. Received hit:${hit} miss:${miss}`);return this.raw.reduce((hits,result)=>(result>=hit?hits++:result<=miss&&hits--,hits),0)}valueOf(){return this.value}},MultiRollResult=class{constructor(results){validateNonEmptyArray(results),this.results=Object.freeze(results)}get explode(){return this.results.find(result2=>result2.explode!==!1)?.explode??!1}get highest(){return this.results.reduce((highest,result)=>result.value>highest.value?result:highest)}get lowest(){return this.results.reduce((lowest,result)=>result.value<lowest.value?result:lowest)}};function resolveExplodeOption(explode){return Array.isArray(explode)?Object.freeze(explode.slice(0,2).sort()):explode??!1}function isResolvedExplodeOption(explode){return Array.isArray(explode)?Object.isFrozen(explode):!0}function isExplode(value,sides,explode){if(!explode)return!1;switch(typeof explode){case"boolean":return value===sides;case"number":return value===explode;default:return value>=explode[0]&&value<=explode[1]}}function rawRoll(count,sides,explode){let method=getRollMethod(),result=[];for(let i=0;i<count;i++){let value=method(sides);result.push(value),isExplode(value,sides,explode)&&i--}return new RollResult(result,explode)}function roll(count,sides,explode){return validateDiceAttributes(count,sides),rawRoll(count,sides,resolveExplodeOption(explode))}function rawRollMulti(count,sides,rolls,explode){let results=[];for(let i=0;i<rolls;i++)results.push(rawRoll(count,sides,explode));return new MultiRollResult(results)}function rollMulti(count,sides,rolls,explode){return validateDiceAttributes(count,sides),rawRollMulti(count,sides,rolls,resolveExplodeOption(explode))}function rollAdvantage(count,sides,explode){let{highest}=rollMulti(count,sides,2,explode);return highest}function rollDisadvantage(count,sides,explode){let{lowest}=rollMulti(count,sides,2,explode);return lowest}var RollQueryItem=class{constructor(count,sides,negative=!1){this.count=count;this.sides=sides;this.negative=negative;this.lastResult=null,validateDiceAttributes(count,sides)}get rawMax(){return this.count*this.sides}get min(){return this.negative?this.rawMax*-1:this.count}get max(){return this.negative?this.count*-1:this.rawMax}get lastValue(){return this.lastResult?this.lastResult.value*(this.negative?-1:1):null}roll(explode){let explodeOption=isResolvedExplodeOption(explode)?explode??!1:resolveExplodeOption(explode);return this.lastResult=rawRoll(this.count,this.sides,explodeOption),this.lastValue}rollMulti(rolls,explode){let explodeOption=isResolvedExplodeOption(explode)?explode??!1:resolveExplodeOption(explode),result=rawRollMulti(this.count,this.sides,rolls,explodeOption);return this.lastResult=result.results[rolls-1],result}rollAdvantage(explode){let explodeOption=isResolvedExplodeOption(explode)?explode??!1:resolveExplodeOption(explode),{highest}=rawRollMulti(this.count,this.sides,2,explodeOption);return this.lastResult=highest,this.lastValue}rollDisadvantage(explode){let explodeOption=isResolvedExplodeOption(explode)?explode??!1:resolveExplodeOption(explode),{lowest}=rawRollMulti(this.count,this.sides,2,explodeOption);return this.lastResult=lowest,this.lastValue}toString(forceSign=!1){return`${this.negative?"-":forceSign?"+":""}${this.count}d${this.sides}`}},RollQuery=class _RollQuery{constructor({items,constant}={}){this.items=items??[],this.constant=constant??0}static parse(query){if(!RollQueryPattern.test(query))return null;let q=new _RollQuery,matches=query.matchAll(RollQueryItemPattern);for(let match of matches)if(match.groups?.count==null)q.constant+=parseInt(match.groups.sides)*(match.groups.sign==="-"?-1:1);else try{q.items.push(new RollQueryItem(match.groups.count?parseInt(match.groups.count):1,parseInt(match.groups.sides),match.groups.sign==="-"))}catch{return null}return q}get minNat(){return this.items.reduce((min,item)=>min+item.min,0)}get min(){return this.minNat+this.constant}get maxNat(){return this.items.reduce((max,item)=>max+item.max,0)}get max(){return this.maxNat+this.constant}get lastNat(){let result=0;for(let item of this.items){if(item.lastValue==null)return null;result+=item.lastValue}return result}get lastValue(){let natural=this.lastNat;return natural==null?null:natural+this.constant}roll(explode){let explodeOption=resolveExplodeOption(explode);return this.items.reduce((result,item)=>result+item.roll(explodeOption),this.constant)}rollAdvantage(explode){let explodeOption=resolveExplodeOption(explode);return this.items.reduce((result,item)=>result+item.rollAdvantage(explodeOption),this.constant)}rollDisadvantage(explode){let explodeOption=resolveExplodeOption(explode);return this.items.reduce((result,item)=>result+item.rollDisadvantage(explodeOption),this.constant)}toString(){if(!this.items.length)return this.constant.toString();let constant=this.constant?this.constant<0?this.constant.toString():"+"+this.constant:"",query=this.items[0].toString();for(let i=1;i<this.items.length;i++)query+=this.items[i].toString(!0);return query+constant}};export{MultiRollResult,RollQuery,RollQueryItem,RollQueryItemPattern,RollQueryPattern,RollResult,getRollMethod,roll,rollAdvantage,rollDisadvantage,rollMulti,setRollMethod};
//# sourceMappingURL=index.mjs.map