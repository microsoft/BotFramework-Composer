// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import formatMessage from 'format-message';
import { ITeachingBubbleProps } from 'office-ui-fabric-react/lib/TeachingBubble';
import { DirectionalHint } from 'office-ui-fabric-react/lib/Callout';

export interface IComposerTeachingBubble extends ITeachingBubbleProps {
  children?: any;
  primaryButtonProps?: any;
  secondaryButtonProps?: any;
}

export interface IStep {
  hidden?: boolean;
  id: string;
  location?: string;
  navigateTo?: string;
  selector?: string;
  targetId?: string;
}

export interface IStepSet {
  id: string;
  steps: IStep[];
  title?: string;
}

export const stepSets = (projectId: string, rootDialogId: string): IStepSet[] => [
  {
    id: 'basics',
    steps: [
      {
        id: 'mainDialog',
        navigateTo: `/bot/${projectId}/dialogs/${rootDialogId}?selected=triggers[0]`,
        targetId: 'mainDialog',
      },
      {
        id: 'trigger',
        navigateTo: `/bot/${projectId}/dialogs/${rootDialogId}?selected=triggers[0]`,
        targetId: 'mainDialog',
      },
      {
        id: 'actions',
        location: 'visualEditor',
        navigateTo: `/bot/${projectId}/dialogs/${rootDialogId}?selected=triggers[0]`,
        targetId: 'action',
      },
    ],
    title: formatMessage('Dialogs, triggers, and actions'),
  },
  {
    id: 'inputAndResponses',
    steps: [
      {
        id: 'userInput',
        navigateTo: `/bot/${projectId}/dialogs/${rootDialogId}?selected=triggers[0]`,
        targetId: 'navUserInput',
      },
      {
        id: 'botResponses',
        navigateTo: `/bot/${projectId}/dialogs/${rootDialogId}?selected=triggers[0]`,
        targetId: 'navBotResponses',
      },
    ],
    title: formatMessage('User input and bot responses'),
  },
  {
    id: 'testBot',
    steps: [
      {
        id: 'startBot',
        navigateTo: `/bot/${projectId}/dialogs/${rootDialogId}?selected=triggers[0]`,
        targetId: 'startBot',
      },
    ],
    title: formatMessage('Test with Web Chat and Emulator'),
  },
  {
    id: 'publish',
    steps: [
      {
        id: 'projectSettings',
        navigateTo: `/bot/${projectId}/dialogs/${rootDialogId}?selected=triggers[0]`,
        targetId: 'navProjectSettings',
      },
    ],
    title: formatMessage('Configure and publish'),
  },
];

export const getTeachingBubble = (id: string | undefined): IComposerTeachingBubble => {
  switch (id) {
    case 'mainDialog':
      return {
        children: formatMessage('The main dialog is named after your bot. It is the root and entry point of a bot.'),
        headline: formatMessage('Main dialog'),
      };

    case 'trigger':
      return {
        children: formatMessage(
          'Trigger connects user intent with bot responses. Think of a trigger as one capability of your bot. So a dialog contains a collection of triggers. To add a new trigger from the dialog menu.'
        ),
        headline: formatMessage('Add a new trigger'),
      };

    case 'userInput':
      return {
        children: formatMessage(
          'Manage intents here. Each intent describes a particular user intention through utterances (i.e. user says). '
        ),
        headline: formatMessage('User input'),
      };

    case 'actions':
      return {
        children: formatMessage(
          'Actions define how the bot responds to a certain trigger, for example, the bot logics and responses are defined here. Click the + button to add an action.'
        ),
        headline: formatMessage('Actions'),
      };

    case 'botResponses':
      return {
        children: formatMessage(
          'You can manage all bot responses here. Make good use of the templates to create sophisticated response logic based on your own needs.'
        ),
        headline: formatMessage('Bot responses'),
      };

    case 'startBot':
      return {
        children: formatMessage.rich(
          "Click the start button to test your bot using Web Chat or Emulator. If you don't yet have the Bot Framework Emulator installed, you can download it <a>here</a>.",
          {
            a: ({ children }) => (
              <a
                href="https://github.com/microsoft/BotFramework-Emulator/releases/latest"
                rel="noopener noreferrer"
                target="_blank"
              >
                {children}
              </a>
            ),
          }
        ),
        headline: formatMessage('Test with Web Chat or Emulator'),
        calloutProps: {
          directionalHint: DirectionalHint.bottomCenter,
        },
      };

    case 'projectSettings':
      return {
        children: formatMessage('Publish your bot to Azure and manage published bots here.'),
        headline: formatMessage('Configure and publish'),
      };

    default:
      return {};
  }
};
