// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import formatMessage from 'format-message';
import querystring from 'query-string';

import { ClientStorage } from '../../utils/storage';
import { surveyEligibilityState, dispatcherState, machineInfoState } from '../../recoilModel/atoms/appState';
import { MachineInfo } from '../../recoilModel/types';
import { SURVEY_EPOCH_KEY, SURVEY_URL_BASE } from '../../constants';
import TelemetryClient from '../../telemetry/TelemetryClient';

const buildUrl = (info: MachineInfo) => {
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

export const useSurveyNotification = () => {
  const { addNotification, deleteNotification, setSurveyEligibility } = useRecoilValue(dispatcherState);
  const surveyEligible = useRecoilValue(surveyEligibilityState);
  const machineInfo = useRecoilValue(machineInfoState);

  setSurveyEligibility();

  useEffect(() => {
    const url = buildUrl(machineInfo);
    deleteNotification('survey');

    if (surveyEligible) {
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
              surveyStorage.set(SURVEY_EPOCH_KEY, Date.now());
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
