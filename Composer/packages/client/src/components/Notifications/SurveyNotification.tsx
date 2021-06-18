// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import { ClientStorage } from '../../utils/storage';
import { surveyEligibilityState, dispatcherState, machineInfoState } from '../../recoilModel/atoms/appState';
import { MachineInfo } from '../../recoilModel/types';
import { SURVEY_URL_BASE } from '../../constants';
import TelemetryClient from '../../telemetry/TelemetryClient';

function buildUrl(info: MachineInfo) {
  // User OS
  // hashed machineId
  // composer version
  // maybe include subscription ID; wait for global sign-in feature
  // session ID  (global telemetry GUID)
  const version = process.env.COMPOSER_VERSION;

  const parameters = {
    Source: 'Composer',
    os: info.os || 'Unknown',
    machineId: info.id,
    version,
  };

  return (
    `${SURVEY_URL_BASE}?` +
    Object.keys(parameters)
      .map((key) => `${key}=${parameters[key]}`)
      .join('&')
  );
}

export function useSurveyNotification() {
  const { addNotification, deleteNotification } = useRecoilValue(dispatcherState);
  const surveyEligible = useRecoilValue(surveyEligibilityState);
  const machineInfo = useRecoilValue(machineInfoState);

  useEffect(() => {
    const url = buildUrl(machineInfo);
    deleteNotification('survey');

    if (surveyEligible) {
      const surveyStorage = new ClientStorage(window.localStorage, 'survey');
      TelemetryClient.track('HATSSurveyOffered');

      addNotification({
        id: 'survey',
        type: 'question',
        title: 'Would you mind taking a quick survey?',
        description: `We read every response and will use your feedback to improve Composer.`,
        links: [
          {
            label: 'Take survey',
            onClick: () => {
              // This is safe; we control what the URL that gets built is
              // eslint-disable-next-line security/detect-non-literal-fs-filename
              window.open(url, '_blank');
              TelemetryClient.track('HATSSurveyAccepted');
              deleteNotification('survey');
            },
          },

          {
            // this is functionally identical to clicking the close box
            label: 'Remind me later',
            onClick: () => {
              TelemetryClient.track('HATSSurveyDismissed');
              deleteNotification('survey');
            },
          },
          null,
          {
            label: 'No thanks',
            onClick: () => {
              TelemetryClient.track('HATSSurveyRejected');
              deleteNotification('survey');
              surveyStorage.set('optedOut', true);
            },
          },
        ],
      });
    }
  }, []);
}
