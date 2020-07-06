// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render } from '@bfc/test-utils';
import { RecoilRoot, MutableSnapshot } from 'recoil';
import noop from 'lodash/noop';

import { DispatcherWrapper } from '../../src/recoilModel';

export function renderWithRecoilAndContext(
  subject,
  initRecoilState: (mutableSnapshot: MutableSnapshot) => void = noop
) {
  return render(
    <RecoilRoot initializeState={initRecoilState}>
      <DispatcherWrapper>{subject}</DispatcherWrapper>
    </RecoilRoot>
  );
}
