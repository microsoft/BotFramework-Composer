import React from 'react';
import { LuFile } from '@bfc/indexers';
interface InlineLuEditorProps {
  file: LuFile;
  onSave: (newValue?: string) => void;
  errorMsg: string;
}
declare const InlineLuEditor: React.FC<InlineLuEditorProps>;
export default InlineLuEditor;
//# sourceMappingURL=InlineLuEditor.d.ts.map
