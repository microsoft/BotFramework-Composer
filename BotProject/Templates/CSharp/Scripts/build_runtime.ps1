Param(
	[object] $config,
	[string] $customSettingFolder,
  [string] $luisAuthroingKey,
  [SecureString] $appPassword,
  [string] $projFolder = $(Join-Path $(Get-Location) BotProject CSharp)
)

if ($PSVersionTable.PSVersion.Major -lt 6){
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

# This command need dotnet core more than 3.0
dotnet user-secrets init

dotnet build