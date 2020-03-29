# ayy-bee

A/B test action which merges on commit into any A/B test branches and notifies a slack channel if there's a merge conflict :honeybee:

## Example workflow

```yaml
name: ayy-bee workflow

on:
  push:
    branches: [master]

jobs:
  AB:
    name: ayy-bee
    runs-on: ubuntu-latest
    steps:
      - uses: mannum/ayy-bee-action@master
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          branchPrefix: ab
```
