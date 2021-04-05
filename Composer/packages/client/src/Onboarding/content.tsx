// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import formatMessage from 'format-message';
import { ITeachingBubbleProps } from 'office-ui-fabric-react/lib/TeachingBubble';
import { DirectionalHint, ICalloutProps } from 'office-ui-fabric-react/lib/Callout';

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
        navigateTo: `/bot/${projectId}/dialogs/${rootDialogId}?selected=triggers[0]&focused=triggers[0].actions[0]`,
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

type TeachingBubble = {
  calloutProps?: ICalloutProps;
  content?: string | any[];
  headline?: string;
  helpLink?: string;
};

export const getTeachingBubble = (id: string | undefined): TeachingBubble => {
  switch (id) {
    case 'mainDialog':
      return {
        content: formatMessage(
          'The main dialog is the foundation of every bot created in Composer. There is only one main dialog and all other dialogs are children of it. It gets initialized every time your bot runs and is the entry point into the bot.'
        ),
        headline: formatMessage('Main dialog'),
        helpLink: 'https://docs.microsoft.com/en-us/composer/concept-dialog',
      };

    case 'trigger':
      return {
        content: formatMessage(
          'Triggers are the main component of a dialog, they are how you catch and respond to events. Each trigger has a condition and a collection of actions to execute when the condition is met.'
        ),
        headline: formatMessage('Add a new trigger'),
        helpLink: 'https://docs.microsoft.com/en-us/composer/concept-events-and-triggers',
      };

    case 'actions':
      return {
        content: formatMessage(
          'Actions are the main component of a trigger, they are what enable your bot to take action whether in response to user input or any other event that may occur.'
        ),
        headline: formatMessage('Actions'),
        helpLink: 'https://docs.microsoft.com/en-us/composer/concept-dialog#action',
      };

    case 'userInput':
      return {
        content: formatMessage(
          'The User Input page is where the Language Understanding editor locates. From here users can view all the Language Understanding templates and edit them.'
        ),
        headline: formatMessage('User input'),
        helpLink: 'https://docs.microsoft.com/en-us/composer/concept-language-understanding',
      };

    case 'botResponses':
      return {
        content: formatMessage(
          'The Bot Responses page is where the Language Generation (LG) editor locates. From here users can view all the LG templates and edit them.'
        ),
        headline: formatMessage('Bot responses'),
        helpLink: 'https://docs.microsoft.com/en-us/composer/concept-language-generation',
      };

    case 'startBot':
      return {
        content: formatMessage.rich(
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
          gapSpace: 8,
        },
      };

    case 'projectSettings':
      return {
        content: formatMessage('Publish your bot to Azure and manage published bots here.'),
        headline: formatMessage('Configure and publish'),
        helpLink: 'https://docs.microsoft.com/en-us/composer/how-to-publish-bot',
      };

    default:
      return {};
  }
};
