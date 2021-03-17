// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import formatMessage from 'format-message';
import { Callout } from 'office-ui-fabric-react/lib/Callout';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { FontWeights } from 'office-ui-fabric-react/lib/Styling';
import { FontSizes } from '@uifabric/fluent-theme';

// -------------------- Styles -------------------- //

const calloutLabel = css`
  font-size: ${FontSizes.size18};
  font-weight: ${FontWeights.bold};
`;

const calloutContainer = css`
  width: 400px;
  padding: 10px;
`;

const calloutDescription = css`
  word-break: break-word;
`;

const calloutLink = css`
  margin-top: 24px;
  margin-bottom: 24px;
`;

const descriptionLabel = css`
  font-weight: bold;
  text-transform: capitalize;
`;

const descriptionText = css`
  margin-left: 15px;
  margin-bottom: 10px;
`;

const descriptionLongText = css`
  overflow: auto;
  font-size: small;
`;
const descriptionShow = css``;
const descriptionHide = css`
  display: none;
`;

// -------------------- ErrorCallout -------------------- //

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

interface IErrorMessage {
  key: string;
  value: any;
  isPre: boolean;
  visible: boolean;
  order: number;
}

interface IField {
  visible?: boolean;
  name: string;
  index?: number;
}

const fieldsWhiteList = new Map<string, IField>();
fieldsWhiteList.set('message', { visible: true, name: 'Message', index: 1 });
fieldsWhiteList.set('stack', { visible: true, name: 'Stack Trace', index: 3 });
fieldsWhiteList.set('stdout', { visible: true, name: 'Output', index: 4 });
fieldsWhiteList.set('cmd', { visible: true, name: 'Command', index: 2 });
fieldsWhiteList.set('killed', { visible: false, name: 'killed' });
fieldsWhiteList.set('code', { visible: false, name: 'code' });
fieldsWhiteList.set('signal', { visible: false, name: 'signal' });
fieldsWhiteList.set('stderr', { visible: false, name: 'stderr' });

export const ErrorCallout: React.FC<IErrorCalloutProps> = (props) => {
  const { onDismiss, onTry, target, visible, error } = props;

  const convertToJson = function (item): any {
    if (typeof item === 'object') {
      return item;
    }

    try {
      return JSON.parse(item);
    } catch (e) {
      return null;
    }
  };
  const parseObject = function (map): IErrorMessage[] {
    return Object.keys(map)
      .map((k) => {
        const field: IField = fieldsWhiteList.get(k) || { visible: true, name: k };

        return {
          key: field.name,
          value: map[k],
          order: field.index || 1000,
          isPre: map[k] != null && typeof map[k] == 'string' && map[k].length >= 75 && map[k].indexOf('\n') != -1,
          visible:
            field.visible ||
            (map[k] != null && ((typeof map[k] == 'string' && map[k].trim() != '') || typeof map[k] != 'string')),
        };
      })
      .sort((left, right) => {
        return left.order - right.order;
      });
  };
  const renderRow = function (obj: IErrorMessage) {
    return (
      <div css={obj.visible ? descriptionShow : descriptionHide}>
        <div css={descriptionLabel}>{obj.key}:</div>
        <div css={descriptionText}>{obj.isPre ? <pre css={descriptionLongText}>{obj.value}</pre> : obj.value}</div>
      </div>
    );
  };

  const buildErrorMessage = (error) => {
    const jsonObj = convertToJson(error.message);
    if (jsonObj === null) {
      return error.message + ' ';
    } else {
      const parsed = parseObject(jsonObj);

      return <div>{parsed.map(renderRow)}</div>;
    }
  };

  return (
    <Callout
      setInitialFocus
      ariaLabel={formatMessage(`{title}. {msg}`, { title: error.title, msg: error.message })}
      data-testid={'errorCallout'}
      gapSpace={0}
      hidden={!visible}
      target={target}
      onDismiss={onDismiss}
    >
      <div css={calloutContainer}>
        <p css={calloutLabel} id="callout-label-id">
          {error.title}
        </p>
        <p css={calloutDescription} id="callout-description-id">
          {buildErrorMessage(error)}
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
          <PrimaryButton text={formatMessage('Try again')} onClick={onTry} />
          <DefaultButton text={formatMessage('Cancel')} onClick={onDismiss} />
        </Stack>
      </div>
    </Callout>
  );
};
