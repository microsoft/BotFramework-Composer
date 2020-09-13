import { FieldWidget, FormUISchema, JSONSchema7, UIOptions } from '@bfc/extension';
/**
 * Resolves field widget in this order:
 *   UISchema field override, schema.$role, schema.$kind, schema.type
 * @param schema
 * @param uiOptions
 */
export declare function resolveFieldWidget(
  schema?: JSONSchema7,
  uiOptions?: UIOptions,
  globalUIOptions?: FormUISchema
): FieldWidget;
//# sourceMappingURL=resolveFieldWidget.d.ts.map
