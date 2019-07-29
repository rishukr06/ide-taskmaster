export interface IJob {
  id: number
  source: string
  stdin: string
  lang: string
}

export interface IJobResult {
  job: IJob
  stdout: string
  stderr: string
}
