import PrettyBytes from 'pretty-bytes';

import type { ParsedSizeComparison, SizesComparisonEntry } from './types';
import { renderTypeToName } from './types';
import { formatDiff, generateMDTable } from './utils';

export const HEADER = '<!-- typeofweb/typeofweb-next-stats-action header -->';

export function getComparisonMarkdown({
  detailedComparison,
  summaryOfResults,
  commitRange,
}: {
  readonly detailedComparison: readonly SizesComparisonEntry[];
  readonly summaryOfResults: ParsedSizeComparison;
  readonly commitRange: string;
}) {
  const pageDetailsTable = createComparisonTable(detailedComparison, {
    computeBundleLabel: (bundleId) => bundleId,
  });

  const legend = Object.entries(renderTypeToName)
    .map(([icon, { label, description }]) => `* ${icon} ⟶ (${label}) ${description}`)
    .join('\n');

  return `
${HEADER}
# Bundle size changes

<p>Comparing: ${commitRange}</p>

## Summary
* Size change: ${formatDiff(summaryOfResults.absoluteDiff, summaryOfResults.relativeDiff)}
* Size: ${PrettyBytes(summaryOfResults.current)}

<details>
<summary>Details of page changes</summary>

${pageDetailsTable}

${legend}
</details>
`.trim();
}

function createComparisonTable(
  entries: readonly SizesComparisonEntry[],
  { computeBundleLabel }: { computeBundleLabel(x: string): string },
) {
  return generateMDTable(
    [
      { label: '', align: 'center' },
      { label: 'File', align: 'left' },
      { label: 'Size Change', align: 'right' },
      { label: 'Size', align: 'right' },
    ],
    entries
      .map(([bundleId, size]) => [computeBundleLabel(bundleId), size] as const)
      .sort(([labelA, statsA], [labelB, statsB]) => {
        const compareParsedDiff =
          Math.abs(statsB.parsed.absoluteDiff) - Math.abs(statsA.parsed.absoluteDiff);
        const compareName = labelA.localeCompare(labelB);

        if (compareParsedDiff === 0) {
          return compareName;
        }
        return compareParsedDiff;
      })
      .flatMap(([label, { parsed, children, renderTypeChange }]) => {
        const result = [
          [
            renderTypeChange,
            label,
            formatDiff(parsed.absoluteDiff, parsed.relativeDiff),
            PrettyBytes(parsed.current),
          ],
          ...Object.entries(children).map(([childName, { parsed }]) => {
            return [
              `  └ ${childName}`,
              formatDiff(parsed.absoluteDiff, parsed.relativeDiff),
              PrettyBytes(parsed.current),
            ];
          }),
        ];

        return result;
      }),
  );
}
