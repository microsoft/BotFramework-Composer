// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import Extension from '@botframework-ui/extension';
import AdaptiveForm from '@botframework-ui/adaptive-form';

import { BASEPATH } from '../../constants';

import plugins from './loadPlugins';
import { formEditor } from './styles';

const rootPath = BASEPATH.replace(/\/+$/g, '');

const PropertyEditor: React.FC = () => {
  return (
    <div css={formEditor}>
      <Extension>
        <AdaptiveForm plugins={plugins} />
      </Extension>
    </div>
  );
};

export { PropertyEditor };
