import { exec } from 'child_process';

import PrettyBytes from 'pretty-bytes';

import type { SizeUnit } from './types';

export const ZERO_WIDTH_SPACE = '&#xfeff;';

export function execAsync(args: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(args, (err, stdout) => {
      if (err) {
        reject(err);
      } else {
        resolve(stdout.trim());
      }
    });
  });
}

export function uniq<T>(arr: readonly T[]): readonly T[] {
  return [...new Set(arr)];
}

export function uniqKeys<R extends object, U extends object>(
  obj1: R,
  obj2: U,
): ReadonlyArray<keyof R | keyof U> {
  return uniq([
    ...((Object.keys(obj1) as unknown) as ReadonlyArray<keyof R>),
    ...((Object.keys(obj2) as unknown) as ReadonlyArray<keyof U>),
  ]);
}

export function prettyBytesInverse(n: string, unit: SizeUnit): number {
  const metricPrefix = unit.length < 2 ? '' : unit[0]!;
  const metricPrefixes = ['', 'k', 'M', 'G', 'T', 'P'];
  const metricPrefixIndex = metricPrefixes.indexOf(metricPrefix);
  if (metricPrefixIndex === -1) {
    throw new TypeError(
      `unrecognized metric prefix '${metricPrefix}' in unit '${unit}'. only '${metricPrefixes.join(
        "', '",
      )}' are allowed`,
    );
  }

  const power = metricPrefixIndex * 3;
  return Number(n) * 10 ** power;
}

export function addPercent(change: number, goodEmoji = '', badEmoji = ':small_red_triangle:') {
  const formatted = (change * 100).toFixed(2);
  if (/^-|^0(?:\.0+)$/.test(formatted)) {
    return `${formatted}%${goodEmoji ? ' ' + goodEmoji : ''}`;
  }
  return `+${formatted}%${badEmoji ? ' ' + badEmoji : ''}`;
}

export function formatDiff(absoluteChange: number, relativeChange: number) {
  if (absoluteChange === 0) {
    return '--';
  }

  const trendIcon = absoluteChange < 0 ? '▼' : '▲';

  return `${trendIcon} ${PrettyBytes(absoluteChange, {
    signed: true,
  })} (${addPercent(relativeChange, '', '')})`;
}

export function generateMDTable(
  headers: ReadonlyArray<{ readonly label: string; readonly align: 'left' | 'center' | 'right' }>,
  body: readonly (readonly string[])[],
): string {
  const headerRow = headers.map((header) => header.label || ZERO_WIDTH_SPACE);
  const alignmentRow = headers.map((header) => {
    if (header.align === 'right') {
      return ' ---:';
    }
    if (header.align === 'center') {
      return ':---:';
    }
    return ' --- ';
  });

  const bodyRows = body.map((row) => row.map((val) => val || ZERO_WIDTH_SPACE));

  return [headerRow, alignmentRow, ...bodyRows].map((row) => row.join(' | ')).join('\n');
}
