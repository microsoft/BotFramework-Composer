**BF Composer and the declarative schema**

When we take new schema, the following needs to be considered:

1. Update `Composer/packages/server/schemas/sdk.schema` with the updated, merged schema
2. Update `Composer/packages/lib/shared/src/labelMap.ts` with new Entity labels
3. Update `Composer/packages/lib/shared/src/viewUtils.ts` with new SDKTypes & DialogGroups
