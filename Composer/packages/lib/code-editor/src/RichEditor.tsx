// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { Fragment, useState } from 'react';
import { MessageBar, MessageBarType, Link } from 'office-ui-fabric-react/lib';
import { SharedColors, NeutralColors } from '@uifabric/fluent-theme';

import { BaseEditor, BaseEditorProps } from './BaseEditor';
import { processSize } from './utils/common';

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

  const getHeight = () => {
    if (height === null || height === undefined) {
      return '100%';
    }

    return processSize(height);
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
          height: `calc(${getHeight()} - 40px)`,
          borderWidth: '2px',
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
        <MessageBar
          messageBarType={MessageBarType.error}
          isMultiline={false}
          dismissButtonAriaLabel="Close"
          truncated={true}
          overflowButtonAriaLabel="See more"
        >
          This text has errors in the syntax. Refer to the syntax documentation
          <Link href={helpURL} target="_blank" rel="noopener noreferrer">
            here
          </Link>
          .
        </MessageBar>
      )}
    </Fragment>
  );
}
