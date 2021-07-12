// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';

import { renderWithRecoil } from '../../../../__tests__/testUtils';
import { NotificationContainer } from '../NotificationContainer';
import { useSurveyNotification } from '../useSurveyNotification';
import { machineInfoState } from '../../../recoilModel';
import { ClientStorage } from '../../../utils/storage';
import * as realConstants from '../../../constants';

jest.doMock('../../../constants', () => ({
  ...realConstants,
  get SURVEY_URL_BASE() {
    return 'urlBase';
  },
}));

let savedVersion: string | undefined = '';
const MOCK_VERSION = '2.3.4_jest';
const { LAST_SURVEY_KEY } = realConstants;

let surveyStorage;

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

// describe('buildUrl', () => {
//   it('builds a URL given parameters', () => {
//     const id = 'machineID12345';
//     const os = 'TestOS';

//     const url = buildUrl({ id, os });

//     expect(url).toMatch(/^urlBase/);
//     expect(url).toContain('Source=Composer');
//     expect(url).toContain(`machineId=${id}`);
//     expect(url).toContain(`version=${MOCK_VERSION}`);
//     expect(url).toContain(`os=${os}`);
//   });

//   it('builds a URL given no OS', () => {
//     const id = 'machineID12345';

//     const url = buildUrl({ id, os: '' });

//     expect(url).toMatch(/^urlBase/);
//     expect(url).toContain('Source=Composer');
//     expect(url).toContain(`machineId=${id}`);
//     expect(url).toContain(`version=${MOCK_VERSION}`);
//     expect(url).toContain(`os=Unknown`);
//   });
// });

// describe('getSurveyEligibility', () => {
//   it('returns false when the user has opted out', () => {
//     surveyStorage.set('optedOut', true);

//     expect(getSurveyEligibility()).toEqual(false);
//   });
//   it("returns false when there haven't been enough eligible days", () => {
//     surveyStorage.set('days', 0);
//     surveyParameters.daysUntilEligible = 2000;

//     expect(getSurveyEligibility()).toEqual(false);
//   });

//   it("returns false when it hasn't been long enough since the last survey", () => {
//     surveyStorage.set('dateLastUsed', Date.now() - 10000); // i.e. ten seconds ago
//     surveyParameters.timeUntilNextSurvey = 60000; // pretend 60 seconds is the bound

//     expect(getSurveyEligibility()).toEqual(false);
//   });
//   it("returns false when the random chance doesn't hit", () => {
//     surveyParameters.chanceToAppear = 0;

//     expect(getSurveyEligibility()).toEqual(false);
//   });
//   it('returns true when everything lines up right', () => {
//     surveyStorage.set('optedOut', false);
//     surveyStorage.set('days', 3);
//     surveyStorage.set('dateLastUsed', Date.now() - 10000);

//     surveyParameters.daysUntilEligible = 1;
//     surveyParameters.timeUntilNextSurvey = 100; // somewhat less than 10s
//     surveyParameters.chanceToAppear = 1; // 100% chance of appearing

//     expect(getSurveyEligibility()).toEqual(true);
//   });
// });

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

  it('builds a URL given parameters', () => {
    surveyStorage.set('optedOut', false);
    surveyStorage.set('days', 12345);
    surveyStorage.set(LAST_SURVEY_KEY, null);

    //console.log(surveyStorage.getAll());
    //console.log(window.localStorage);

    const page = renderWithRecoil(<TestHarness />, initRecoilState);

    page.debug();

    expect(mockOpen).toHaveBeenCalledWith([expect.stringContaining('Source=Composer'), '_blank']);
  });
});
