// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import { ClientStorage } from '../../utils/storage';
import { platform } from '../../utils/os';
import { surveyEligibilityState, dispatcherState } from '../../recoilModel/atoms/appState';
import { SURVEY_URL_BASE } from '../../constants';
import TelemetryClient from '../../telemetry/TelemetryClient';

const { ipcRenderer } = window;

function buildUrl(machineId: string) {
  // User OS
  // hashed machineId
  // composer version
  // maybe include subscription ID; wait for global sign-in feature
  // session ID  (global telemetry GUID)
  const version = process.env.COMPOSER_VERSION;

  const parameters = {
    Source: 'Composer',
    userOS: platform(),
    machineId,
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

  let machineId;

  useEffect(() => {
    ipcRenderer?.on('machine-id', (event, name) => {
      console.log('IPC event', event, name);
      machineId = name;
    });
  }, []);

  console.log(buildUrl(machineId));

  useEffect(() => {
    if (surveyEligible) {
      const surveyStorage = new ClientStorage(window.localStorage, 'survey');
      TelemetryClient.track('SurveyOffered');

      addNotification({
        id: 'survey',
        type: 'question',
        title: "Let us know how we're doing",
        description: `We read each and every comment and will your use your feedback to improve. (debug: machineId=${machineId})`,
        links: [
          {
            label: 'Take Survey',
            onClick: () => {
              // This is safe; we control what the URL that gets built is
              // eslint-disable-next-line security/detect-non-literal-fs-filename
              window.open(buildUrl(machineId), '_blank');
              deleteNotification('survey');
            },
          },

          {
            // this is functionally identical to clicking the close box
            label: 'Remind Me Later',
            onClick: () => {
              deleteNotification('survey');
            },
          },
          {
            label: "Don't Show Again",
            onClick: () => {
              deleteNotification('survey');
              surveyStorage.set('optedOut', true);
            },
          },
        ],
      });
    }
  }, []);
}
