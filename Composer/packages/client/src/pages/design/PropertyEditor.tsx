// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import AdaptiveForm from '@bfc/adaptive-form';
import Extension from '@bfc/extension';
import formatMessage from 'format-message';

import { useShell } from '../../useShell';
import plugins from '../../plugins';

import { formEditor } from './styles';

const PropertyEditor: React.FC = () => {
  const { api: shellApi, data: shellData } = useShell('PropertyEditor');

  return (
    <div css={formEditor} aria-label={formatMessage('form editor')} data-testid="PropertyEditor">
      <Extension shell={shellApi} shellData={shellData} plugins={plugins}>
        <AdaptiveForm formData={shellData.data} schema={shellData.schemas?.sdk?.content} />
      </Extension>
    </div>
  );
};

export { PropertyEditor };
