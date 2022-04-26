# Add a file to a GitHub Release

This action adds a file to a GitHub Release in the current repo.

## Inputs

### `token`

**Required** A GitHub authentication token

### `tag-name`

**Required** The tag name to find the Release

### `asset-name`

**Required** A descriptive name for the asset being added to the Release

### `file`

**Required** The full path to the file to be added as an asset to the Release.

## Example usage

```
uses: embedded-office/action-release@v1
with:
  token: ${{ secrets.GITHUB_TOKEN }}
  tag-name: 'v1.2.3'
  asset-name: 'my-app.dmg'
  file: 'out/dist/my-app.dmg'
```
