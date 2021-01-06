// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import formatMessage from 'format-message';
import { ITextField, TextField } from 'office-ui-fabric-react/lib/TextField';
import { IButtonStyles, IconButton } from 'office-ui-fabric-react/lib/Button';
import { useRef } from 'react';
import { Icon } from 'office-ui-fabric-react/lib/Icon';

import { CardProps } from '../Notifications/NotificationCard';
import { colors } from '../../constants';

const container = css`
  padding: 0 16px 16px 40px;
  position: relative;
`;

const locationContainer = css`
  display: flex;
  flex-flow: row nowrap;
  position: relative;
`;

const copyContainer = css`
  margin-top: 0;
`;

const greenCheckMark = css`
  position: absolute;
  color: ${colors.green};
  font-size: 12px;
  top: 10px;
  left: 12px;
`;

const iconContainer = css`
  position: absolute;
  left: 12px;
  top: 2px;
`;

const copyIconColor = colors.shade30;
const copyIconStyles: IButtonStyles = {
  root: { position: 'absolute', right: 0, color: copyIconColor },
  rootHovered: { backgroundColor: 'transparent', color: copyIconColor },
  rootPressed: { backgroundColor: 'transparent', color: copyIconColor },
};

type ImportSuccessNotificationProps = {
  location?: string;
  importedToExisting: boolean;
};

export const ImportSuccessNotificationWrapper = (outerProps: ImportSuccessNotificationProps) => {
  const ImportSuccessNotification: React.FC<CardProps> = (props: CardProps) => {
    const { location, importedToExisting } = outerProps;
    const textFieldRef = useRef<ITextField>(null);
    const copyLocationToClipboard = () => {
      try {
        textFieldRef.current?.select();
        document.execCommand('copy');
        textFieldRef.current?.setSelectionRange(0, 0);
        textFieldRef.current?.blur();
      } catch (e) {
        console.error('Something went wrong when trying to copy bot location to clipboard.', e, location);
      }
    };

    const existingProjectCopy = formatMessage(' Previous bot content has been backed up to:');

    return (
      <div css={container}>
        <div css={iconContainer}>
          <Icon iconName={'CloudDownload'} />
          <Icon css={greenCheckMark} iconName={'Accept'} />
        </div>
        <p css={copyContainer}>
          {formatMessage('Bot content was successfully imported.')}
          {importedToExisting && existingProjectCopy}
        </p>
        {importedToExisting && (
          <div css={locationContainer}>
            <TextField
              readOnly
              componentRef={textFieldRef}
              styles={{ root: { width: '100%' }, field: { paddingRight: 28 } }}
              value={location}
            />
            <IconButton
              ariaLabel={formatMessage('Copy project location to clipboard')}
              iconProps={{ iconName: 'Copy' }}
              styles={copyIconStyles}
              title={formatMessage('Copy project location to clipboard')}
              onClick={copyLocationToClipboard}
            />
          </div>
        )}
      </div>
    );
  };
  return ImportSuccessNotification;
};
