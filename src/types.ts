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
  readonly renderTypeChange: string;
};
export type SizesComparisonEntry = readonly [snapshotId: string, comparison: SizesComparison];

export type SnapshotSize = {
  readonly parsed: number;
  readonly childrenSize: number;
  readonly children: Record<string, { readonly parsed: number }>;
  readonly count?: number;
  readonly renderType?: RenderType;
};
export type SnapshotSizeEntry = readonly [snapshotId: string, size: SnapshotSize];

export const renderTypeToName = {
  λ: {
    label: 'Server',
    description:
      'server-side renders at runtime (uses <code>getInitialProps</code> or <code>getServerSideProps</code>)',
  },
  '○': {
    label: 'Static',
    description: 'automatically rendered as static HTML (uses no initial props)',
  },
  '●': {
    label: 'SSG',
    description: 'automatically generated as static HTML + JSON (uses <code>getStaticProps</code>)',
  },
  '': {
    label: 'ISR',
    description: 'incremental static regeneration (uses revalidate in <code>getStaticProps</code>)',
  },
} as const;
export type RenderType = keyof typeof renderTypeToName;
export type RenderTypeName = typeof renderTypeToName[keyof typeof renderTypeToName];
