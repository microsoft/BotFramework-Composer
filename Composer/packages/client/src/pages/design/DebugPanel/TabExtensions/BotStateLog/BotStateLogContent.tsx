// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';

import { DebugPanelTabHeaderProps } from '../types';

export const BotStateLogContent: React.FC<DebugPanelTabHeaderProps> = ({ isActive }) => {
  // if (!isActive) {
  //   return null;
  // }

  return <h1>Bot state</h1>;
};
