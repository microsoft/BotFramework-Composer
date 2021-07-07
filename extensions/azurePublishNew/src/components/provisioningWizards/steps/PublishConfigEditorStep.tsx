// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import formatMessage from 'format-message';
import { useRecoilValue } from 'recoil';

import { useDispatcher } from '../../../hooks/useDispatcher';
import { importConfigurationState } from '../../../recoilModel/atoms/importConfigurationState';
import { JsonEditor } from '../../shared/jsonEditor/JsonEditor';

export const PublishConfigEditorStep = () => {
  const { setImportConfiguration } = useDispatcher();
  const { config, isValidConfiguration } = useRecoilValue(importConfigurationState);

  return (
    <JsonEditor
      errorMessage={isValidConfiguration ? '' : formatMessage('Invalid JSON')}
      height={450}
      value={config}
      onChange={setImportConfiguration}
    />
  );
};
