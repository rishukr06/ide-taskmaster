module.exports = {
  CLOUD_PUBSUB: {
    SUBSCRIPTION_NAME: process.env.PUBSUB_IDE_SUBSCRIPTION || 'ide_jobs',
    SUCCESS_TOPIC: process.env.PUBSUB_IDE_SUCCESS_TOPIC || 'ide_outputs'
  },
  WORKER: {
    MAX_CONCURRENT_TASKS: parseInt(process.env.MAX_CONCURRENT_JOBS) || 1,
    BOX_DIR: process.env.WORKER_BOX_DIR || '/tmp/box',
    LANG: {
      'c': {
        SOURCE_FILE: 'source.c',
        CPU_SHARES: '0.8',
        MEM_LIMIT: '200m'
      },
      'cpp': {
        SOURCE_FILE: 'source.cpp',
        CPU_SHARES: '0.8',
        MEM_LIMIT: '200m'
      }
    }
  }
};
