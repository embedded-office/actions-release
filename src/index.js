const fs = require('fs')

const core = require('@actions/core')
const github = require('@actions/github')

async function getRelease(octokit, tagName) {
  console.log("Retrieving release...")
  try {
    console.log(octokit)
    const release = await octokit.rest.repos.getReleaseByTag({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      tag: tagName
    })
    return release.data;
  } catch (e) {
    if (
      ((e.message) || "").toLowerCase().indexOf("not found") !== -1
    ) {
      return undefined
    }
    throw e
  }
}

async function deleteExistingAsset(octokit, asset) {
  if (asset && asset.id) {
    console.log("Deleting previous asset...")
    await octokit.rest.repos.deleteReleaseAsset({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      asset_id: asset.id
    })
  }
}

async function uploadNewAsset(octokit, release, file, assetName) {
  console.log("Updating release description...")
  await octokit.rest.repos.updateRelease({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    release_id: release.id
  })
  console.log("Uploading new asset...")
  const headers = {
    "content-type": "application/octet-stream",
    "content-length": fs.statSync(file).size
  }
  await octokit.rest.repos.uploadReleaseAsset({
    url: release.upload_url,
    name: assetName,
    headers,
    data: fs.readFileSync(file)
  })
}

async function main() {
  try {
    const token = core.getInput("token")
    core.setSecret(token)
    const tagName = core.getInput("tag-name")
    const assetName = core.getInput("asset-name")
    const file = core.getInput("file")

    if (github.context.ref.startsWith("refs/pull")) {
      console.log("::warning::Skipping action as this is a pull request")
      return
    }

    // find release
    const octokit = new github.getOctokit(token)
    let release = await getRelease(octokit, tagName)
    if (!release) {
      throw new Error("Could not found release")
    }

    // replace asset, if already existing
    await deleteExistingAsset(
      octokit,
      release.assets.find((_) => _.name === assetName)
    )

    // upload asset
    await uploadNewAsset(octokit, release, file, assetName)

  } catch (error) {
    core.setFailed(error.message)
  }
}

main()
