import { FlowWidget, FlowSchema } from '@bfc/extension';
export declare class FlowSchemaProvider {
  schema: FlowSchema;
  constructor(...schemas: FlowSchema[]);
  private mergeSchemas;
  get: ($kind: string) => FlowWidget;
}
//# sourceMappingURL=flowSchemaProvider.d.ts.map
