// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render } from '@botframework-composer/test-utils';

import { ModalityPivot } from '../ModalityPivot';

const noop = () => {};

jest.mock('../modalityEditors/TextModalityEditor', () => {
  return {
    TextModalityEditor: () => <div>Text Modality Editor</div>,
  };
});

jest.mock('../modalityEditors/SpeechModalityEditor', () => {
  return {
    SpeechModalityEditor: () => <div>Speech Modality Editor</div>,
  };
});

jest.mock('../modalityEditors/AttachmentModalityEditor', () => {
  return {
    AttachmentModalityEditor: () => <div>Attachments Modality Editor</div>,
  };
});

jest.mock('../modalityEditors/SuggestedActionsModalityEditor', () => {
  return {
    SuggestedActionsModalityEditor: () => <div>Suggested Actions Modality Editor</div>,
  };
});

jest.mock('office-ui-fabric-react/lib/Button', () => {
  const MockButtons = jest.requireActual('office-ui-fabric-react/lib/Button');

  return {
    ...MockButtons,
    IconButton: ({ menuProps: { onItemClick } }) => (
      <button onClick={(e) => onItemClick(e, { key: 'Text' })}>Add</button>
    ),
  };
});

const renderModalityPivot = ({
  lgOption,
  lgTemplates = [],
  structuredResponse = {},
  onRemoveTemplate = jest.fn(),
  onTemplateChange = jest.fn(),
}) => {
  return render(
    <ModalityPivot
      lgOption={lgOption}
      lgTemplates={lgTemplates}
      structuredResponse={structuredResponse}
      telemetryClient={{ track: noop, pageView: noop }}
      onRemoveTemplate={onRemoveTemplate}
      onTemplateChange={onTemplateChange}
    />
  );
};

describe('<ModalityPivot />', () => {
  it('should set the default modality to Text if the structuredResponse is empty', async () => {
    const { findByText } = renderModalityPivot({
      lgOption: {},
      structuredResponse: {},
    });
    await findByText('Text');
    await findByText('Text Modality Editor');
  });

  it('should initialize modalities from the structuredResponse', async () => {
    const { findByText, queryByText } = renderModalityPivot({
      lgOption: {},
      structuredResponse: {
        Speak: { kind: 'Speak', value: [], valueType: 'direct' },
        SuggestedActions: { kind: 'SuggestedActions', value: ['opt1', 'opt2', 'opt3'] },
        Attachments: { kind: 'Attachments', value: ['${Herocard()}'], valueType: 'direct' },
      },
    });

    // The ModalityPivot should include all of the modalities defined in structuredResponse
    await findByText('Speech');
    await findByText('Suggested Actions');
    await findByText('Attachments');

    // Text is not included in the structuredResponse so it should be falsy
    const text = queryByText('Text');
    expect(text).toBeNull();
  });

  it('should switch between modality editors', async () => {
    const { findByText, queryByText } = renderModalityPivot({
      lgOption: {},
      structuredResponse: {
        Speak: { kind: 'Speak', value: [], valueType: 'direct' },
        SuggestedActions: { kind: 'SuggestedActions', value: ['opt1', 'opt2', 'opt3'] },
        Attachments: { kind: 'Attachments', value: ['${Herocard()}'], valueType: 'direct' },
      },
    });

    // ModalityPivot should start on the Speech Modality
    await findByText('Speech Modality Editor');

    const attachmentsButton = await findByText('Attachments');
    attachmentsButton.click();

    // ModalityPivot should switch to the Attachments editor when the Attachments button is clicked
    await findByText('Attachments Modality Editor');

    const text = queryByText('Text');
    expect(text).toBeNull();
  });

  it('should add', async () => {
    const { findByText } = renderModalityPivot({
      lgOption: {},
      structuredResponse: {
        Speak: { kind: 'Speak', value: [], valueType: 'direct' },
        SuggestedActions: { kind: 'SuggestedActions', value: ['opt1', 'opt2', 'opt3'] },
        Attachments: { kind: 'Attachments', value: ['${Herocard()}'], valueType: 'direct' },
      },
    });

    // ModalityPivot should start on the Speech Modality
    await findByText('Speech Modality Editor');

    // IconButton is mocked to add to add the Text Modality onClick
    const addButton = await findByText('Add');
    addButton.click();

    // ModalityPivot should switch to the Text Modality after it's added
    await findByText('Text');
    await findByText('Text Modality Editor');
  });
});
