import * as Cache from '@actions/cache';
import * as Core from '@actions/core';
import * as GitHub from '@actions/github';
import Fse from 'fs-extra';

import { HEADER } from './next-size-formatter';

const CACHE_KEY_PREFIX = 'typeofweb_next_stats_action-';

export function getOctokit() {
  if (!process.env.GITHUB_TOKEN) {
    return null;
  }

  return GitHub.getOctokit(process.env.GITHUB_TOKEN);
}

export async function findExistingComment(
  Octokit: ReturnType<typeof GitHub.getOctokit>,
  Context: typeof GitHub.context,
  prNumber: number,
) {
  const { data: comments } = await Octokit.issues.listComments({
    ...Context.repo,
    issue_number: prNumber,
  });
  return comments.find((comment) => comment.body?.includes(HEADER));
}

export async function saveCache({
  content,
  commit,
}: {
  readonly content: string;
  readonly commit: string;
}) {
  const key = CACHE_KEY_PREFIX + commit;

  await Fse.outputFile(key, content, { encoding: 'utf8' });
  try {
    await Cache.saveCache([key], key, { uploadConcurrency: 1 });
  } catch (err) {
    const error = err as Error | undefined;
    if (error?.name === Cache.ValidationError.name) {
      throw error;
    } else if (error?.name === Cache.ReserveCacheError.name) {
      Core.info(error?.message);
    }
    Core.warning(error?.message!);
  }
  await Fse.remove(key);
  Core.debug(`Saved cache key: ${key}`);
}

export async function readCache({ commit }: { readonly commit: string }) {
  const key = CACHE_KEY_PREFIX + commit;

  const foundKey = await Cache.restoreCache([key], key);
  if (!foundKey) {
    return undefined;
  }
  Core.debug(`Found cache key: ${foundKey}`);
  return Fse.readFile(foundKey, 'utf8');
}
