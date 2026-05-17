const GITHUB_API = "https://api.github.com"

function getHeaders() {
  const token = process.env.GITHUB_ACCESS_TOKEN
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "DevTrack/1.0",
  }
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

interface GitHubCommit {
  sha: string
  commit: {
    message: string
    author: { date: string }
  }
}

interface GitHubRepo {
  full_name: string
  html_url: string
  default_branch: string
  private: boolean
}

export async function fetchRepoInfo(fullName: string): Promise<GitHubRepo> {
  const res = await fetch(`${GITHUB_API}/repos/${fullName}`, { headers: getHeaders() })
  if (!res.ok) {
    if (res.status === 404) throw new Error(`Repository "${fullName}" not found`)
    if (res.status === 403) throw new Error("GitHub API rate limit exceeded")
    throw new Error(`GitHub API error: ${res.status}`)
  }
  return res.json()
}

export async function fetchRecentCommits(
  fullName: string,
  branch: string,
  since: Date
): Promise<GitHubCommit[]> {
  const sinceISO = since.toISOString()
  const url = `${GITHUB_API}/repos/${fullName}/commits?sha=${branch}&since=${sinceISO}&per_page=100`
  const res = await fetch(url, { headers: getHeaders() })
  if (!res.ok) {
    if (res.status === 404) throw new Error(`Repository "${fullName}" not found`)
    if (res.status === 403) throw new Error("GitHub API rate limit exceeded")
    throw new Error(`GitHub API error: ${res.status}`)
  }
  return res.json()
}

export async function fetchContributorCount(fullName: string): Promise<number> {
  const url = `${GITHUB_API}/repos/${fullName}/contributors?per_page=1&anon=true`
  const res = await fetch(url, { headers: getHeaders() })
  if (!res.ok) return 0
  const link = res.headers.get("Link") || ""
  const match = link.match(/page=(\d+)>; rel="last"/)
  if (match) return parseInt(match[1])
  const body = await res.json()
  return Array.isArray(body) ? body.length : 0
}

export interface SyncResult {
  commitCount24h: number
  commitCount7d: number
  lastCommitSha: string | null
  lastCommitMsg: string | null
  lastCommitAt: Date | null
}

export async function syncFromGitHub(fullName: string, defaultBranch: string): Promise<SyncResult> {
  const now = new Date()
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const commits24h = await fetchRecentCommits(fullName, defaultBranch, twentyFourHoursAgo)
  const commits7d = await fetchRecentCommits(fullName, defaultBranch, sevenDaysAgo)

  const lastCommit = commits7d[0] || null

  return {
    commitCount24h: commits24h.length,
    commitCount7d: commits7d.length,
    lastCommitSha: lastCommit?.sha ?? null,
    lastCommitMsg: lastCommit?.commit?.message ?? null,
    lastCommitAt: lastCommit?.commit?.author?.date ? new Date(lastCommit.commit.author.date) : null,
  }
}
