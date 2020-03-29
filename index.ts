import * as github from '@actions/github'
import * as core from '@actions/core'
import axios from 'axios'

const notify = (string: string): Promise<void> => {
  const slackWebhookUrl = process.env['SLACK_WEBHOOK_URL']!
  return axios.post(slackWebhookUrl, {
    text: string,
    username: 'ayy-bee',
    icon_emoji: 'honeybee'
  })
}

const run = async (): Promise<void> => {
  // Instantiate octokit
  const token = process.env['GITHUB_TOKEN']!
  const octokit: github.GitHub = new github.GitHub(token)

  const nwo = process.env['GITHUB_REPOSITORY']!
  const [owner, repo] = nwo.split('/')

  const [, , head] = process.env['GITHUB_REF']!.split('/')

  // Fetch branches with the specified prefix
  const branchPrefix = core.getInput('branchPrefix')
  const { data: branches } = await octokit.git.listMatchingRefs({
    owner,
    repo,
    ref: `heads/${branchPrefix}`
  })

  // Perform merges on A/B branches
  branches.forEach(async branch => {
    const [, , base] = branch.ref.split('/')
    try {
      await octokit.repos.merge({ owner, repo, base, head })
    } catch (err) {
      const repoUrl = `https://github.com/${owner}/${repo}`
      const headUrl = `${repoUrl}/tree/${head}`
      const baseUrl = `${repoUrl}/tree/${base}`

      if (err.status === 409) {
        const msg = `Help, there's a merge conflict! Please merge <${headUrl}|${head}> into <${baseUrl}|${base}> on <${repoUrl}|${repo}> manually.`
        await notify(msg)
      } else {
        const msg = `Something went wrong when trying to merge ${head} into ${base} on <${repoUrl}|${repo}>, and it wasn't a merge conflict.`
        await notify(msg)
      }
    }
  })
}

run()
