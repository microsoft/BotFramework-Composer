// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import formatMessage from 'format-message';

import { BASEPATH } from '../../constants';

import { formEditor } from './styles';

const rootPath = BASEPATH.replace(/\/+$/g, '');

const PropertyEditor: React.FC = () => {
  return (
    <iframe
      id="FormEditor"
      key="FormEditor"
      name="FormEditor"
      css={formEditor}
      src={`${rootPath}/extensionContainer.html`}
      title={formatMessage('form editor')}
    />
  );
};

export { PropertyEditor };
