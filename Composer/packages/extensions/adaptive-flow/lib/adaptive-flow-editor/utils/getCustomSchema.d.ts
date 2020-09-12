import { OBISchema } from '@bfc/shared';
interface CustomSchemaSet {
    actions?: OBISchema;
    triggers?: OBISchema;
    recognizers?: OBISchema;
}
export declare const getCustomSchema: (baseSchema?: OBISchema | undefined, ejectedSchema?: OBISchema | undefined) => CustomSchemaSet;
export {};
//# sourceMappingURL=getCustomSchema.d.ts.map