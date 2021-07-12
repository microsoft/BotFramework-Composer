// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import formatMessage from 'format-message';
import querystring from 'query-string';

import { ClientStorage } from '../../utils/storage';
import { dispatcherState, machineInfoState } from '../../recoilModel/atoms/appState';
import { MachineInfo } from '../../recoilModel/types';
import { LAST_SURVEY_KEY, SURVEY_URL_BASE, SURVEY_PARAMETERS } from '../../constants';
import TelemetryClient from '../../telemetry/TelemetryClient';

export const buildUrl = (info: MachineInfo) => {
  // User OS
  // hashed machineId
  // composer version
  // maybe include subscription ID; wait for global sign-in feature
  // session ID  (global telemetry GUID)
  const version = process.env.COMPOSER_VERSION;

  const parameters = {
    Source: 'Composer',
    os: info?.os || 'Unknown',
    machineId: info?.id,
    version,
  };

  return `${SURVEY_URL_BASE}?${querystring.stringify(parameters)}`;
};

export const getSurveyEligibility = () => {
  const surveyStorage = new ClientStorage(window.localStorage, 'survey');

  const optedOut = surveyStorage.get('optedOut', false);
  if (optedOut) {
    return false;
  }

  let days = surveyStorage.get('days', 0);
  const lastUsed = surveyStorage.get('dateLastUsed', null);
  const lastTaken = surveyStorage.get(LAST_SURVEY_KEY, null);
  const today = new Date().toDateString();
  if (lastUsed !== today) {
    days += 1;
    surveyStorage.set('days', days);
  }
  surveyStorage.set('dateLastUsed', today);

  if (
    // To be eligible for the survey, the user needs to have used Composer
    // some minimum number of days.
    days >= SURVEY_PARAMETERS.daysUntilEligible &&
    // Also, either the user must have never taken the survey before or
    // the last time they took it must be long enough in the past.
    (lastTaken == null || Date.now() - lastTaken > SURVEY_PARAMETERS.timeUntilNextSurvey)
  ) {
    // If the above conditions are true, there's a fixed chance the card will appear.
    return Math.random() < SURVEY_PARAMETERS.chanceToAppear;
  } else {
    return false;
  }
};

export const useSurveyNotification = () => {
  const { addNotification, deleteNotification } = useRecoilValue(dispatcherState);
  const machineInfo = useRecoilValue(machineInfoState);

  useEffect(() => {
    const url = buildUrl(machineInfo);
    deleteNotification('survey');

    if (getSurveyEligibility()) {
      const surveyStorage = new ClientStorage(window.localStorage, 'survey');

      TelemetryClient.track('HATSSurveyOffered');

      addNotification({
        id: 'survey',
        type: 'question',
        title: formatMessage('Would you mind taking a quick survey?'),
        description: formatMessage('We read every response and will use your feedback to improve Composer.'),
        leftLinks: [
          {
            label: formatMessage('Take survey'),
            onClick: () => {
              // This is safe; we control the URL that gets built
              // eslint-disable-next-line security/detect-non-literal-fs-filename
              window.open(url, '_blank');
              surveyStorage.set(LAST_SURVEY_KEY, Date.now());
              TelemetryClient.track('HATSSurveyAccepted');
              deleteNotification('survey');
            },
          },

          {
            // this is functionally identical to clicking the close box
            label: formatMessage('Remind me later'),
            onClick: () => {
              TelemetryClient.track('HATSSurveyDismissed');
              deleteNotification('survey');
            },
          },
        ],
        rightLinks: [
          {
            label: formatMessage('No thanks'),
            onClick: () => {
              TelemetryClient.track('HATSSurveyRejected');
              surveyStorage.set('optedOut', true);
              deleteNotification('survey');
            },
          },
        ],
        onDismiss: () => TelemetryClient.track('HATSSurveyDismissed'),
      });
    }
  }, []);
};
