import React from 'react';
import formatMessage from 'format-message';

export interface IStep {
  hidden?: boolean;
  id: string;
  location?: string;
  navigateTo: string;
  selector?: string;
  targetId?: string;
}

export interface IStepSet {
  steps: IStep[];
  title: string;
}

export const stepSets = (): IStepSet[] => [
  {
    steps: [{ id: 'setUpYourBot', navigateTo: '/home', targetId: 'project' }],
    title: formatMessage('Set up your bot'),
  },
  {
    steps: [
      { id: 'mainDialog', navigateTo: '/dialogs/Main?selected=triggers[0]', targetId: 'mainDialog' },
      { id: 'trigger', navigateTo: '/dialogs/Main?selected=triggers[0]', targetId: 'newTrigger' },
      {
        id: 'userInput',
        navigateTo: '/dialogs/Main?selected=triggers[0]',
        targetId: 'navUserSays',
      },
      {
        id: 'actions',
        location: 'visualEditor',
        navigateTo: '/dialogs/Main?selected=triggers[0]',
        targetId: 'action',
      },
      { id: 'botResponses', navigateTo: '/dialogs/Main?selected=triggers[0]', targetId: 'navBotSays' },
    ],
    title: formatMessage('Learn the basics'),
  },
  {
    steps: [{ id: 'welcomeMessage', navigateTo: '/dialogs/Main?selected=triggers[0]', targetId: 'newTrigger' }],
    title: formatMessage('Add welcome message'),
  },
  {
    steps: [{ id: 'intentTrigger', navigateTo: '/dialogs/Main?selected=triggers[0]', targetId: 'newTrigger' }],
    title: formatMessage('Add an intent trigger'),
  },
  {
    steps: [{ id: 'startBot', navigateTo: '/dialogs/Main?selected=triggers[0]', targetId: 'startBot' }],
    title: formatMessage('Test your bot'),
  },
];

export interface IComposerTeachingBubble {
  children?: any;
  footerContent?: any;
  headline?: any;
  primaryButtonProps?: any;
  secondaryButtonProps?: any;
}

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
              'Trigger connects intent with bot responses. Think of trigger as one capability of your bot. So your bot collection of triggers.'
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
            {formatMessage('Action defines ')}
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
              'You can manage all bot responses here. Make good use of the templates to create sophisticated needs.'
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
              {formatMessage(
                'Welcome message is triggered by the event called ConversationUpdate. You may customize or add a new one. To do this:'
              )}
            </div>
            <ol>
              <li>{formatMessage('Create a new or go to the trigger: ConversationUpdate')}</li>
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
              'Click on + and select intent as the trigger type. Follow the wizard to define the intent and other trigger settings. Then add actions in the visual editor.'
            )}
          </div>
        ),
        headline: formatMessage('Add an intent trigger'),
      };

    case 'startBot':
      return {
        children: (
          <div>
            {formatMessage('Click on the ')}
            <b>{formatMessage('Start Bot ')}</b>
            {formatMessage('button. Then you can choose to ')}
            <b>{formatMessage('Bot Framework Emulator. ')}</b>
            {formatMessage('This will open your Emulator app.')}
          </div>
        ),
        headline: formatMessage('Add an intent trigger'),
      };
    default:
      return {};
  }
};
