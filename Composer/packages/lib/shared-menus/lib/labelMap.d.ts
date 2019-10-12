import { SDKTypes } from './appschema';
interface LabelOverride {
  title?: string | false;
  description?: string | false;
}
declare type ConceptLabelKey = SDKTypes | 'Activity';
/**
 * These labels will be used when rendering the EdgeMenu
 * TODO: this is currently a copy of the SDKOverrides content from editor.schema. This should be drilled in from the shell.
 */
export declare const ConceptLabels: { [key in ConceptLabelKey]?: LabelOverride };
export {};
