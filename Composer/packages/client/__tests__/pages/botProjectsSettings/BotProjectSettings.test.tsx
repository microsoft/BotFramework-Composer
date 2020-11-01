// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */

import React from 'react';

import BotProjectSettings from '../../../src/pages/botProject/BotProjectSettings';
import { renderWithRecoil } from '../../testUtils';

const state = {
  projectId: 'test',
};

describe('Delete Bot Button', () => {
  it('should render Delete Bot Button', () => {
    const { getByText } = renderWithRecoil(<BotProjectSettings projectId={state.projectId} />);
    expect(getByText('Bot management and configurations')).toBeInTheDocument();
  });
});
