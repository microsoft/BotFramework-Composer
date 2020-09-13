import { FlowWidget, FlowSchema } from '../../types/flowRenderer.types';
export declare class WidgetSchemaProvider {
  schema: FlowSchema;
  /**
   * @param schemas Schemas to be merged together. Latter ones will override former ones.
   */
  constructor(...schemas: FlowSchema[]);
  private mergeSchemas;
  get: ($kind: string) => FlowWidget;
}
//# sourceMappingURL=WidgetSchemaProvider.d.ts.map
