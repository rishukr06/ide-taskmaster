import * as chai from 'chai';

import * as worker from '../src/tasks/run';
import { IJob, IJobResult } from '../src/types';

const py3_code = `print("Hello", input(), end="")`;

describe('Test Python3 code execution', () => {
  it('should print "Hello world" to stdout and nothing to stderr', async () => {
    const job: IJob = {
      id: 4,
      lang: 'python3',
      source: Buffer.from(py3_code).toString('base64'),
      stdin: Buffer.from('world').toString('base64')
    };

    const output: IJobResult = (await worker(job)).output;
    chai.assert.equal(output.stderr, '');
    chai.assert.equal(output.stdout, 'Hello world');
  });
});
