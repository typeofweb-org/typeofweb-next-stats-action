import type { SizeUnit, SnapshotSizeEntry } from './types';
import { prettyBytesInverse } from './utils';

type Group = {
  readonly treeViewPresentation: string;
  readonly subTree?: string;
  readonly fileType?: string;
  readonly pageUrl: string;
  readonly sizeFormatted: string;
  readonly sizeUnit: SizeUnit;
  // eslint-disable-next-line functional/prefer-readonly-type
  children: Group[];
};

const pageRegex = /(?<treeViewPresentation>┌|├|└)\s+((?<subTree>┌|├|└)\s+)?((?<fileType>λ|○|●)\s+)?(?<pageUrl>[^\s]+)\s+(?<sizeFormatted>[0-9.]+)\s+(?<sizeUnit>\w+)/gm;

export function getNextPagesSize(consoleOutput: string) {
  // eslint-disable-next-line functional/prefer-readonly-type
  const jsChunks: number[] = [];
  // eslint-disable-next-line functional/prefer-readonly-type
  const cssChunks: number[] = [];

  const rows = (Array.from(consoleOutput.matchAll(pageRegex)) as unknown) as ReadonlyArray<{
    readonly groups: Group;
  }>;

  const groupedRows = rows
    .map((r) => r.groups)
    // eslint-disable-next-line functional/prefer-readonly-type
    .reduce<Group[]>((acc, group, index) => {
      if (group.pageUrl === '/_app') {
        // skip because it's included later on as /static/pages/_app so this is a duplicate
        return acc;
      }
      if (group.subTree && index > 0) {
        // eslint-disable-next-line functional/no-loop-statement
        for (let i = acc.length - 1; i >= 0; --i) {
          if (!acc[i]!.subTree) {
            acc[i]!.children = acc[i]!.children || [];
            acc[i]!.children.push(group);
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
      cssChunks.push(prettyBytesInverse(sizeFormatted, sizeUnit));
      return null;
    } else if (pageUrl.includes('pages/_app.')) {
      snapshotId = 'shared:_app.js';
    } else if (/^runtime\/main\.(.+)\.js$/.test(pageUrl)) {
      snapshotId = 'shared:runtime/main';
    } else if (/^runtime\/webpack\.(.+)\.js$/.test(pageUrl)) {
      snapshotId = 'shared:runtime/webpack';
    } else if (/^chunks\/commons\.(.+)\.js$/.test(pageUrl)) {
      snapshotId = 'shared:chunk/commons';
    } else if (/^chunks\/MarkdownText\.(.+)\.js$/.test(pageUrl)) {
      snapshotId = 'shared:MarkdownText';
    } else if (/^chunks\/framework\.(.+)\.js$/.test(pageUrl)) {
      snapshotId = 'shared:chunk/framework';
    } else if (/^chunks\/(.*)\.js$/.test(pageUrl)) {
      // shared chunks are unnamed and only have a hash
      // we just track their count and summed size
      jsChunks.push(prettyBytesInverse(sizeFormatted, sizeUnit));
      // and not each chunk individually
      return null;
    }

    const childrenSizeSum = children.reduce((acc, group) => {
      return acc + prettyBytesInverse(group.sizeFormatted, group.sizeUnit);
    }, 0);

    return [
      snapshotId,
      {
        parsed: prettyBytesInverse(sizeFormatted, sizeUnit),
        childrenSize: childrenSizeSum,
        children: children.reduce((acc, c) => {
          const key = c.pageUrl.replace(/\/[a-z0-9]{20}/, '/[hash]');
          acc[key] = acc[key] || { parsed: 0 };
          acc[key]!.parsed += prettyBytesInverse(c.sizeFormatted, c.sizeUnit);
          return acc;
          // eslint-disable-next-line functional/prefer-readonly-type
        }, {} as Record<string, { parsed: number }>),
      },
    ] as SnapshotSizeEntry;
  });

  const nonEmptyEntries = entries.filter((entry): entry is SnapshotSizeEntry => entry != null);

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
