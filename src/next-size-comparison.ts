import type { ParsedSizeComparison, RenderType, SnapshotSize } from './types';
import { uniqKeys } from './utils';

function generateParsedSizesComparison(previous: number, current: number): ParsedSizeComparison {
  return {
    previous,
    current,
    absoluteDiff: current - previous,
    relativeDiff: current / previous - 1,
  };
}

const nullSnapshot: SnapshotSize = {
  parsed: 0,
  children: {},
  childrenSize: 0,
};

export function generateComparison({
  previousResult,
  currentResult,
}: {
  readonly previousResult: Record<string, SnapshotSize>;
  readonly currentResult: Record<string, SnapshotSize>;
}) {
  const bundleKeys = uniqKeys(currentResult, previousResult);

  const detailedComparison = bundleKeys.map((bundle) => {
    const current = currentResult[bundle] ?? nullSnapshot;
    const previous = previousResult[bundle] ?? nullSnapshot;

    const allKeys = uniqKeys(current.children, previous.children);

    const children = Object.fromEntries(
      allKeys.map((key) => {
        const currentChild = current.children[key] || nullSnapshot;
        const previousChild = previous.children[key] || nullSnapshot;
        return [
          key,
          {
            parsed: generateParsedSizesComparison(previousChild.parsed, currentChild.parsed),
          },
        ];
      }),
    );

    return [
      bundle,
      {
        parsed: generateParsedSizesComparison(previous.parsed, current.parsed),
        children,
        renderTypeChange: getRenderTypeChange(current.renderType, previous.renderType),
      },
    ] as const;
  });

  const summary = detailedComparison.reduce(
    (acc, [_snapshotId, sizes]) => {
      acc.current += sizes.parsed.current || 0;
      acc.previous += sizes.parsed.previous || 0;
      return acc;
    },
    { current: 0, previous: 0 },
  );

  const summaryOfResults = generateParsedSizesComparison(summary.previous, summary.current);

  return { detailedComparison, summaryOfResults };
}

function getRenderTypeChange(
  current: RenderType | undefined,
  previous: RenderType | undefined,
): string {
  if (typeof current === 'undefined' || typeof previous === 'undefined') {
    return '';
  }

  if (current === previous) {
    return current;
  }

  return `${previous} ⮕ ${current}`;
}
