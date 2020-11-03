Param(
	[string] $name,
	[string] $environment,
	[string] $hostName,
	[string] $luisAuthoringKey,
	[string] $luisAuthoringRegion,
	[string] $qnaSubscriptionKey,
	[string] $language,
	[string] $projFolder = $(Get-Location),
	[string] $botPath,
	[string] $logFile = $(Join-Path $PSScriptRoot .. "deploy_log.txt")
)

if ($PSVersionTable.PSVersion.Major -lt 6) {
	Write-Host "! Powershell 6 is required, current version is $($PSVersionTable.PSVersion.Major), please refer following documents for help."
	Write-Host "For Windows - https://docs.microsoft.com/en-us/powershell/scripting/install/installing-powershell-core-on-windows?view=powershell-6"
	Write-Host "For Mac - https://docs.microsoft.com/en-us/powershell/scripting/install/installing-powershell-core-on-macos?view=powershell-6"
	Break
}

if ((dotnet --version) -lt 3) {
	Write-Host "! dotnet core 3.0 is required, please refer following documents for help."
	Write-Host "https://dotnet.microsoft.com/download/dotnet-core/3.0"
	Break
}

# Get mandatory parameters
if (-not $name) {
	$name = Read-Host "? Bot Web App Name"
}

if (-not $environment) {
	$environment = Read-Host "? Environment Name (single word, all lowercase)"
	$environment = $environment.ToLower().Split(" ") | Select-Object -First 1
}

if (-not $language) {
	$language = "en-us"
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
	az bot prepare-deploy --lang Csharp --code-dir $projFolder --proj-file-path Microsoft.BotFramework.Composer.WebApp.csproj --output json | Out-Null
}

# Delete src zip, if it exists
$zipPath = $(Join-Path $projFolder 'code.zip')
if (Test-Path $zipPath) {
	Remove-Item $zipPath -Force | Out-Null
}

# Perform dotnet publish step ahead of zipping up
$publishFolder = $(Join-Path $projFolder 'bin\Release\netcoreapp3.1')
dotnet publish -c release -o $publishFolder -v q > $logFile

# Copy bot files to running folder
$remoteBotPath = $(Join-Path $publishFolder "ComposerDialogs")
Remove-Item $remoteBotPath -Recurse -ErrorAction Ignore

if (-not $botPath) {
	# If don't provide bot path, then try to copy all dialogs except the runtime folder in parent folder to the publishing folder (bin\Realse\ Folder)
	$botPath = '../..'
}

$botPath = $(Join-Path $botPath '*')
Write-Host "Publishing dialogs from external bot project: $($botPath)"
Copy-Item -Path (Get-Item -Path $botPath -Exclude ('runtime', 'generated')).FullName -Destination $remoteBotPath -Recurse -Force -Container

# Try to get luis config from appsettings
$settingsPath = $(Join-Path $remoteBotPath settings appsettings.json)
$settings = Get-Content $settingsPath | ConvertFrom-Json
$luisSettings = $settings.luis
$qnaSettings = $settings.qna

if (-not $luisAuthoringKey) {
	$luisAuthoringKey = $luisSettings.authoringKey
}

if (-not $luisAuthoringRegion) {
	$luisAuthoringRegion = $luisSettings.region
	if (-not $luisAuthoringRegion) {
		$luisAuthoringRegion = 'westus'
	}
}

if (-not $qnaSubscriptionKey) {
	$qnaSubscriptionKey = $qnaSettings.subscriptionKey
}

# set feature configuration
$featureConfig = @{ }
if ($settings.feature) {
	$featureConfig = $settings.feature
}
else {
	# Enable all features to true by default
	$featureConfig["UseTelementryLoggerMiddleware"] = $true
	$featureConfig["UseTranscriptLoggerMiddleware"] = $true
	$featureConfig["UseShowTypingMiddleware"] = $true
	$featureConfig["UseInspectionMiddleware"] = $true
	$featureConfig["UseCosmosDb"] = $true
}



# if luis and qna enabled, crosstrain
if ($luisAuthoringKey -or $qnaSubscriptionKey) {
	# if luis or qna enabled, ensure bf cli installed
	if (Get-Command bf -errorAction SilentlyContinue) {}
	else {
		Write-Host "bf command does not exist. Start installation..."
		npm i -g @microsoft/botframework-cli@next
		bf plugins:install @microsoft/bf-sampler-cli@beta
		Write-Host "successfully"
	}

	Set-Location -Path $remoteBotPath

	# create generated folder if not
	if (!(Test-Path generated)) {
		$null = New-Item -ItemType Directory -Force -Path generated
	}
	if (!(Test-Path generated\interruption)) {
		New-Item -ItemType Directory -Force -Path generated\interruption
	}

	bf luis:cross-train --in . --out generated\interruption --config .\settings\cross-train.config.json --force

	if ($luisAuthoringKey) {
		bf sampler:sampling --in generated\interruption --out generated\interruption --force
	}
}

