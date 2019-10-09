import React from 'react';

import { RichEditor, RichEditorProps } from './RichEditor';

const LU_HELP = 'https://aka.ms/lu-file-format';
const placeholder = `> See ${LU_HELP} to learn about supported LU concepts.`;

export function LuEditor(props: RichEditorProps) {
  return <RichEditor placeholder={placeholder} helpURL={LU_HELP} {...props} />;
}
