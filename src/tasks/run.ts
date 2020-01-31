const config = require('../../config');

import { IJob, IJobResult } from '../types';

import { rm, mkdir, exec, cat } from 'shelljs';
import * as path from 'path';
import * as fs from 'fs';

rm('-rf', config.WORKER.BOX_DIR);
mkdir('-p', config.WORKER.BOX_DIR);

const worker = async (message: IJob) => {
  const jobExecutionPath = path.join(config.WORKER.BOX_DIR, `${message.id}`);
  mkdir('-p', jobExecutionPath);

  const LANG_CONFIG = config.WORKER.LANG[message.lang];

  fs.writeFileSync(
    path.join(jobExecutionPath, LANG_CONFIG.SOURCE_FILE),
    (new Buffer(message.source, 'base64')).toString('ascii')
  );

  fs.writeFileSync(
    path.join(jobExecutionPath, 'run.stdin'),
    (new Buffer(message.stdin, 'base64')).toString('ascii')
  );

  const shellOutput = exec(`docker run \\
    --cpus="${LANG_CONFIG.CPU_SHARES}" \\
    --memory="${LANG_CONFIG.MEM_LIMIT}" \\
    --ulimit nofile=64:64 \\
    --rm \\
    --read-only \\
    -v ${jobExecutionPath}:${config.WORKER.BOX_DIR} \\
    -w ${config.WORKER.BOX_DIR} \\
    -e DEFAULT_TIMEOUT=${message.timeoutSeconds || 5} \\
    --network no-internet \\
    ifaisalalam/ide-worker-${message.lang} \\
    bash -c "/bin/compile.sh && /bin/run.sh"
  `);

  const stdout_file = path.join(jobExecutionPath, 'run.stdout');
  const stdout = fs.existsSync(stdout_file) ? cat(stdout_file).stdout : '';

  const compile_stderr_file = path.join(jobExecutionPath, 'compile.stderr');
  const compile_stderr = fs.existsSync(compile_stderr_file) ? cat(compile_stderr_file).stdout : '';

  const stderr_file = path.join(jobExecutionPath, 'run.stderr');
  const stderr = fs.existsSync(stderr_file) ? cat(stderr_file).stdout : '';

  const tle_err_file = path.join(jobExecutionPath, 'tle.stderr');
  const tle_err = fs.existsSync(tle_err_file) ? cat(tle_err_file).stdout : '';

  let isTLE = false;
  if (tle_err.slice(0, 3) === 'TLE') {
    isTLE = true;
  }

  const output: IJobResult = {
    job: message,
    stderr,
    compile_stderr,
    stdout,
    isTLE
  };

  rm('-rf', jobExecutionPath);

  return { shellOutput, output };
};

export = worker;
