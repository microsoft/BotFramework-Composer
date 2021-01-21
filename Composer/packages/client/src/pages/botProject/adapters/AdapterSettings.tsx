// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import formatMessage from 'format-message';

import { CollapsableWrapper } from '../../../components/CollapsableWrapper';
import { title, subtitle } from '../styles';

const header = () => <div css={subtitle}>{formatMessage('Connect your bot to other messaging services.')}</div>;

const AdapterSettings = () => {
  return (
    <CollapsableWrapper title={formatMessage('Adapters')} titleStyle={title}>
      {header()}
    </CollapsableWrapper>
  );
};

export default AdapterSettings;
