import * as chai from 'chai';

import * as worker from '../src/tasks/run';
import { IJob, IJobResult } from '../src/types';

const c_code = `
#include <stdio.h>

int main() {
    char in[10];
    scanf("%s", in);
    printf("Hello %s", in);
    
    return 0;
}
`;

describe('Test C code execution', () => {
  it('should print "Hello world" to stdout and nothing to stderr', async () => {
    const job: IJob = {
      id: 1,
      lang: 'c',
      source: Buffer.from(c_code).toString('base64'),
      stdin: Buffer.from('world').toString('base64')
    };

    const output: IJobResult = (await worker(job)).output;
    chai.assert.equal(output.stderr, '');
    chai.assert.equal(output.stdout, 'Hello world');
  });
});
