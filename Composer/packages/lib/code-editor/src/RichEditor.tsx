import React, { Fragment, useMemo } from 'react';
import { SharedColors, NeutralColors } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';

import { BaseEditor, BaseEditorProps } from './BaseEditor';

export interface RichEditorProps extends BaseEditorProps {
  hidePlaceholder?: boolean; // default false
  placeholder?: string; // empty placeholder
  errorMsg?: string; // error text show below editor
  helpURL?: string; //  help link show below editor
  height?: number | string;
}

export function RichEditor(props: RichEditorProps) {
  const { errorMsg, helpURL, placeholder, hidePlaceholder = false, height, ...rest } = props;
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

  const baseEditor = <BaseEditor {...rest} placeholder={hidePlaceholder ? undefined : placeholder} />;
  // CodeRange editing require an non-controled/refresh component, so here make it memoed
  const memoEditor = useMemo(() => {
    return baseEditor;
  }, []);
  const getHeight = () => {
    if (height === null || height === undefined) {
      return '100%';
    }

    if (typeof height === 'string') {
      return height;
    }

    return `${height}px`;
  };

  return (
    <Fragment>
      <div
        style={{
          height: getHeight(),
          border: '1px solid transparent',
          borderColor: isInvalid ? SharedColors.red20 : NeutralColors.gray30,
          transition: `border-color 0.1s ${isInvalid ? 'ease-out' : 'ease-in'}`,
        }}
      >
        {props.codeRange ? memoEditor : baseEditor}
      </div>
      {isInvalid && (
        <div style={{ fontSize: '14px', color: SharedColors.red20 }}>
          <span>{errorHelp}</span>
        </div>
      )}
    </Fragment>
  );
}