# if luis enabled
if ($luisAuthoringKey) {
	Set-Location -Path $remoteBotPath

	# execute lubuild
	bf luis:build --in generated\interruption --authoringKey $luisAuthoringKey --botName $name --out generated --suffix $environment --force --log

	if ($?) {
		Write-Host "lubuild succeeded"
	}
	else {
		Write-Host "lubuild failed, please verify your luis models."
		Break
	}

	Set-Location -Path $projFolder

	$settings = New-Object PSObject

	# get all luis settings
	$luisConfigFiles = Get-ChildItem -Path $publishFolder -Include "luis.settings*" -Recurse -Force

	# get all luis app ids
	$luisAppIds = @{ }

	foreach ($luisConfigFile in $luisConfigFiles) {
		$luisSetting = Get-Content $luisConfigFile.FullName | ConvertFrom-Json
		$luis = $luisSetting.luis
		$luis.PSObject.Properties | Foreach-Object { $luisAppIds[$_.Name] = $_.Value }
	}

	$luisEndpoint = "https://$luisAuthoringRegion.api.cognitive.microsoft.com"

	$luisConfig = @{ }

	$luisConfig["endpoint"] = $luisEndpoint

	foreach ($key in $luisAppIds.Keys) { $luisConfig[$key] = $luisAppIds[$key] }

	# add luis settings to the main settings
	$settings | Add-Member -Type NoteProperty -Force -Name 'luis' -Value $luisConfig

	$tokenResponse = (az account get-access-token) | ConvertFrom-Json
	$token = $tokenResponse.accessToken

	if (-not $token) {
		Write-Host "! Could not get valid Azure access token"
		Break
	}

	# assign luis key to luis app ids, firstly get luis account by $name-$environment-luis
	Write-Host "Getting Luis accounts..."
	$luisAccountEndpoint = "$luisEndpoint/luis/api/v2.0/azureaccounts"
	$luisAccount = $null
	try {
		$luisAccounts = Invoke-WebRequest -Method GET -Uri $luisAccountEndpoint -Headers @{"Authorization" = "Bearer $token"; "Ocp-Apim-Subscription-Key" = $luisAuthoringKey } | ConvertFrom-Json

		foreach ($account in $luisAccounts) {
			if ($account.AccountName -eq "$name-$environment-luis") {
				$luisAccount = $account
				break
			}
		}
	}
	catch {
		Write-Host "Return invalid status code while gettings luis accounts: $($_.Exception.Response.StatusCode.Value__), error message: $($_.Exception.Response)"
		break
	}

	$luisAccountBody = $luisAccount | ConvertTo-Json

	# Assign each luis id in luisAppIds with the endpoint key
	foreach ($k in $luisAppIds.Keys) {
		$luisAppId = $luisAppIds.Item($k).appId
		Write-Host "Assigning to Luis app id: $luisAppId"
		$luisAssignEndpoint = "$luisEndpoint/luis/api/v2.0/apps/$luisAppId/azureaccounts"
		try {
			$response = Invoke-WebRequest -Method POST -ContentType application/json -Body $luisAccountBody -Uri $luisAssignEndpoint -Headers @{"Authorization" = "Bearer $token"; "Ocp-Apim-Subscription-Key" = $luisAuthoringKey } | ConvertFrom-Json
			Write-Host $response
		}
		catch {
			Write-Host "Return invalid status code while assigning key to luis apps: $($_.Exception.Response.StatusCode.Value__), error message: $($_.Exception.Response)"
			exit
		}
	}
}

# if qna enabled
if ($qnaSubscriptionKey) {
	Set-Location -Path $remoteBotPath
	bf qnamaker:build --in generated\interruption --subscriptionKey $qnaSubscriptionKey --botName $name --out generated --suffix $environment --force --log
	if ($?) {
		Write-Host "qna build succeeded"
	}
	else {
		Write-Host "qna build failed, please verify your qna models."
		Break
	}
}


# add feature config to the settings
$settings | Add-Member -Type NoteProperty -Force -Name 'feature' -Value $featureConfig
$settings | ConvertTo-Json -depth 100 | Out-File $settingsPath

$resourceGroup = "$name-$environment"

# if all done, compress the folder and deploy to azure
if ($?) {
	# Compress source code
	Get-ChildItem -Path "$($publishFolder)" | Compress-Archive -DestinationPath "$($zipPath)" -Force | Out-Null

	# Publish zip to Azure
	Write-Host "> Publishing to Azure ..." -ForegroundColor Green

	if (-not $hostName) {
		$hostName = "$name-$environment"
	}

	$deployment = (az webapp deployment source config-zip `
			--resource-group $resourceGroup `
			--name $hostName `
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
