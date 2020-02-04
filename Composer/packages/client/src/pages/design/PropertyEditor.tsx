// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import Extension from '@botframework-ui/extension';
import AdaptiveForm from '@botframework-ui/adaptive-form';

import { BASEPATH } from '../../constants';
import { useShellApi } from '../../NewShellApi';

import plugins from './loadPlugins';
import { formEditor } from './styles';

const rootPath = BASEPATH.replace(/\/+$/g, '');

const PropertyEditor: React.FC = () => {
  const shellApi = useShellApi();
  // @ts-ignore
  const { schemas, data } = shellApi.getState();

  if (!data) {
    return null;
  }

  return (
    <div css={formEditor}>
      <Extension shell={shellApi}>
        <AdaptiveForm plugins={plugins} schema={schemas?.sdk?.content || {}} data={data} />
      </Extension>
    </div>
  );
};

export { PropertyEditor };
