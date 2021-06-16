// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import { ClientStorage } from '../../utils/storage';
import { surveyEligibilityState, dispatcherState } from '../../recoilModel/atoms/appState';
import { SURVEY_URL_BASE } from '../../constants';
import { description } from '../../pages/setting/app-settings/styles';

function buildUrl() {
  // User OS
  // hashed machineId
  // composer version,
  // maybe include subscription ID; wait for global sign-in feature
  // session ID  (global telemetry GUID)
  const version = process.env.COMPOSER_VERSION;
  const machineId = '123456';

  return (
    `${SURVEY_URL_BASE}?` +
    `o=${encodeURIComponent(window.navigator.userAgent)}&` +
    `v=${encodeURIComponent(version ?? '')}&` +
    `m=${encodeURIComponent(machineId)}`
  );
}

export function useSurveyNotification() {
  const { addNotification, deleteNotification } = useRecoilValue(dispatcherState);

  const surveyEligible = useRecoilValue(surveyEligibilityState);
  console.log(buildUrl());

  useEffect(() => {
    if (surveyEligible) {
      const surveyStorage = new ClientStorage(window.localStorage, 'survey');

      addNotification({
        id: 'survey',
        type: 'question',
        title: "Let us know how we're doing",
        description: 'We read each and every comment and will your use your feedback to improve.',
        links: [
          {
            label: "Yes, I'll take the survey!",
            onClick: () => {
              // This is safe; we control what the URL that gets built is
              // eslint-disable-next-line security/detect-non-literal-fs-filename
              window.open(buildUrl(), '_blank');
              deleteNotification('survey');
            },
          },
          {
            label: "No, I'd like to opt out.",
            onClick: () => {
              deleteNotification('survey');
              addNotification({
                id: 'optOutSuccess',
                type: 'info',
                title: 'Opt-out success!',
                description: 'Thanks. You will no longer receive requests for these surveys.',
              });
              surveyStorage.set('optedOut', true);
            },
          },
        ],
      });
    }
  }, []);
}
