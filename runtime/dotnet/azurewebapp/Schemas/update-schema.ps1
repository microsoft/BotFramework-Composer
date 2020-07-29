param (
  [string]$runtime = "azurewebapp"
)
$SCHEMA_FILE="sdk.schema"
$UISCHEMA_FILE="sdk.uischema"
$BACKUP_SCHEMA_FILE="sdk-backup.schema"
$BACKUP_UISCHEMA_FILE="sdk-backup.schema"

Write-Host "Running schema merge on $runtime runtime."

Move-Item -Force -Path $SCHEMA_FILE -Destination $BACKUP_SCHEMA_FILE
Move-Item -Force -Path $UISCHEMA_FILE -Destination $BACKUP_UISCHEMA_FILE

bf dialog:merge "*.schema" "*.uischema" "../runtime/$runtime/*.csproj" -o $SCHEMA_FILE

if (Test-Path $SCHEMA_FILE -PathType leaf)
{
  Remove-Item -Force -Path $BACKUP_SCHEMA_FILE
  Remove-Item -Force -Path $BACKUP_UISCHEMA_FILE
  Write-Host "Schema merged succesfully."
  Write-Host "  Schema:    $SCHEMA_FILE"
  Write-Host "  UI Schema: $UISCHEMA_FILE"
}
else
{
  Write-Host "Schema merge failed. Restoring previous versions."
  Move-Item -Force -Path $BACKUP_SCHEMA_FILE -Destination $SCHEMA_FILE
}
