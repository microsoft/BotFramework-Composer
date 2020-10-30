/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import formatMessage from 'format-message';
import { ITextField, TextField } from 'office-ui-fabric-react/lib/TextField';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { useRef } from 'react';

import { CardProps } from '../Notifications/NotificationCard';

const container = css`
  padding: 0 8px 16px 12px;
`;

const locationContainer = css`
  display: flex;
  flex-flow: row nowrap;
`;

const blueHighlight = css`
  color: #106ebe;
`;

type ImportSuccessNotificationProps = {
  botName: string;
  location?: string;
  importedToExisting: boolean;
  serviceName: string;
};

export const ImportSuccessNotification = (outerProps: ImportSuccessNotificationProps) => (props: CardProps) => {
  const { botName, location, importedToExisting, serviceName } = outerProps;
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

  const existingProjectCopy = formatMessage(' All content of {botName} has been backed up to the following location', {
    botName,
  });

  return (
    <div css={container}>
      <p>
        {formatMessage('Bot content from {serviceName} was successfully imported to ', { serviceName })}
        <span css={blueHighlight}>{botName}.</span>
        {importedToExisting && existingProjectCopy}
      </p>
      {importedToExisting && (
        <div css={locationContainer}>
          <TextField
            value={location}
            readOnly={true}
            componentRef={textFieldRef}
            styles={{ root: { width: '100%' } }}
          />
          <IconButton
            iconProps={{ iconName: 'Copy', color: '#005A9E' }}
            title={'Copy project location to clipboard'}
            ariaLabel={'Copy project location to clipboard'}
            onClick={copyLocationToClipboard}
          />
        </div>
      )}
    </div>
  );
};
