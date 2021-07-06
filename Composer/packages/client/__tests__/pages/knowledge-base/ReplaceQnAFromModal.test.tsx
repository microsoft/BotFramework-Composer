// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */
import React from 'react';
import { fireEvent } from '@botframework-composer/test-utils';

import ReplaceQnAFromModal from '../../../src/components/QnA/ReplaceQnAFromModal';
import { renderWithRecoil } from '../../testUtils';

const handleSubmit = jest.fn();
const onDismiss = jest.fn();

const qnaFile = {
  id: 'a.source.en-us',
  content: '',
  imports: [],
  options: [],
  diagnostics: [],
  qnaSections: [],
  empty: true,
  resource: { Errors: [], Content: '', Sections: [] },
  isContentUnparsed: true,
};

describe('Replace QnA from portal Modal', () => {
  it('should import QnA from url', () => {
    const { getByText, getByTestId } = renderWithRecoil(
      <ReplaceQnAFromModal
        containerId={qnaFile.id}
        dialogId={'a'}
        hidden={false}
        projectId={'projectId'}
        qnaFile={qnaFile}
        onDismiss={onDismiss}
        onSubmit={handleSubmit}
      />
    );
    const urlField = getByTestId('ImportNewUrlToOverwriteQnAFile');
    fireEvent.change(urlField, { target: { value: 'http://newUrl.pdf' } });
    const submitButton = getByText('Next');
    fireEvent.click(submitButton);
    expect(handleSubmit).toBeCalled();
  });

  it('should render QnA from portal Modal', () => {
    const { getByText } = renderWithRecoil(
      <ReplaceQnAFromModal
        containerId={qnaFile.id}
        dialogId={'a'}
        hidden={false}
        projectId={'projectId'}
        qnaFile={qnaFile}
        onDismiss={onDismiss}
        onSubmit={handleSubmit}
      />
    );
    const secondOption = getByText('Replace with an existing KB from QnA maker portal');
    fireEvent.click(secondOption);
    const next = getByText('Next');
    fireEvent.click(next);

    expect(getByText('Provide access tokens')).toBeInTheDocument();
    expect(
      getByText('Select the Azure directory and resource you want to choose a knowledge base from')
    ).toBeInTheDocument();
  });
});
