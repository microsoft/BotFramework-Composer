// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import formatMessage from 'format-message';
import { ITeachingBubbleProps } from 'office-ui-fabric-react/lib/TeachingBubble';
import { generateUniqueId } from '@bfc/shared';

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
    id: 'setUpBot',
    steps: [{ id: 'setUpYourBot', targetId: 'project' }],
    title: formatMessage('Set up your bot'),
  },
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
        targetId: 'addNew',
      },
      {
        id: 'userInput',
        navigateTo: `/bot/${projectId}/dialogs/${rootDialogId}?selected=triggers[0]`,
        targetId: 'navUserInput',
      },
      {
        id: 'actions',
        location: 'visualEditor',
        navigateTo: `/bot/${projectId}/dialogs/${rootDialogId}?selected=triggers[0]`,
        targetId: 'action',
      },
      {
        id: 'botResponses',
        navigateTo: `/bot/${projectId}/dialogs/${rootDialogId}?selected=triggers[0]`,
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
        navigateTo: `/bot/${projectId}/dialogs/${rootDialogId}?selected=triggers[0]`,
        targetId: 'addNew',
      },
    ],
    title: formatMessage('Add welcome message'),
  },
  {
    id: 'intent trigger',
    steps: [
      {
        id: 'intentTrigger',
        navigateTo: `/bot/${projectId}/dialogs/${rootDialogId}?selected=triggers[0]`,
        targetId: 'addNew',
      },
    ],
    title: formatMessage('Add an intent trigger'),
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
    title: formatMessage('Test your bot'),
  },
];

const Bold = ({ children }) => <b key={generateUniqueId()}>{children}</b>;
const Italics = ({ children }) => <i key={generateUniqueId()}>{children}</i>;

export const getTeachingBubble = (id: string | undefined): IComposerTeachingBubble => {
  switch (id) {
    case 'setUpYourBot':
      return {
        children: formatMessage(
          'We have created a sample bot to help you get started with Composer. Click here to open the bot.'
        ),
        headline: formatMessage('Get started!'),
      };

    case 'mainDialog':
      return {
        children: formatMessage('The main dialog is named after your bot. It is the root and entry point of a bot.'),
        headline: formatMessage('Main dialog'),
      };

    case 'trigger':
      return {
        children: formatMessage.rich(
          'Triggers connect intents with bot responses. Think of a trigger as one capability of your bot. So your bot is a collection of triggers. To add a new trigger, click the <b>Add</b> button in the toolbar, and then select the <b>Add a new trigger</b> option from the dropdown menu.',
          {
            b: Bold,
          }
        ),
        headline: formatMessage('Add a new trigger'),
      };

    case 'userInput':
      return {
        children: formatMessage.rich(
          'You can define and manage <b>intents</b> here. Each intent describes a particular user intention through utterances (i.e. user says). <b>Intents are often triggers of your bot.</b>',
          {
            b: Bold,
          }
        ),
        headline: formatMessage('User input'),
      };

    case 'actions':
      return {
        children: formatMessage.rich('Actions define <b>how the bot responds</b> to a certain trigger.', {
          b: Bold,
        }),
        headline: formatMessage('Actions'),
      };

    case 'botResponses':
      return {
        children: formatMessage(
          'You can manage all bot responses here. Make good use of the templates to create sophisticated response logic based on your own needs.'
        ),
        headline: formatMessage('Bot responses'),
      };

    case 'welcomeMessage':
      return {
        children: (
          <div>
            {formatMessage.rich(
              'The welcome message is triggered by the <i>ConversationUpdate</i> event. To add a new <i>ConversationUpdate</i> trigger:',
              {
                i: Italics,
              }
            )}
            <ol>
              <li>
                {formatMessage.rich(
                  'Click the <b>Add</b> button in the toolbar, and select <b>Add a new trigger</b> from the dropdown menu.',
                  {
                    b: Bold,
                  }
                )}
              </li>
              <li>
                {formatMessage.rich(
                  'In the <b>Create a trigger</b> wizard, set the trigger type to <i>Activities</i> in the dropdown. Then set the <b>Activity Type</b> to <i>Greeting (ConversationUpdate activity)</i>, and click the <b>Submit</b> button.',
                  { b: Bold, i: Italics }
                )}
              </li>
              <li>
                {formatMessage.rich(
                  "To customize the welcome message, select the <i>Send a response</i> action in the Visual Editor. Then in the Form Editor on the right, you can edit the bot's welcome message in the <b>Language Generation</b> field.",
                  { b: Bold, i: Italics }
                )}
              </li>
            </ol>
          </div>
        ),
        headline: formatMessage('Add a welcome message'),
      };

    case 'intentTrigger':
      return {
        children: formatMessage.rich(
          'Click on the <b>Add</b> button in the toolbar, and select <b>Add a new trigger</b>. In the <b>Create a trigger</b> wizard, set the <b>Trigger Type</b> to <i>Intent recognized</i> and configure the <b>Trigger Name</b> and <b>Trigger Phrases</b>. Then add actions in the Visual Editor.',
          { b: Bold, i: Italics }
        ),
        headline: formatMessage('Add an intent trigger'),
      };

    case 'startBot':
      return {
        children: formatMessage.rich(
          "This will open your Emulator application. If you don't yet have the Bot Framework Emulator installed, you can download it <a>here</a>.",
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
        headline: formatMessage('Test your bot'),
      };

    default:
      return {};
  }
};
