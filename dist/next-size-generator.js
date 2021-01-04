"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNextPagesSize = void 0;
const utils_1 = require("./utils");
const pageRegex = /(?<treeViewPresentation>┌|├|└)\s+((?<subTree>┌|├|└)\s+)?((?<fileType>λ|○|●)\s+)?(?<pageUrl>[^\s]+)\s+(?<sizeFormatted>[0-9.]+)\s+(?<sizeUnit>\w+)/gm;
function getNextPagesSize(consoleOutput) {
    // eslint-disable-next-line functional/prefer-readonly-type
    const jsChunks = [];
    // eslint-disable-next-line functional/prefer-readonly-type
    const cssChunks = [];
    const rows = Array.from(consoleOutput.matchAll(pageRegex));
    const groupedRows = rows
        .map((r) => r.groups)
        // eslint-disable-next-line functional/prefer-readonly-type
        .reduce((acc, group, index) => {
        if (group.pageUrl === '/_app') {
            // skip because it's included later on as /static/pages/_app so this is a duplicate
            return acc;
        }
        if (group.subTree && index > 0) {
            // eslint-disable-next-line functional/no-loop-statement
            for (let i = acc.length - 1; i >= 0; --i) {
                if (!acc[i].subTree) {
                    acc[i].children = acc[i].children || [];
                    acc[i].children.push(group);
                    return acc;
                }
            }
        }
        acc.push({ ...group, children: [] });
        return acc;
    }, []);
    const entries = groupedRows.map((row) => {
        const { pageUrl, sizeFormatted, sizeUnit, children } = row;
        let snapshotId = `${pageUrl}`;
        if (pageUrl.startsWith('css/')) {
            cssChunks.push(utils_1.prettyBytesInverse(sizeFormatted, sizeUnit));
            return null;
        }
        else if (pageUrl.includes('pages/_app.')) {
            snapshotId = 'shared:_app.js';
        }
        else if (/^runtime\/main\.(.+)\.js$/.test(pageUrl)) {
            snapshotId = 'shared:runtime/main';
        }
        else if (/^runtime\/webpack\.(.+)\.js$/.test(pageUrl)) {
            snapshotId = 'shared:runtime/webpack';
        }
        else if (/^chunks\/commons\.(.+)\.js$/.test(pageUrl)) {
            snapshotId = 'shared:chunk/commons';
        }
        else if (/^chunks\/MarkdownText\.(.+)\.js$/.test(pageUrl)) {
            snapshotId = 'shared:MarkdownText';
        }
        else if (/^chunks\/framework\.(.+)\.js$/.test(pageUrl)) {
            snapshotId = 'shared:chunk/framework';
        }
        else if (/^chunks\/(.*)\.js$/.test(pageUrl)) {
            // shared chunks are unnamed and only have a hash
            // we just track their count and summed size
            jsChunks.push(utils_1.prettyBytesInverse(sizeFormatted, sizeUnit));
            // and not each chunk individually
            return null;
        }
        const childrenSizeSum = children.reduce((acc, group) => {
            return acc + utils_1.prettyBytesInverse(group.sizeFormatted, group.sizeUnit);
        }, 0);
        return [
            snapshotId,
            {
                parsed: utils_1.prettyBytesInverse(sizeFormatted, sizeUnit),
                childrenSize: childrenSizeSum,
                children: children.reduce((acc, c) => {
                    const key = c.pageUrl.replace(/\/[a-z0-9]{20}/, '/[hash]');
                    acc[key] = acc[key] || { parsed: 0 };
                    acc[key].parsed += utils_1.prettyBytesInverse(c.sizeFormatted, c.sizeUnit);
                    return acc;
                    // eslint-disable-next-line functional/prefer-readonly-type
                }, {}),
            },
        ];
    });
    const nonEmptyEntries = entries.filter((entry) => entry != null);
    nonEmptyEntries.push([
        'shared:js',
        {
            parsed: jsChunks.reduce((sum, size) => sum + size, 0),
            count: jsChunks.length,
            childrenSize: 0,
            children: {},
        },
    ]);
    nonEmptyEntries.push([
        'shared:css',
        {
            parsed: cssChunks.reduce((sum, size) => sum + size, 0),
            count: cssChunks.length,
            childrenSize: 0,
            children: {},
        },
    ]);
    return Object.fromEntries(nonEmptyEntries);
}
exports.getNextPagesSize = getNextPagesSize;
