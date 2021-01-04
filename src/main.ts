import * as Core from '@actions/core';
import * as GitHub from '@actions/github';

import { build } from './next-build';
import { generateComparison } from './next-size-comparison';
import { getComparisonMarkdown } from './next-size-formatter';
import { getNextPagesSize } from './next-size-generator';

async function run() {
  Core.debug(
    JSON.stringify(
      {
        ...GitHub.context,
        issue: GitHub.context.issue,
        repo: GitHub.context.repo,
      },
      null,
      2,
    ),
  );
  const prDirectory = Core.getInput('pr_directory_name');
  const baseDirectory = Core.getInput('base_directory_name');

  const [prOutput, baseOutput] = await build(prDirectory, baseDirectory);

  const [prResult, baseResult] = await Promise.all([
    getNextPagesSize(prOutput),
    getNextPagesSize(baseOutput),
  ]);

  const comparison = generateComparison({
    currentResult: prResult,
    previousResult: baseResult,
  });

  const markdown = getComparisonMarkdown({ ...comparison, commitRange: '' });

  Core.debug(markdown);
}

run().catch((err) => Core.setFailed(err));
