import { NodeEventTypes } from '../../adaptive-flow-renderer/constants/NodeEventTypes';
export declare const mapKeyboardCommandToEditorEvent: ({
  area,
  command,
}: {
  area: any;
  command: any;
}) =>
  | {
      type: NodeEventTypes;
      payload?: any;
    }
  | undefined;
//# sourceMappingURL=mapKeyboardCommandToEditorEvent.d.ts.map
