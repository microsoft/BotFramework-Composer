// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useContext } from 'react';
import { FieldProps } from '@bfc/extension';
import { SDKKinds } from '@bfc/shared';

import PluginContext from '../../PluginContext';

export const QnAActionsField: React.FC<FieldProps<string>> = function StringField(props) {
  const { recognizers } = useContext(PluginContext);
  const QnAEditor =
    recognizers.find(r => r.id === SDKKinds.QnaRecognizer)?.editor || `No Editor for ${SDKKinds.QnaRecognizer}`;
  return (
    <React.Fragment>
      <QnAEditor {...props} />
    </React.Fragment>
  );
};
