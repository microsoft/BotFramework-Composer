// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';

import { QNA_HELP } from './constants';
import { LuEditor, LULSPEditorProps } from './LuEditor';

export type QnALSPEditorProps = LULSPEditorProps;

const QnAEditor: React.FC<QnALSPEditorProps> = (props) => {
  return <LuEditor {...props} helpURL={QNA_HELP} />;
};

export { QnAEditor };
