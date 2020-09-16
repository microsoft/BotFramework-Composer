Param(
    [string] $hostname,
    [string] $resourceGroup,
    [string] $path,
    [string] $botPath,
	[string] $projFolder = $(Get-Location),
	[string] $logFile = $(Join-Path $PSScriptRoot .. "deploy_log.txt")
)

if ($PSVersionTable.PSVersion.Major -lt 6) {
	Write-Host "! Powershell 6 is required, current version is $($PSVersionTable.PSVersion.Major), please refer following documents for help."
	Write-Host "For Windows - https://docs.microsoft.com/en-us/powershell/scripting/install/installing-powershell-core-on-windows?view=powershell-6"
	Write-Host "For Mac - https://docs.microsoft.com/en-us/powershell/scripting/install/installing-powershell-core-on-macos?view=powershell-6"
	Break
}

# Get mandatory parameters

# the host name of web app
if (-not $hostname) {
	$hostname = Read-Host "? Please Enter Web App Hostname (Required)"
}

# the resource group name
if (-not $resourceGroup) {
	$resourceGroup = Read-Host "? Please Enter Resource Group Name (Required)"
}

# the bot assets path, default ./
if (-not $path) {
    $path = "./"
}

# Reset log file
if (Test-Path $logFile) {
	Clear-Content $logFile -Force | Out-Null
}
else {
	New-Item -Path $logFile | Out-Null
}

# zip path, default ./code.zip, delete src zip, if it exists
$zipPath = $(Join-Path $path "code.zip")
if (Test-Path $zipPath) {
	Remove-Item $zipPath -Force | Out-Null
}

# bot assets path, default same as path : ./
if (-not $botPath) {
	# bot assets path
	$botPath = $path
}

$botPath = $(Join-Path $botPath "*")

# runtime folder path, default ./runtime/azurewebapp
$runtimePath = $(Join-Path $path "./runtime/azurewebapp")

Write-Host "Bot Assets: $($botPath)"
Write-Host "Runtime Path $($runtimePath)"

Write-Host "dotnet publishing ..."
# Perform dotnet publish step ahead of zipping up
$publishFolder = $(Join-Path $runtimePath "bin\Release\netcoreapp3.1")

dotnet publish $runtimePath -c release -o $publishFolder -v q > $logFile

# Copy bot files to running folder, if already exists, remove it
$remoteBotPath = $(Join-Path $publishFolder "ComposerDialogs")
Remove-Item $remoteBotPath -Recurse -ErrorAction Ignore

Write-Host "Copy bot assets to composer dialogs folder ..."
Copy-Item -Path (Get-Item -Path $botPath -Exclude ("runtime")).FullName -Destination $remoteBotPath -Recurse -Force -Container

if ($?) {
    # Compress source code
    Write-Host "Compress runtime ..."

	Get-ChildItem -Path "$($publishFolder)" | Compress-Archive -DestinationPath "$($zipPath)" -Force | Out-Null

	# Publish zip to Azure
	Write-Host "> Publishing to Azure ..." -ForegroundColor Green
	$deployment = (az webapp deployment source config-zip `
			--resource-group $resourceGroup `
			--name $hostname `
			--src $zipPath `
			--output json) 2>> $logFile

	if ($deployment) {
		Write-Host "Publish Success"
	}
	else {
		Write-Host "! Deploy failed. Review the log for more information." -ForegroundColor DarkRed
		Write-Host "! Log: $($logFile)" -ForegroundColor DarkRed
	}
}
else {
	Write-Host "! Could not deploy automatically to Azure. Review the log for more information." -ForegroundColor DarkRed
	Write-Host "! Log: $($logFile)" -ForegroundColor DarkRed
}
