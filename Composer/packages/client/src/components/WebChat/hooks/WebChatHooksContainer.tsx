// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';

import { useActivityInspectionListener } from './useActivityInspectionListener';
import { useTranscriptFocusListener } from './useTranscriptFocusListener';

export const WebChatHooksContainer: React.FC<{}> = () => {
  useActivityInspectionListener();
  useTranscriptFocusListener();

  return null;
};
