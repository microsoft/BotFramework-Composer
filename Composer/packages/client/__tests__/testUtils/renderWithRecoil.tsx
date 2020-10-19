// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render } from '@botframework-composer/test-utils';
import { RecoilRoot, MutableSnapshot } from 'recoil';
import noop from 'lodash/noop';

import { DispatcherWrapper } from '../../src/recoilModel';

export function renderWithRecoil(subject, initRecoilState: (mutableSnapshot: MutableSnapshot) => void = noop) {
  return render(
    <RecoilRoot initializeState={initRecoilState}>
      <DispatcherWrapper>{subject}</DispatcherWrapper>
    </RecoilRoot>
  );
}

export function wrapWithRecoil(subject, initRecoilState: (mutableSnapshot: MutableSnapshot) => void = noop) {
  return (
    <RecoilRoot initializeState={initRecoilState}>
      <DispatcherWrapper>{subject}</DispatcherWrapper>
    </RecoilRoot>
  );
}
