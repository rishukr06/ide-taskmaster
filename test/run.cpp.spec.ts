import * as chai from 'chai';

import * as worker from '../src/tasks/run';
import { IJob, IJobResult } from '../src/types';

const cpp_code = `
#include <iostream>

int main() {
    char in[10];
    std::cin >> in;
    std::cout << "Hello " << in;
    
    return 0;
}
`;

describe('Test CPP code execution', () => {
  it('should print "Hello world" to stdout and nothing to stderr', () => {
    const message = {
      data: Buffer.from(JSON.stringify(<IJob>{
        id: 2,
        lang: 'cpp',
        source: Buffer.from(cpp_code).toString('base64'),
        stdin: Buffer.from('world').toString('base64')
      }))
    };

    // @ts-ignore
    worker(message, (message, output: IJobResult) => {
      chai.assert.equal(output.stderr, '');
      chai.assert.equal(output.stdout, 'Hello world');
    });
  });
});
