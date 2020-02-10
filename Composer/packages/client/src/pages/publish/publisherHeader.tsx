// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import formatMessage from 'format-message';

import { publisherHeader } from './styles';

export const PublisherHeader: React.FC = () => {
  return (
    <div css={publisherHeader.container}>
      <div css={publisherHeader.text}>{formatMessage('Publishers')}</div>
    </div>
  );
};
