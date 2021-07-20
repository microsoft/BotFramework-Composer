// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';

import { renderWithRecoil } from '../../../../__tests__/testUtils';
import { NotificationContainer } from '../NotificationContainer';
import { useSurveyNotification } from '../useSurveyNotification';
import { machineInfoState } from '../../../recoilModel';
import { ClientStorage } from '../../../utils/storage';
import { LAST_SURVEY_KEY } from '../../../constants';

let savedVersion: string | undefined = '';
const MOCK_VERSION = '2.3.4_jest';

let surveyStorage: ClientStorage;

beforeAll(() => {
  process.env.NODE_ENV = 'jest';
  savedVersion = process.env.COMPOSER_VERSION;
  process.env.COMPOSER_VERSION = MOCK_VERSION;

  surveyStorage = new ClientStorage(window.localStorage, 'survey');
});

afterAll(() => {
  process.env.NODE_ENV = 'test';
  process.env.COMPOSER_VERSION = savedVersion;
});

describe('useSurveyNotification', () => {
  const id = 'machineID12345';
  const os = 'TestOS';

  const mockOpen = jest.fn();

  const initRecoilState = ({ set }) => {
    set(machineInfoState, { os, id });
  };

  window.open = mockOpen;

  const TestHarness = () => {
    useSurveyNotification();
    return <NotificationContainer />;
  };

  describe('building the URL', () => {
    beforeEach(() => {
      surveyStorage.set('optedOut', false);
      surveyStorage.set('days', 12345);
      surveyStorage.set(LAST_SURVEY_KEY, null);
    });

    it('builds a URL given parameters', async () => {
      const page = renderWithRecoil(<TestHarness />, initRecoilState);

      const surveyButton = await page.findByText('Take survey');
      surveyButton.click();

      // We know these should all occur, but we don't care about the order
      const patterns = [
        'https://aka.ms/bfcomposersurvey',
        'Source=Composer',
        `machineId=${id}`,
        `os=${os}`,
        `version=${MOCK_VERSION}`,
      ];

      for (const pattern of patterns) {
        expect(mockOpen).toHaveBeenCalledWith(expect.stringContaining(pattern), '_blank');
      }
    });

    it('builds a URL given no OS', async () => {
      const newRecoilState = ({ set }) => {
        set(machineInfoState, { os: null, id });
      };

      const page = renderWithRecoil(<TestHarness />, newRecoilState);

      const surveyButton = await page.findByText('Take survey');
      surveyButton.click();

      const patterns = [
        'https://aka.ms/bfcomposersurvey',
        'Source=Composer',
        `machineId=${id}`,
        `os=Unknown`,
        `version=${MOCK_VERSION}`,
      ];

      for (const pattern of patterns) {
        expect(mockOpen).toHaveBeenCalledWith(expect.stringContaining(pattern), '_blank');
      }
    });
  });

  describe('determining eligibility', () => {
    beforeEach(() => {
      surveyStorage.set('optedOut', false);
      surveyStorage.set('days', 12345);
      surveyStorage.set(LAST_SURVEY_KEY, null);
    });

    it('shows the box under normal conditions', async () => {
      const page = renderWithRecoil(<TestHarness />, initRecoilState);

      const surveyButton = await page.findByText('Take survey');
      expect(surveyButton).not.toBeNull();
    });

    it("doesn't show the box when the user has opted out", () => {
      surveyStorage.set('optedOut', true);

      const page = renderWithRecoil(<TestHarness />, initRecoilState);

      const surveyButton = page.queryByText('Take survey');
      expect(surveyButton).toBeNull();
    });

    it("doesn't show the box when the user hasn't spent enough days with Composer", () => {
      // logically impossible, but makes a good test case
      surveyStorage.set('days', -1);

      const page = renderWithRecoil(<TestHarness />, initRecoilState);

      const surveyButton = page.queryByText('Take survey');
      expect(surveyButton).toBeNull();
    });

    it("returns false when it hasn't been long enough since the last survey", () => {
      // also logically impossible, but makes a good test case
      surveyStorage.set(LAST_SURVEY_KEY, Date.now() + 10000);

      const page = renderWithRecoil(<TestHarness />, initRecoilState);

      const surveyButton = page.queryByText('Take survey');
      expect(surveyButton).toBeNull();
    });
  });
});
