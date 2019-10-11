**BF Composer and the declarative schema**

When we take new schema, the following needs to be considered:

1. Update `Composer/packages/server/schemas/sdk.schema` with the updated, merged schema
2. Update `Composer/packages/lib/shared-menus/src/labelMap.ts` with new Entity labels
3. Update `Composer/packages/lib/shared-menus/src/appschema.ts` with new SDKTypes & DialogGroups
4. Update `Composer/packages/extensions/obiformeditor/src/schema/appschema.ts` with the new schema, make changes as appropriate.
5. If necessary, update `Composer/packages/extensions/obiformeditor/src/schema/uischema.ts` for form template configuration.
