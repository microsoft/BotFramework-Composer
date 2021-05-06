// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { OpenConfirmModal } from '@bfc/ui-shared';
import formatMessage from 'format-message';
import { Link } from 'office-ui-fabric-react/lib/Link';

const contentContainer = css`
  max-width: 444px;
`;

export const BotConvertConfirmDialog = () => {
  return OpenConfirmModal(formatMessage('Convert your project to the latest format'), '', {
    confirmText: formatMessage('Convert'),
    onRenderContent: () => (
      <div css={contentContainer}>
        <p>
          {formatMessage(
            'This project was created in an older version of Composer. To open this project in Composer 2.0, we must copy your project and convert it to the latest format. Your original project will not be changed.'
          )}
        </p>
        <p>
          {formatMessage('If you have created custom components, you might need to rebuild them. ')}
          <Link href="https://github.com/microsoft/botframework-components/blob/main/docs/overview.md" target="_blank">
            Learn more about custom components.
          </Link>
        </p>
      </div>
    ),
  });
};
