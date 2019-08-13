import React, { Fragment } from 'react';
import { SharedColors } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';

import { BaseEditor, BaseEditorProps } from './BaseEditor';

export interface RichEditorProps extends BaseEditorProps {
  hidePlaceholder?: boolean; // default false
  placeholder?: string; // empty placeholder
  errorMsg?: string; // error text show below editor
  helpURL?: string; //  help link show below editor
}

export function RichEditor(props: RichEditorProps) {
  const { errorMsg, helpURL, placeholder, hidePlaceholder = false } = props;
  const isInvalid = !!errorMsg;

  const errorHelp = formatMessage.rich(
    'This text cannot be saved because there are errors in the syntax. Refer to the syntax documentation <a>here</a>.',
    {
      // eslint-disable-next-line react/display-name
      a: ({ children }) => (
        <a key="a" href={helpURL} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      ),
    }
  );

  return (
    <Fragment>
      <div
        style={{
          height: 'calc(100% - 40px)',
          border: '1px solid transparent',
          borderColor: isInvalid ? SharedColors.red20 : 'transparent',
          transition: `border-color 0.1s ${isInvalid ? 'ease-out' : 'ease-in'}`,
        }}
      >
        <BaseEditor {...props} placeholder={hidePlaceholder ? undefined : placeholder} />
      </div>
      {isInvalid ? (
        <div style={{ fontSize: '14px', color: SharedColors.red20 }}>
          <span>{errorMsg}</span>
          <br />
          <span>{errorHelp}</span>
        </div>
      ) : (
        <Fragment />
      )}
    </Fragment>
  );
}
