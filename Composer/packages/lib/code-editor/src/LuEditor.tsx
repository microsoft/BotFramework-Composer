import React from 'react';

import { RichEditor, RichEditorProps } from './RichEditor';

const LU_HELP =
  'https://github.com/Microsoft/botbuilder-tools/blob/master/packages/Ludown/docs/lu-file-format.md#lu-file-format';
const placeholder = `>To learn more about the LU file format, read the documentation at
> ${LU_HELP}`;

export function LuEditor(props: RichEditorProps) {
  return <RichEditor placeholder={placeholder} helpURL={LU_HELP} {...props} language={'typescript'} />;
}
