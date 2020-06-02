#!/bin/bash
runtime=${runtime:-azurewebapp}
SCHEMA_FILE=sdk.schema
BACKUP_SCHEMA_FILE=sdk-backup.schema

while [ $# -gt 0 ]; do
   if [[ $1 == *"-"* ]]; then
      param="${1/-/}"
      declare $param="$2"
   fi
  shift
done

echo "Running schema merge on $runtime runtime."
mv "./$SCHEMA_FILE" "./$BACKUP_SCHEMA_FILE"

bf dialog:merge "*.schema" "../runtime/$runtime/*.csproj" -o $SCHEMA_FILE -v

if [ -f "$SCHEMA_FILE" ]; then
  echo "Schema merged succesfully."
  rm -rf "./$BACKUP_SCHEMA_FILE"
else
  mv "./$BACKUP_SCHEMA_FILE" "./$SCHEMA_FILE"
fi
