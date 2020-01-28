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
  compile_stderr: string,
  isTLE: boolean
}
