// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

//import { buildUrl, getSurveyEligibility, useSurveyNotification } from '../useSurveyNotification';
import { buildUrl } from '../useSurveyNotification';

const MOCK_URL_BASE = 'urlBase';

const mockAddNotification = jest.fn();
const mockMachineInfoState = jest.fn();

jest.mock('../../../constants', () => ({
  get SURVEY_URL_BASE() {
    return MOCK_URL_BASE;
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
