import * as chai from 'chai';

import * as worker from '../src/tasks/run';
import { IJob, IJobResult } from '../src/types';

const nodejs8_code = `console.log('Hello world'); console.error('Error')`;

describe('Test NodeJS 8 code execution', () => {
  it('should print "Hello world" to stdout and "Error" to stderr', async () => {
    const job: IJob = {
      id: 5,
      lang: 'nodejs8',
      source: Buffer.from(nodejs8_code).toString('base64'),
      stdin: Buffer.from('').toString('base64')
    };

    const output: IJobResult = (await worker(job)).output;
    chai.assert.equal(output.stderr, 'Error\n');
    chai.assert.equal(output.stdout, 'Hello world\n');
    chai.expect(output.exec_time).satisfies(time => parseFloat(time) >= 0.00);
  });
});
