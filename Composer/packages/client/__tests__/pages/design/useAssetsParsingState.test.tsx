// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { renderHook } from '@botframework-composer/test-utils/lib/hooks';
import * as React from 'react';
import { useSetRecoilState } from 'recoil';
import { RecoilRoot } from 'recoil';
import { act } from '@botframework-composer/test-utils/lib/hooks';

import { useAssetsParsingState } from '../../../src/pages/design/useAssetsParsingState';
import {
  currentProjectIdState,
  designPageLocationState,
  lgFileState,
  localeState,
  luFileState,
  qnaFileState,
} from '../../../src/recoilModel';

const state = {
  luFiles: [
    {
      id: 'test.en-us',
      isContentUnparsed: false,
    },
  ],
  lgFiles: [
    {
      id: 'test.en-us',
      isContentUnparsed: false,
    },
  ],
  qnaFiles: [
    {
      id: 'test.en-us',
      isContentUnparsed: false,
    },
  ],
  focusPath: '',
  locale: 'en-us',
  projectId: 'test',
};

const useRecoilTestHook = (projectId: string) => {
  const setLuFile = useSetRecoilState(luFileState({ projectId, luFileId: 'test.en-us' }));
  const isParsing = useAssetsParsingState(state.projectId);

  return { setLuFile, isParsing };
};

describe('useAssetsParsingState', () => {
  let result;
  beforeEach(() => {
    const initRecoilState = ({ set }) => {
      set(designPageLocationState(state.projectId), { dialogId: 'test' });
      set(currentProjectIdState, state.projectId);
      set(localeState(state.projectId), 'en-us');
      set(luFileState({ projectId: state.projectId, luFileId: 'test.en-us' }), state.luFiles);
      set(lgFileState({ projectId: state.projectId, lgFileId: 'test.en-us' }), state.luFiles);
      set(qnaFileState({ projectId: state.projectId, qnaFileId: 'test.en-us' }), state.luFiles);
    };

    const wrapper = (props: { children?: React.ReactNode }) => {
      const { children } = props;
      return <RecoilRoot initializeState={initRecoilState}>{children}</RecoilRoot>;
    };

    const rendered = renderHook(() => useRecoilTestHook(state.projectId), {
      wrapper,
    });
    result = rendered.result;
  });

  it('should be true if the file content is unparsed', async () => {
    const { setLuFile } = result.current;
    expect(result.current.isParsing).toBeFalsy();
    act(() => {
      setLuFile({
        id: 'test.en-us',
        isContentUnparsed: true,
      });
    });
    expect(result.current.isParsing).toBeTruthy();
    act(() => {
      setLuFile({
        id: 'test.en-us',
        isContentUnparsed: false,
      });
    });
    expect(result.current.isParsing).toBeFalsy();
  });
});
