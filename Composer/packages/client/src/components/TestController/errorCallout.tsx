// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import formatMessage from 'format-message';
import { Callout } from 'office-ui-fabric-react/lib/Callout';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';

import { calloutLabel, calloutDescription, calloutContainer, calloutLink } from './styles';
export interface IErrorCalloutProps {
  onDismiss: () => void;
  onTry: () => void;
  target: React.RefObject<Element> | null;
  visible: boolean;
  error: {
    title: string;
    message: string;
    link?: { url: string; text: string };
    linkAfterMessage?: { url: string; text: string };
  };
}

export const ErrorCallout: React.FC<IErrorCalloutProps> = props => {
  const { onDismiss, onTry, target, visible, error } = props;
  return (
    <Callout
      gapSpace={0}
      target={target}
      onDismiss={onDismiss}
      setInitialFocus={true}
      hidden={!visible}
      data-testid={'errorCallout'}
      ariaLabel={formatMessage(`{title}. {msg}`, { title: error.title, msg: error.message })}
    >
      <div css={calloutContainer}>
        <p css={calloutLabel} id="callout-label-id">
          {error.title}
        </p>
        <p css={calloutDescription} id="callout-description-id">
          {error.message + ' '}
          {error.linkAfterMessage != null && (
            <Link href={error.linkAfterMessage.url} target={'_blank'}>
              {error.linkAfterMessage.text}
            </Link>
          )}
        </p>
        {error.link != null && (
          <p css={calloutLink}>
            <Link href={error.link.url} target={'_blank'}>
              {error.link.text}
            </Link>
          </p>
        )}
        <Stack
          horizontal
          tokens={{
            childrenGap: 'm',
          }}
        >
          <PrimaryButton onClick={onTry} text={formatMessage('Try again')} />
          <DefaultButton onClick={onDismiss} text={formatMessage('Cancel')} />
        </Stack>
      </div>
    </Callout>
  );
};
