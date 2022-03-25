<#
  Normally, when you call `yarn set version 3.1.1`, it will install the release in `./.yarn/releases` and add a line to the .yarnrc.yml file to point to the release.
  However, this overwrites the current .yarnrc.yml contents and we want the local dev environment to still use yarn v1, which it won't if the .yarnrc.yml points
  to the newer release. So we run this script to append the path to the .yarnrc.yml file so that the CI can use yarn v3 without affecting the local dev environment.
#>

Add-Content -Path .yarnrc.yml -Value 'yarnPath: ".yarn/releases/yarn-3.1.1.cjs"'
