import React, { Fragment, useMemo, useState } from 'react';
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
  const [hovered, setHovered] = useState(false);

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

  const getHeight = () => {
    if (height === null || height === undefined) {
      return '100%';
    }

    if (typeof height === 'string') {
      return height;
    }

    return `${height}px`;
  };

  let borderColor = NeutralColors.gray120;

  if (hovered) {
    borderColor = NeutralColors.gray160;
  }

  if (isInvalid) {
    borderColor = SharedColors.red20;
  }

  return (
    <Fragment>
      <div
        style={{
          height: getHeight(),
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor,
          transition: 'border-color 0.1s linear',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <BaseEditor {...rest} placeholder={hidePlaceholder ? undefined : placeholder} />
      </div>
      {isInvalid && (
        <div style={{ fontSize: '14px', color: SharedColors.red20 }}>
          <span>{errorHelp}</span>
        </div>
      )}
    </Fragment>
  );
}
