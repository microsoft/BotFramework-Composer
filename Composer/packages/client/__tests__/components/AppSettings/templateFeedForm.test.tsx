// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { fireEvent, act } from '@botframework-composer/test-utils';

import { renderWithRecoil, renderWithRecoilAndCustomDispatchers } from '../../testUtils';
import { dispatcherState, templateFeedUrlState } from '../../../src/recoilModel';
import { TemplateFeedForm } from '../../../src/pages/setting/app-settings/TemplateFeedForm';
import { firstPartyTemplateFeed } from '../../../../lib/shared/lib';

describe('<TemplateFeedForm />', () => {
  const setTemplateFeedUrlMock = jest.fn();
  const fetchTemplatesMock = jest.fn();

  const initRecoilState = ({ set }) => {
    set(templateFeedUrlState, firstPartyTemplateFeed);
    set(dispatcherState, {
      setTemplateFeedUrl: setTemplateFeedUrlMock,
      fetchTemplates: fetchTemplatesMock,
    });
  };
  const invalidUrl = 'www.invalidUrl.com';

  const getComponentWithDefaultStartingPoint = async () => {
    const component = renderWithRecoilAndCustomDispatchers(<TemplateFeedForm />, initRecoilState);
    const textFieldNode = component.getByTestId('templateFeedField');
    await act(async () => {
      await fireEvent.change(textFieldNode, { target: { value: invalidUrl } });
      await fireEvent.blur(textFieldNode);
    });
    return component;
  };

  beforeEach(() => {
    setTemplateFeedUrlMock.mockReset();
  });

  it('should render the template feed form with string value from state', () => {
    const { getByTestId } = renderWithRecoil(<TemplateFeedForm />, ({ set }) => {
      set(templateFeedUrlState, firstPartyTemplateFeed);
    });

    expect(getByTestId('templateFeedField')).toHaveValue(firstPartyTemplateFeed);
  });

  it('should make the call to change template feed value when textfield onBlur event is called', async () => {
    await getComponentWithDefaultStartingPoint();
    expect(setTemplateFeedUrlMock).toBeCalledWith(invalidUrl);
  });

  it('should render error message if new feed url returns no templates', async () => {
    fetchTemplatesMock.mockReturnValue([]);
    const component = await getComponentWithDefaultStartingPoint();
    expect(component.findByText('feed did not return any templates')).toBeTruthy();
  });

  it('should set template feed url to an empty string when default feed link is clicked', async () => {
    fetchTemplatesMock.mockReturnValue([]);
    const component = await getComponentWithDefaultStartingPoint();
    const setDefaultFeedLink = await component.findByTestId('default-feed-link');
    await act(async () => {
      await fireEvent.click(setDefaultFeedLink);
    });
    expect(setTemplateFeedUrlMock).toBeCalledWith('');
  });
});
