import React from 'react';

import BaseEditor, { BaseEditorProps } from './BaseEditor';

const LG_HELP =
  'https://github.com/microsoft/BotBuilder-Samples/blob/master/experimental/language-generation/docs/lg-file-format.md';
const placeholder = `> To learn more about the LG file format, read the documentation at
> ${LG_HELP}`;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface LgEditorProps extends BaseEditorProps {
  hidePlaceholder: boolean;
}

export function LgEditor(props: LgEditorProps) {
  return <BaseEditor placeholder={props.hidePlaceholder ? undefined : placeholder} {...props} />;
}
