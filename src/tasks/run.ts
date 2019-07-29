const config = require('../../config');

import { IJob, IJobResult } from '../types';
import { Message } from '@google-cloud/pubsub/build/src/subscriber';

import { rm, mkdir, exec, cat, touch } from 'shelljs';
import * as path from 'path';
import * as fs from 'fs';

rm('-rf', config.WORKER.BOX_DIR);
mkdir('-p', config.WORKER.BOX_DIR);

const worker = (message: Message, done: (message: Message, output: IJobResult) => void) => {
  const job: IJob = JSON.parse(Buffer.from(message.data).toString());

  const jobExecutionPath = path.join(config.WORKER.BOX_DIR, `${job.id}`);
  mkdir('-p', jobExecutionPath);

  const LANG_CONFIG = config.WORKER.LANG[job.lang];

  fs.writeFileSync(
    path.join(jobExecutionPath, LANG_CONFIG.SOURCE_FILE),
    (new Buffer(job.source, 'base64')).toString('ascii')
  );

  fs.writeFileSync(
    path.join(jobExecutionPath, 'run.stdin'),
    (new Buffer(job.stdin, 'base64')).toString('ascii')
  );

  exec(`docker run \\
    --cpus="${LANG_CONFIG.CPU_SHARES}" \\
    --memory="${LANG_CONFIG.MEM_LIMIT}" \\
    --ulimit nofile=64:64 \\
    --rm \\
    --read-only \\
    -v ${jobExecutionPath}:${config.WORKER.BOX_DIR} \\
    -w ${config.WORKER.BOX_DIR} \\
    ifaisalalam/ide-worker-${job.lang} \\
    bash -c "/bin/compile.sh && /bin/run.sh"
  `);

  const stdout = cat(path.join(jobExecutionPath, 'run.stdout'));

  const compile_stderr = cat(path.join(jobExecutionPath, 'compile.stderr')) || '';
  const stderr = compile_stderr || cat(path.join(jobExecutionPath, 'run.stderr'));

  const output: IJobResult = {
    job,
    stderr,
    stdout
  };

  done(message, output);

  rm('-rf', jobExecutionPath);
};

export = worker;
