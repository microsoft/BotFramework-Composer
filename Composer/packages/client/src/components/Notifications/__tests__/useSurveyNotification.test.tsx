// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

//import { buildUrl, getSurveyEligibility, useSurveyNotification } from '../useSurveyNotification';
import { buildUrl, getSurveyEligibility } from '../useSurveyNotification';
import { ClientStorage } from '../../../utils/storage';

const MOCK_URL_BASE = 'urlBase';

const mockAddNotification = jest.fn();
const mockMachineInfoState = jest.fn();

const surveyParameters = {
  // these values will cause the notification to always appear
  daysUntilEligible: 0,
  timeUntilNextSurvey: 0,
  chanceToAppear: 1,
};

jest.mock('../../../constants', () => ({
  get SURVEY_URL_BASE() {
    return MOCK_URL_BASE;
  },
  get SURVEY_PARAMETERS() {
    return surveyParameters;
  },
}));
jest.mock('../../../recoilModel/atoms/appState', () => ({
  get dispatcherState() {
    return {
      addNotification: mockAddNotification,
      machineInfoState: mockMachineInfoState,
    };
  },
}));

let savedVersion: string | undefined = '';
const MOCK_VERSION = '2.3.4_jest';

beforeAll(() => {
  process.env.NODE_ENV = 'jest';
  savedVersion = process.env.COMPOSER_VERSION;
  process.env.COMPOSER_VERSION = MOCK_VERSION;
});

afterAll(() => {
  process.env.NODE_ENV = 'test';
  process.env.COMPOSER_VERSION = savedVersion;
});

describe('buildUrl', () => {
  it('builds a URL given parameters', () => {
    const id = 'machineID12345';
    const os = 'TestOS';

    const url = buildUrl({ id, os });

    expect(url).toMatch(new RegExp(`^${MOCK_URL_BASE}`));
    expect(url).toContain('Source=Composer');
    expect(url).toContain(`machineId=${id}`);
    expect(url).toContain(`version=${MOCK_VERSION}`);
    expect(url).toContain(`os=${os}`);
  });

  it('builds a URL given no OS', () => {
    const id = 'machineID12345';

    const url = buildUrl({ id, os: '' });

    expect(url).toMatch(new RegExp(`^${MOCK_URL_BASE}`));
    expect(url).toContain('Source=Composer');
    expect(url).toContain(`machineId=${id}`);
    expect(url).toContain(`version=${MOCK_VERSION}`);
    expect(url).toContain(`os=Unknown`);
  });
});

describe('getSurveyEligibility', () => {
  const surveyStorage = new ClientStorage(window.localStorage, 'survey');

  it('returns false when the user has opted out', () => {
    surveyStorage.set('optedOut', true);

    expect(getSurveyEligibility()).toEqual(false);
  });
  it("returns false when there haven't been enough eligible days", () => {
    surveyStorage.set('days', 0);
    surveyParameters.daysUntilEligible = 2000;

    expect(getSurveyEligibility()).toEqual(false);
  });

  it("returns false when it hasn't been long enough since the last survey", () => {
    surveyStorage.set('dateLastUsed', Date.now() - 10000); // i.e. ten seconds ago
    surveyParameters.timeUntilNextSurvey = 60000; // pretend 60 seconds is the bound

    expect(getSurveyEligibility()).toEqual(false);
  });
  it("returns false when the random chance doesn't hit", () => {
    surveyParameters.chanceToAppear = 0;

    expect(getSurveyEligibility()).toEqual(false);
  });
  it('returns true when everything lines up right', () => {
    surveyStorage.set('optedOut', false);
    surveyStorage.set('days', 3);
    surveyStorage.set('dateLastUsed', Date.now() - 10000);

    surveyParameters.daysUntilEligible = 1;
    surveyParameters.timeUntilNextSurvey = 100; // somewhat less than 10s
    surveyParameters.chanceToAppear = 1; // 100% chance of appearing

    expect(getSurveyEligibility()).toEqual(true);
  });
});
