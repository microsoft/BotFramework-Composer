Param(
    [string] $destinationFolder,
    [string] $luisAuthroingKey,
    [SecureString] $appPassword,
    [string] $projFolder = $(Join-Path $(Get-Location) BotProject CSharp)
)

$destinationFolder = $(Join-Path $destinationFolder BotRuntime)

# Copy the whole project folder to destination folder
if (Test-Path $projFolder)
{
    Copy-Item -Path $projFolder -Recurse -Destination $destinationFolder -Container -Force
}

# Merge the appsettings.json in destination folder with the customized appsettings.json in /settings folder
$settingFolder = $(Join-Path $destinationFolder .. settings)
if (Test-Path $settingFolder)
{
    $customConfigFiles = Get-ChildItem -Path $settingFolder -Include appsettings.json -Recurse -Force
    if ($customConfigFiles)
    {
        if (Test-Path $(Join-Path $destinationFolder appsettings.json)) {
            $settings = Get-Content $(Join-Path $destinationFolder appsettings.json) | ConvertFrom-Json
        }
        else {
            $settings = New-Object PSObject
        }

        $customConfig = @{}
        $customSetting = Get-Content $customConfigFiles.FullName | ConvertFrom-Json
        $customSetting.PSObject.Properties | Foreach-Object { $customConfig[$_.Name] = $_.Value }
        foreach ($key in $customConfig.Keys) { $settings | Add-Member -Type NoteProperty -Force -Name $key -Value $customConfig[$key] }

        $settings | Add-Member -Type NoteProperty -Force -Name bot -Value ..

        $settings | ConvertTo-Json -depth 100 | Out-File $(Join-Path $destinationFolder appsettings.json)
    }
}

if ($luisAuthroingKey)
{
    dotnet user-secrets set "luis:endpointKey" $luisAuthroingKey --project $destinationFolder
}

if ($appPassword)
{
    dotnet user-secrets set "MicrosoftAppPassword" $appPassword --project $destinationFolder
}
