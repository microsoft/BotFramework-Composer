import React from 'react';

import { BaseEditorProps, BaseEditor } from './BaseEditor';

const LU_HELP =
  'https://github.com/Microsoft/botbuilder-tools/blob/master/packages/Ludown/docs/lu-file-format.md#lu-file-format';
const placeholder = `>To learn more about the LU file format, read the documentation at
> ${LU_HELP}`;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface LuEditorProps extends BaseEditorProps {}

export function LuEditor(props: LuEditorProps) {
  return <BaseEditor placeholder={placeholder} {...props} />;
}
