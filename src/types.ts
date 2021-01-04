export type ParsedSizeComparison = {
  readonly previous: number;
  readonly current: number;
  readonly absoluteDiff: number;
  readonly relativeDiff: number;
};

export type SizeUnit = 'B' | 'kB' | 'MB' | 'GB' | 'TB' | 'PB';
export type SizesComparison = {
  readonly parsed: ParsedSizeComparison;
  readonly children: Record<string, { readonly parsed: ParsedSizeComparison }>;
};
export type SizesComparisonEntry = readonly [snapshotId: string, comparison: SizesComparison];

export type SnapshotSize = {
  readonly parsed: number;
  readonly childrenSize: number;
  readonly children: Record<string, { readonly parsed: number }>;
  readonly count?: number;
};
export type SnapshotSizeEntry = readonly [snapshotId: string, size: SnapshotSize];
