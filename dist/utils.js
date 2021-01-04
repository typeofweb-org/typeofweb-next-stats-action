"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMDTable = exports.formatDiff = exports.addPercent = exports.prettyBytesInverse = exports.uniqKeys = exports.uniq = exports.execAsync = void 0;
const child_process_1 = require("child_process");
const pretty_bytes_1 = __importDefault(require("pretty-bytes"));
function execAsync(args) {
    return new Promise((resolve, reject) => {
        child_process_1.exec(args, (err, stdout) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(stdout.trim());
            }
        });
    });
}
exports.execAsync = execAsync;
function uniq(arr) {
    return [...new Set(arr)];
}
exports.uniq = uniq;
function uniqKeys(obj1, obj2) {
    return uniq([
        ...Object.keys(obj1),
        ...Object.keys(obj2),
    ]);
}
exports.uniqKeys = uniqKeys;
function prettyBytesInverse(n, unit) {
    const metricPrefix = unit.length < 2 ? '' : unit[0];
    const metricPrefixes = ['', 'k', 'M', 'G', 'T', 'P'];
    const metricPrefixIndex = metricPrefixes.indexOf(metricPrefix);
    if (metricPrefixIndex === -1) {
        throw new TypeError(`unrecognized metric prefix '${metricPrefix}' in unit '${unit}'. only '${metricPrefixes.join("', '")}' are allowed`);
    }
    const power = metricPrefixIndex * 3;
    return Number(n) * 10 ** power;
}
exports.prettyBytesInverse = prettyBytesInverse;
function addPercent(change, goodEmoji = '', badEmoji = ':small_red_triangle:') {
    const formatted = (change * 100).toFixed(2);
    if (/^-|^0(?:\.0+)$/.test(formatted)) {
        return `${formatted}% ${goodEmoji}`;
    }
    return `+${formatted}% ${badEmoji}`;
}
exports.addPercent = addPercent;
function formatDiff(absoluteChange, relativeChange) {
    if (absoluteChange === 0) {
        return '--';
    }
    const trendIcon = absoluteChange < 0 ? '▼' : '▲';
    return `${trendIcon} ${pretty_bytes_1.default(absoluteChange, {
        signed: true,
    })} (${addPercent(relativeChange, '', '')})`;
}
exports.formatDiff = formatDiff;
function generateMDTable(headers, body) {
    const headerRow = headers.map((header) => header.label);
    const alignmentRow = headers.map((header) => {
        if (header.align === 'right') {
            return ' ---:';
        }
        if (header.align === 'center') {
            return ':---:';
        }
        return ' --- ';
    });
    return [headerRow, alignmentRow, ...body].map((row) => row.join(' | ')).join('\n');
}
exports.generateMDTable = generateMDTable;
