// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render } from '@botframework-composer/test-utils';

import { PropertyEditorHeader } from '../PropertyEditorHeader';

describe('<PropertyEditorHeader />', () => {
  it('renders property editor header without help link if not a remote bot', () => {
    const metadata = {
      isRootBot: true,
      isRemote: false,
    };

    const { queryAllByText } = render(<PropertyEditorHeader botName={'echo-bot'} projectData={metadata} />);
    expect(queryAllByText('Learn more')).toEqual([]);
  });

  it('renders property editor header for a root bot', () => {
    const metadata = {
      isRootBot: true,
      isRemote: false,
    };
    const { findByText } = render(<PropertyEditorHeader botName={'echo-bot'} projectData={metadata} />);
    expect(findByText('Root bot'));
    expect(findByText('Root bot of your project that greets users, and can call skills.'));
  });

  it('renders property editor header for a local skill', () => {
    const metadata = {
      isRootBot: false,
      isRemote: false,
    };
    const { findByText } = render(<PropertyEditorHeader botName={'echo-bot'} projectData={metadata} />);
    expect(findByText('Local Skill'));
  });

  it('renders property editor header for a remote skill', () => {
    const metadata = {
      isRootBot: false,
      isRemote: true,
    };
    const helpLink = 'https://botframework-skill/manifest';
    const { findByText } = render(
      <PropertyEditorHeader botName={'echo-bot'} helpLink={helpLink} projectData={metadata} />
    );
    expect(findByText('Remote Skill'));
    expect(findByText('Learn more'));
  });
});
