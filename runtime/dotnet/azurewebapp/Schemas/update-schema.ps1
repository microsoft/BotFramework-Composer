param (
  [string]$runtime = "azurewebapp"
)
$SCHEMA_FILE="sdk.schema"
$BACKUP_SCHEMA_FILE="sdk-backup.schema"

Write-Host "Running schema merge on $runtime runtime."

Move-Item -Force -Path $SCHEMA_FILE -Destination $BACKUP_SCHEMA_FILE

bf dialog:merge "*.schema" "../runtime/$runtime/*.csproj" -o $SCHEMA_FILE -v

if (Test-Path $SCHEMA_FILE -PathType leaf)
{
  Remove-Item -Force -Path $BACKUP_SCHEMA_FILE
  Write-Host "Schema merged succesfully."
}
else
{
  Move-Item -Force -Path $BACKUP_SCHEMA_FILE -Destination $SCHEMA_FILE
}
