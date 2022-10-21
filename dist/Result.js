"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.amountsInResult = exports.amountsOutResult = void 0;
const Token_1 = require("./Token");
function result(_path, _amounts) {
    const path = _path.map((token, i) => new Token_1.TokenWithAmount(token, _amounts[i]));
    return Object.assign(path, { formatted: path.map(token => token.format()) });
}
function amountsOutResult(_path, _amounts) {
    return Object.assign(result(_path, _amounts), { amountOut: _amounts[_amounts.length - 1], priceImpactBps: 10000 } // temp
    );
}
exports.amountsOutResult = amountsOutResult;
function amountsInResult(_path, _amounts) {
    return Object.assign(result(_path, _amounts), { amountIn: _amounts[0], priceImpactBps: 10000 } // temp
    );
}
exports.amountsInResult = amountsInResult;
