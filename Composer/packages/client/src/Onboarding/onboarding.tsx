// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import formatMessage from 'format-message';
import { ITeachingBubbleProps } from 'office-ui-fabric-react/lib/TeachingBubble';

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

export const stepSets = (projectId: string): IStepSet[] => [
  {
    id: 'setUpBot',
    steps: [{ id: 'setUpYourBot', targetId: 'project' }],
    title: formatMessage('Set up your bot'),
  },
  {
    id: 'basics',
    steps: [
      { id: 'mainDialog', navigateTo: `/bot/${projectId}/dialogs/Main?selected=triggers[0]`, targetId: 'mainDialog' },
      { id: 'trigger', navigateTo: `/bot/${projectId}/dialogs/Main?selected=triggers[0]`, targetId: 'newTrigger' },
      {
        id: 'userInput',
        navigateTo: `/bot/${projectId}/dialogs/Main?selected=triggers[0]`,
        targetId: 'navUserInput',
      },
      {
        id: 'actions',
        location: 'visualEditor',
        navigateTo: `/bot/${projectId}/dialogs/Main?selected=triggers[0]`,
        targetId: 'action',
      },
      {
        id: 'botResponses',
        navigateTo: `/bot/${projectId}/dialogs/Main?selected=triggers[0]`,
        targetId: 'navBotResponses',
      },
    ],
    title: formatMessage('Learn the basics'),
  },
  {
    id: 'welcomeMessage',
    steps: [
      {
        id: 'welcomeMessage',
        navigateTo: `/bot/${projectId}/dialogs/Main?selected=triggers[0]`,
        targetId: 'newTrigger',
      },
    ],
    title: formatMessage('Add welcome message'),
  },
  {
    id: 'intent trigger',
    steps: [
      {
        id: 'intentTrigger',
        navigateTo: `/bot/${projectId}/dialogs/Main?selected=triggers[0]`,
        targetId: 'newTrigger',
      },
    ],
    title: formatMessage('Add an intent trigger'),
  },
  {
    id: 'testBot',
    steps: [
      { id: 'startBot', navigateTo: `/bot/${projectId}/dialogs/Main?selected=triggers[0]`, targetId: 'startBot' },
    ],
    title: formatMessage('Test your bot'),
  },
];

export const getTeachingBubble = (id: string | undefined): IComposerTeachingBubble => {
  switch (id) {
    case 'setUpYourBot':
      return {
        children: (
          <div>
            {formatMessage(
              'We have created a sample bot to help you get started with Composer. Click here to open the bot.'
            )}
          </div>
        ),
        headline: formatMessage('Get started!'),
      };

    case 'mainDialog':
      return {
        children: (
          <div>{formatMessage('Main dialog is named after your bot. It is the root and entry point of a bot.')}</div>
        ),
        headline: formatMessage('Main dialog'),
      };

    case 'trigger':
      return {
        children: (
          <div>
            {formatMessage(
              'Triggers connect intents with bot responses. Think of a trigger as one capability of your bot. So your bot is a collection of triggers.'
            )}
          </div>
        ),
        headline: formatMessage('Trigger'),
      };

    case 'userInput':
      return {
        children: (
          <div>
            {formatMessage('You can define and manage ')}
            <b>{formatMessage('intents ')}</b>
            {formatMessage(
              'here. Each intent describes a particular user intention through utterances (i.e. user says). '
            )}
            <b>{formatMessage('Intents are often triggers of your bot.')}</b>
          </div>
        ),
        headline: formatMessage('User input'),
      };

    case 'actions':
      return {
        children: (
          <div>
            {formatMessage('Actions define ')}
            <b>{formatMessage('how the bot responds ')}</b>
            {formatMessage('to a certain trigger.')}
          </div>
        ),
        headline: formatMessage('Actions'),
      };

    case 'botResponses':
      return {
        children: (
          <div>
            {formatMessage(
              'You can manage all bot responses here. Make good use of the templates to create sophisticated response logic based on your own needs.'
            )}
          </div>
        ),
        headline: formatMessage('Bot responses'),
      };

    case 'welcomeMessage':
      return {
        children: (
          <div>
            <div>
              {formatMessage('The welcome message is triggered by the ')}
              <i>{formatMessage('ConversationUpdate ')}</i>
              {formatMessage('event. You may customize or add a new one. To do this:')}
            </div>
            <ol>
              <li>
                {formatMessage('Create a new or go to the trigger: ')}
                <i>{formatMessage('ConversationUpdate')}</i>
              </li>
              <li>{formatMessage('Select/add action: send an Activity')}</li>
              <li>{formatMessage('Edit the message in the right pane')}</li>
            </ol>
          </div>
        ),
        headline: formatMessage('Add welcome message'),
      };

    case 'intentTrigger':
      return {
        children: (
          <div>
            {formatMessage(
              'Click on the + and select intent as the trigger type. Follow the wizard to define the intent and other trigger settings. Then add actions in the visual editor.'
            )}
          </div>
        ),
        headline: formatMessage('Add an intent trigger'),
      };

    case 'startBot':
      return {
        children: (
          <div>
            {formatMessage(
              "This will open your Emulator application. If you don't yet have the Bot Framework Emulator installed, you can download it "
            )}
            <a href="https://github.com/microsoft/BotFramework-Emulator/releases/latest">{formatMessage('here.')}</a>
          </div>
        ),
        headline: formatMessage('Test your bot'),
      };

    default:
      return {};
  }
};
