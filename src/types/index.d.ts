export interface IJob {
  id: number
  source: string
  stdin: string
  lang: string
  timeoutSeconds?: number
}

export interface IJobResult {
  job: IJob
  stdout: string
  stderr: string
  compile_stdout: string
  compile_stderr: string
  exec_time: string
  isTLE: boolean
  isRuntimeErr: boolean
  is_worker_error: boolean
}
