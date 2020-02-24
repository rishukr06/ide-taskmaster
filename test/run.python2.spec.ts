import * as chai from 'chai';

import * as worker from '../src/tasks/run';
import { IJob, IJobResult } from '../src/types';

const py2_code = `print "Hello", raw_input()`;

describe('Test Python2 code execution', () => {
  it('should print "Hello world" to stdout and nothing to stderr', async () => {
    const job: IJob = {
      id: 3,
      lang: 'python2',
      source: Buffer.from(py2_code).toString('base64'),
      stdin: Buffer.from('world').toString('base64')
    };

    const output: IJobResult = (await worker(job)).output;
    chai.assert.equal(output.stderr, '');
    chai.assert.equal(output.stdout, 'Hello world\n');
    chai.expect(output.exec_time).satisfies(time => parseFloat(time) >= 0.00);
  });
});
