"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getComparisonMarkdown = void 0;
const pretty_bytes_1 = __importDefault(require("pretty-bytes"));
const utils_1 = require("./utils");
function getComparisonMarkdown({ detailedComparison, summaryOfResults, commitRange, }) {
    const pageDetailsTable = createComparisonTable(detailedComparison, {
        computeBundleLabel: (bundleId) => bundleId,
    });
    return `
# Bundle size changes

<p>Comparing: ${commitRange}</p>

## Summary
* Size change: ${utils_1.formatDiff(summaryOfResults.absoluteDiff, summaryOfResults.relativeDiff)}
* Size: ${pretty_bytes_1.default(summaryOfResults.current)}

<details>
<summary>Details of page changes</summary>

${pageDetailsTable}
</details>
`.trim();
}
exports.getComparisonMarkdown = getComparisonMarkdown;
function createComparisonTable(entries, { computeBundleLabel }) {
    return utils_1.generateMDTable([
        { label: 'File', align: 'left' },
        { label: 'Size Change', align: 'right' },
        { label: 'Size', align: 'right' },
    ], entries
        .map(([bundleId, size]) => [computeBundleLabel(bundleId), size])
        .sort(([labelA, statsA], [labelB, statsB]) => {
        const compareParsedDiff = Math.abs(statsB.parsed.absoluteDiff) - Math.abs(statsA.parsed.absoluteDiff);
        const compareName = labelA.localeCompare(labelB);
        if (compareParsedDiff === 0) {
            return compareName;
        }
        return compareParsedDiff;
    })
        .flatMap(([label, { parsed, children }]) => {
        const result = [
            [
                label,
                utils_1.formatDiff(parsed.absoluteDiff, parsed.relativeDiff),
                pretty_bytes_1.default(parsed.current),
            ],
            ...Object.entries(children).map(([childName, { parsed }]) => {
                return [
                    `  └ ${childName}`,
                    utils_1.formatDiff(parsed.absoluteDiff, parsed.relativeDiff),
                    pretty_bytes_1.default(parsed.current),
                ];
            }),
        ];
        return result;
    }));
}
