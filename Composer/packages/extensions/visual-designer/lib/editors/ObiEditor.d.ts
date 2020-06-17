import { FC } from 'react';
export declare const ObiEditor: FC<ObiEditorProps>;
interface ObiEditorProps {
  path: string;
  data: any;
  focusedSteps: string[];
  onFocusSteps: (stepIds: string[], fragment?: string) => any;
  onFocusEvent: (eventId: string) => any;
  onClipboardChange: (actions: any[]) => void;
  onCreateDialog: (actions: any[]) => Promise<string | null>;
  onOpen: (calleeDialog: string, callerId: string) => any;
  onChange: (newDialog: any) => any;
  onSelect: (ids: string[]) => any;
  undo?: () => any;
  redo?: () => any;
  announce: (message: string) => any;
}
export {};
//# sourceMappingURL=ObiEditor.d.ts.map
