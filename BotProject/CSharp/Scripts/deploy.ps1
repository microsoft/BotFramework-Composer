#Requires -Version 6

Param(
	[string] $name,
	[string] $environment,
	# [string] $luisAuthoringKey,
	# [string] $luisAuthoringRegion,
	[string] $projFolder = $(Get-Location),
	[string] $botPath,
	[string] $logFile = $(Join-Path $PSScriptRoot .. "deploy_log.txt")
)

# Write-Host "name: $name, resourceGroup: $resourceGroup, projFolder:  $projFolder"

# Get mandatory parameters
if (-not $name) {
    $name = Read-Host "? Bot Web App Name"
}

# if (-not $resourceGroup) {
#     $resourceGroup = Read-Host "? Bot Resource Group"
# }

# Reset log file
if (Test-Path $logFile) {
	Clear-Content $logFile -Force | Out-Null
}
else {
	New-Item -Path $logFile | Out-Null
}

# Check for existing deployment files
if (-not (Test-Path (Join-Path $projFolder '.deployment'))) {
	# Add needed deployment files for az
	az bot prepare-deploy --lang Csharp --code-dir $projFolder --proj-file-path BotProject.csproj --output json | Out-Null
}

# Delete src zip, if it exists
$zipPath = $(Join-Path $projFolder 'code.zip')
if (Test-Path $zipPath) {
	Remove-Item $zipPath -Force | Out-Null
}

# Add Luis Config to appsettings
# if ($luisAuthoringKey -and $luisAuthoringRegion)
# {
# 	if (Test-Path $(Join-Path $projDir appsettings.json)) {
# 		$settings = Get-Content $(Join-Path $projDir appsettings.json) | ConvertFrom-Json
# 	}
# 	else {
# 		$settings = New-Object PSObject
# 	}

# 	$luisEndpoint = "https://$luisAuthoringRegion.api.cognitive.microsoft.com"

# 	$luisConfig = @{}

# 	$luisConfig["endpointKey"] = $luisAuthoringKey
# 	$luisConfig["endpoint"] = $luisEndpoint

# 	$settings | Add-Member -Type NoteProperty -Force -Name 'luis' -Value $luisConfig

# 	$settings | ConvertTo-Json -depth 100 | Out-File $(Join-Path $projDir appsettings.json)
# }


# Perform dotnet publish step ahead of zipping up
$publishFolder = $(Join-Path $projFolder 'bin\Release\netcoreapp2.2')
dotnet publish -c release -o $publishFolder -v q > $logFile

$resourceGroup = "$name-$environment"

if($?) 
{     
	# Copy bot files to running folder
	$remoteBotPath = $(Join-Path $publishFolder "RunningInstance")
	Remove-Item $remoteBotPath -Recurse -ErrorAction Ignore
	Copy-Item -Path $botPath -Recurse -Destination $remoteBotPath -Container -Force

	# Compress source code
	Get-ChildItem -Path "$($publishFolder)" | Compress-Archive -DestinationPath "$($zipPath)" -Force | Out-Null

	# Publish zip to Azure
	Write-Host "> Publishing to Azure ..." -ForegroundColor Green
	(az webapp deployment source config-zip `
		--resource-group $resourceGroup `
		--name $name `
		--src $zipPath `
        --output json) 2>> $logFile | Out-Null
} 
else 
{       
	Write-Host "! Could not deploy automatically to Azure. Review the log for more information." -ForegroundColor DarkRed
	Write-Host "! Log: $($logFile)" -ForegroundColor DarkRed    
}       