import { GithubClient } from './client/github_client'
import { GithubAnalyzer } from './analyzer/github_analyzer'
import { loadConfig } from './config/github_config'
import { WorkflowReport } from './analyzer/analyzer'
import { LocalExporter } from './exporter/local_exporter'

const main = async () => {
  const GITHUB_TOKEN = process.env['GITHUB_TOKEN'] || ''
  const githubClient = new GithubClient(GITHUB_TOKEN)
  const githubAnalyzer = new GithubAnalyzer()
  const githubConfig = loadConfig()
  if (!githubConfig) return

  const reports: WorkflowReport[] = []
  for (const repo of githubConfig.repos) {
    const workflowRuns = await githubClient.fetchWorkflowRuns(repo.owner, repo.repo)
    for (const workflowRun of workflowRuns) {
      const jobs = await githubClient.fetchJobs(repo.owner, repo.repo, workflowRun.run.id)
      const report = githubAnalyzer.createWorkflowReport(workflowRun.name, workflowRun.run, jobs)

      reports.push(report)
    }
  }

  const exporter = new LocalExporter('github')
  exporter.exportReports(reports)
}
main()