Param(
	[string] $name,
	[string] $environment,
	[string] $luisAuthoringKey,
	[string] $luisAuthoringRegion,
	[string] $projFolder = $(Get-Location),
	[string] $botPath,
	[string] $logFile = $(Join-Path $PSScriptRoot .. "deploy_log.txt")
)

if ($PSVersionTable.PSVersion.Major -lt 6){
	Write-Host "! Powershell 6 is required, current version is $($PSVersionTable.PSVersion.Major), please refer following documents for help."
	Write-Host "For Windows - https://docs.microsoft.com/en-us/powershell/scripting/install/installing-powershell-core-on-windows?view=powershell-6"
	Write-Host "For Mac - https://docs.microsoft.com/en-us/powershell/scripting/install/installing-powershell-core-on-macos?view=powershell-6"
	Break
}

# Get mandatory parameters
if (-not $name) {
    $name = Read-Host "? Bot Web App Name"
}

if (-not $environment)
{
	$environment = Read-Host "? Environment Name (single word, all lowercase)"
	$environment = $environment.ToLower().Split(" ") | Select-Object -First 1
}

if (-not $botPath) {
	$botPath = Read-Host "? The Reletive Path Of Bot"
}


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


# Perform dotnet publish step ahead of zipping up
$publishFolder = $(Join-Path $projFolder 'bin\Release\netcoreapp2.2')
dotnet publish -c release -o $publishFolder -v q > $logFile


# Copy bot files to running folder
$remoteBotPath = $(Join-Path $publishFolder "RunningInstance")
Remove-Item $remoteBotPath -Recurse -ErrorAction Ignore
Copy-Item -Path $botPath -Recurse -Destination $remoteBotPath -Container -Force

# Merge from custom config files
$customConfigFiles = Get-ChildItem -Path $remoteBotPath -Include "appsettings.json" -Recurse -Force
if ($customConfigFiles)
{
	if (Test-Path $(Join-Path $publishFolder appsettings.json)) {
		$settings = Get-Content $(Join-Path $publishFolder appsettings.json) | ConvertFrom-Json
	}
	else {
		$settings = New-Object PSObject
	}

	$customConfig = @{}
	$customSetting = Get-Content $customConfigFiles.FullName | ConvertFrom-Json
	$customSetting.PSObject.Properties | Foreach-Object { $customConfig[$_.Name] = $_.Value }
	foreach ($key in $customConfig.Keys) { $settings | Add-Member -Type NoteProperty -Force -Name $key -Value $customConfig[$key] }

	$settings | ConvertTo-Json -depth 100 | Out-File $(Join-Path $publishFolder appsettings.json)
}

# Add Luis Config to appsettings
if ($luisAuthoringKey -and $luisAuthoringRegion)
{
	# change setting file in publish folder
	if (Test-Path $(Join-Path $publishFolder appsettings.json)) {
		$settings = Get-Content $(Join-Path $publishFolder appsettings.json) | ConvertFrom-Json
	}
	else {
		$settings = New-Object PSObject
	}

	$luisConfigFiles = Get-ChildItem -Path $publishFolder -Include "luis.settings*" -Recurse -Force

	$luisAppIds = @{}

	foreach ($luisConfigFile in $luisConfigFiles)
	{
		$luisSetting = Get-Content $luisConfigFile.FullName | ConvertFrom-Json
		$luis = $luisSetting.luis
		$luis.PSObject.Properties | Foreach-Object { $luisAppIds[$_.Name] = $_.Value }
	}

	$luisEndpoint = "https://$luisAuthoringRegion.api.cognitive.microsoft.com"

	$luisConfig = @{}

	dotnet user-secrets set "luis:endpointKey" "$luisAuthoringKey" --project $publishFolder
	
	$luisConfig["endpoint"] = $luisEndpoint
	
	foreach ($key in $luisAppIds.Keys) { $luisConfig[$key] = $luisAppIds[$key] }

	$settings | Add-Member -Type NoteProperty -Force -Name 'luis' -Value $luisConfig

	$settings | ConvertTo-Json -depth 100 | Out-File $(Join-Path $publishFolder appsettings.json)
}

$resourceGroup = "$name-$environment"

if($?) 
{     
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