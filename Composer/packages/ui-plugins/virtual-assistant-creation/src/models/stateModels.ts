// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import formatMessage from 'format-message';

import { AvailablePersonalities } from '../types';

export type IAppState = {
  SelectBotPageState: SelectBotPageState;
  CustomizeBotPageState: CustomizeBotPageState;
};

export type SelectBotPageState = {
  selectedAssistant: IAssistant;
  availableAssistantTemplates: IAssistant[];
};

export type CustomizeBotPageState = {
  selectedBotName: string;
  selectedPersonality: AvailablePersonalities;
  selectedFallbackText: string;
  selectedGreetingMessage: string;
  isTextEnabled: boolean;
  isSpeechEnabled: boolean;
};

export interface IAssistant {
  name: string;
  description: string;
  imgName: string;
}

export const getInitialAppState = (): IAppState => {
  return {
    SelectBotPageState: {
      availableAssistantTemplates: [
        {
          name: formatMessage('Basic Assistant'),
          description: formatMessage(
            'Configured with simple conversational capability like greeting, chit-chat & more.'
          ),
          imgName: 'customAssistant.jpg',
        },
        {
          name: formatMessage('Enterprise Assistant'),
          description: formatMessage(
            'Configured with enterprise scenarios, calendar, who bot, professional chit-chat.'
          ),
          imgName: 'EnterpriseAssistant.jpg',
        },
        {
          name: formatMessage('Hospitality Assistant'),
          description: formatMessage('Configured with hospitality scenarios, Bing search and caring chit-chat.'),
          imgName: 'hospitality.jpg',
        },
      ],
      selectedAssistant: {
        name: formatMessage('Basic Assistant'),
        description: formatMessage('Configured with simple conversational capability like greeting, chit-chat & more.'),
        imgName: 'customAssistant.jpg',
      },
    },
    CustomizeBotPageState: {
      selectedBotName: '',
      isTextEnabled: true,
      isSpeechEnabled: false,
      selectedPersonality: 'professional',
      selectedFallbackText: formatMessage("I am sorry, I didn't understand that"),
      selectedGreetingMessage: formatMessage('Hi there! Here are some things that I can do!'),
    },
  };
};
