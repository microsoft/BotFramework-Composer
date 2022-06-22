<#
  Swap .yarnrc.yml with .yarnrc.prod.yml to enforce auth and repo settings for production build.
  We want the local dev environment to use npm registry for a sake of simplicity and for production builds run in CI we use Azure packages registry.
  So we run this script to swap the .yarnrc.yml file so that the CI can use Azure registry without affecting the local dev environment.
#>

Copy-Item -Path .yarnrc.prod.yml -Destination .yarnrc.yml
