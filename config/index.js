module.exports = {
  CLOUD_PUBSUB: {
    SUBSCRIPTION_NAME: process.env.PUBSUB_IDE_SUBSCRIPTION || 'projects/project-id/topics/ide-tasks',
    OUTPUT_TOPIC: process.env.PUBSUB_IDE_OUTPUT_TOPIC || 'projects/project-id/topics/ide-task-results'
  },
  WORKER: {
    MAX_CONCURRENT_TASKS: parseInt(process.env.MAX_CONCURRENT_JOBS) || 1,
    BOX_DIR: process.env.WORKER_BOX_DIR || '/tmp/box/jobs',
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
