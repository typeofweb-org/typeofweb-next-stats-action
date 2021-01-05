import Fse from 'fs-extra';

import { readCache } from './octokit';
import { execAsync } from './utils';

export async function build(prDirectory: string, baseDirectory: string) {
  const prCommit = await execAsync(`cd ${prDirectory} && git rev-parse HEAD`);
  const baseCommit = await execAsync(`cd ${baseDirectory} && git rev-parse HEAD`);

  const prOutput = (await readCache({ key: prCommit })) ?? (await buildNext(prDirectory));
  const baseOutput = (await readCache({ key: baseCommit })) ?? (await buildNext(baseDirectory));

  return { prOutput, baseOutput, prCommit, baseCommit };
}

async function buildNext(path: string) {
  await Fse.copyFile(`${path}/.env-sample`, `${path}/.env`);
  return execAsync(`cd ${path} && yarn && NODE_ENV=production yarn build`);
}
