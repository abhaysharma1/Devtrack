import { githubRepository } from "@/repositories/github.repository"
import { fetchRepoInfo, syncFromGitHub } from "@/lib/github"

export const githubService = {
  async getRepositories(projectId: string) {
    return githubRepository.findByProjectId(projectId)
  },

  async linkRepository(projectId: string, fullName: string) {
    const existing = await githubRepository.findByFullName(projectId, fullName)
    if (existing) throw new Error("Repository is already linked to this project")

    const repoInfo = await fetchRepoInfo(fullName)

    return githubRepository.create({
      projectId,
      fullName: repoInfo.full_name,
      url: repoInfo.html_url,
      defaultBranch: repoInfo.default_branch,
      isPrivate: repoInfo.private,
    })
  },

  async unlinkRepository(repoId: string) {
    const repo = await githubRepository.findById(repoId)
    if (!repo) throw new Error("Repository not found")
    await githubRepository.delete(repoId)
  },

  async syncRepository(repoId: string) {
    const repo = await githubRepository.findById(repoId)
    if (!repo) throw new Error("Repository not found")

    const result = await syncFromGitHub(repo.fullName, repo.defaultBranch)

    return githubRepository.update(repoId, {
      ...result,
      syncedAt: new Date(),
    })
  },

  async syncProjectRepositories(projectId: string) {
    const repos = await githubRepository.findByProjectId(projectId)
    const results = []
    for (const repo of repos) {
      try {
        const updated = await this.syncRepository(repo.id)
        results.push(updated)
      } catch {
        console.error(`Failed to sync repository ${repo.fullName} (${repo.id})`)
        results.push({ ...repo, syncError: true })
      }
    }
    return results
  },

  async syncAllRepositories() {
    const repos = await githubRepository.findAllWithProject()
    const results = []
    for (const repo of repos) {
      try {
        const result = await syncFromGitHub(repo.fullName, repo.defaultBranch)
        const updated = await githubRepository.update(repo.id, {
          ...result,
          syncedAt: new Date(),
        })
        results.push(updated)
      } catch {
        console.error(`Failed to sync all repository ${repo.fullName} (${repo.id})`)
        results.push({ ...repo, syncError: true })
      }
    }
    return results
  },
}
