// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { UAParser } from 'ua-parser-js';

import { ClientStorage } from '../../utils/storage';
import { surveyEligibilityState, dispatcherState } from '../../recoilModel/atoms/appState';
import { SURVEY_URL_BASE } from '../../constants';

type Props = {
  machineId: string;
};

function buildUrl({ machineId }: Props) {
  const userAgent = new UAParser().getResult();
  const version = process.env.COMPOSER_VERSION;

  return (
    `${SURVEY_URL_BASE}?` +
    `o=${encodeURIComponent(`${userAgent.browser}-${userAgent.os.name}-${userAgent.os.version}`)}&` +
    `v=${encodeURIComponent(version ?? '')}&` +
    `m=${encodeURIComponent(machineId)}`
  );
}

export default function SurveyNotification(props: Props) {
  const { addNotification, deleteNotification } = useRecoilValue(dispatcherState);

  const surveyEligible = useRecoilValue(surveyEligibilityState);

  useEffect(() => {
    if (surveyEligible) {
      const surveyStorage = new ClientStorage(window.localStorage, 'survey');

      addNotification({
        id: 'survey',
        type: 'question',
        title: 'Title of Survey Card',
        description:
          "This is the text that will go onto the survey card. I'm making it longer so it has to stretch across multiple lines.",
        links: [
          {
            label: 'Take the survey',
            onClick: () => {
              // This is safe; we control what the URL that gets built is
              // eslint-disable-next-line security/detect-non-literal-fs-filename
              window.open(buildUrl(props), '_blank');
              deleteNotification('survey');
            }, // get the right URL later
          },
          {
            label: 'Opt out',
            onClick: () => {
              deleteNotification('survey');
              surveyStorage.set('optedOut', true);
            },
          },
        ],
      });
    }
  }, []);

  return null; // this renders nothing and only exists to create a notification
}
