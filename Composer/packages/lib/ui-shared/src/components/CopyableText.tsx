// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { FluentTheme } from '@uifabric/fluent-theme';

const buttonIconProps = { iconName: 'Copy' };
const rootStyles = {
  root: { background: 'rgba(0, 0, 0, .08)', margin: '8px 0 4px 0' },
};
const textStyles = { root: { padding: '6px 4px 6px 12px' } };
const preStyles: React.CSSProperties = {
  margin: 0,
  padding: 0,
  fontSize: FluentTheme.fonts.small.fontSize,
  whiteSpace: 'pre-line',
  wordBreak: 'break-all',
  fontFamily: 'Menlo,Consolas,Courier New,monospace',
};

type Props = {
  className?: string;
  text: string;
  buttonAriaLabel?: string;
  buttonTitle?: string;
};

export const CopyableText = (props: Props) => {
  const { className, text, buttonAriaLabel = 'Copy text to clipboard', buttonTitle = 'Copy text to clipboard' } = props;

  const copyToClipboard = React.useCallback(async () => {
    try {
      await window.navigator.clipboard.writeText(text);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Error: Copy text to clipboard. details: ', e);
    }
  }, [text]);

  return (
    <Stack horizontal className={className} styles={rootStyles}>
      <Stack.Item grow styles={textStyles}>
        <pre style={preStyles}>{text}</pre>
      </Stack.Item>
      <Stack.Item verticalFill>
        <IconButton
          ariaLabel={buttonAriaLabel}
          data-testid="copy-to-clipboard-button"
          iconProps={buttonIconProps}
          title={buttonTitle}
          onClick={copyToClipboard}
        />
      </Stack.Item>
    </Stack>
  );
};
