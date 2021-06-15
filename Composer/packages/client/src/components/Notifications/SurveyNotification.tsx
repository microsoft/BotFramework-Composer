// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import { ClientStorage } from '../../utils/storage';
import { surveyEligibilityState, dispatcherState } from '../../recoilModel/atoms/appState';

type Props = {
  surveyUrl: string;
  platform: string;
  version: string;
  machineId: string;
};

function buildUrl({ surveyUrl, platform, version, machineId }: Props) {
  return (
    `${surveyUrl}?` +
    `o=${encodeURIComponent(platform)}&` +
    `v=${encodeURIComponent(version)}&` +
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
