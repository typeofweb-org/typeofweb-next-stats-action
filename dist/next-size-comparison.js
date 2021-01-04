"use strict";
// import path from "path";
// import fse from "fs-extra";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateComparison = void 0;
const utils_1 = require("./utils");
// const snapshotDestPath = path.join(__dirname, "size-snapshot.json");
function generateParsedSizesComparison(previous, current) {
    return {
        previous,
        current,
        absoluteDiff: current - previous,
        relativeDiff: current / previous - 1,
    };
}
const nullSnapshot = {
    parsed: 0,
    children: {},
    childrenSize: 0,
};
function generateComparison({ previousResult, currentResult, }) {
    const bundleKeys = utils_1.uniqKeys(currentResult, previousResult);
    const detailedComparison = bundleKeys.map((bundle) => {
        var _a, _b;
        const current = (_a = currentResult[bundle]) !== null && _a !== void 0 ? _a : nullSnapshot;
        const previous = (_b = previousResult[bundle]) !== null && _b !== void 0 ? _b : nullSnapshot;
        const allKeys = utils_1.uniqKeys(current.children, previous.children);
        const children = Object.fromEntries(allKeys.map((key) => {
            const currentChild = current.children[key] || nullSnapshot;
            const previousChild = previous.children[key] || nullSnapshot;
            return [
                key,
                {
                    parsed: generateParsedSizesComparison(previousChild.parsed, currentChild.parsed),
                },
            ];
        }));
        return [
            bundle,
            {
                parsed: generateParsedSizesComparison(previous.parsed, current.parsed),
                children,
            },
        ];
    });
    const summary = detailedComparison.reduce((acc, [_snapshotId, sizes]) => {
        acc.current += sizes.parsed.current || 0;
        acc.previous += sizes.parsed.previous || 0;
        return acc;
    }, { current: 0, previous: 0 });
    const summaryOfResults = generateParsedSizesComparison(summary.previous, summary.current);
    return { detailedComparison, summaryOfResults };
}
exports.generateComparison = generateComparison;
