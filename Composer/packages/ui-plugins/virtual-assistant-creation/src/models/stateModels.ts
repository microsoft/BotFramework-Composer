// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import formatMessage from 'format-message';
import { Dispatch, SetStateAction } from 'react';

import { AvailablePersonalities } from '../types';

export type IAppState = {
  availableHostedSkills: IAvailableHostedSkill[];
  availableAssistantTemplates: IAssistant[];
  selectedAssistant: IAssistant;
  selectedBotName: string;
  isTextEnabled: boolean;
  isSpeechEnabled: boolean;
  selectedLanguages: string[];
  selectedPersonality: AvailablePersonalities;
  selectedWelcomeImage: string;
  selectedFallbackText: string;
  selectedGreetingMessage: string;
  selectedSkills: IAvailableHostedSkill[];
  selectedQnaFile: string;
};

export type AppContextValue = {
  state: IAppState;
  // type, you get when hovering over `setState` from `useState`
  setState: Dispatch<SetStateAction<IAppState>>;
};

export interface IAssistant {
  name: string;
  description: string;
  imgName: string;
}

export interface IAvailableHostedSkill {
  name: string;
  description: string;
  location?: string;
}

export const initialAppState: IAppState = {
  availableHostedSkills: [
    {
      name: formatMessage('POI'),
      description: formatMessage('Find points of interest and directions'),
    },
    {
      name: formatMessage('To Do'),
      description: formatMessage('Add task management capabilities to your assistant'),
    },
    {
      name: formatMessage('Calendar'),
      description: formatMessage('Add calendar capabilities to your Assistant'),
    },
    {
      name: formatMessage('Who'),
      description: formatMessage('Add person look up capabilities to your Assistant'),
    },
  ],
  availableAssistantTemplates: [
    {
      name: formatMessage('Basic Assistant'),
      description: formatMessage('Configured with simple conversational capability like greeting, chit-chat & more.'),
      imgName: 'customAssistant.jpg',
    },
    {
      name: formatMessage('Enterprise Assistant'),
      description: formatMessage('Configured with enterprise scenarios, calendar, who bot, professional chit-chat.'),
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
  selectedBotName: '',
  isTextEnabled: true,
  isSpeechEnabled: false,
  selectedLanguages: [],
  selectedPersonality: 'professional',
  selectedWelcomeImage: '',
  selectedFallbackText: formatMessage("I am sorry, I didn't understand that"),
  selectedGreetingMessage: formatMessage('Hi there! Here are some things that I can do!'),
  selectedSkills: [],
  selectedQnaFile: '',
};

export const AppContextDefaultValue: AppContextValue = {
  state: initialAppState,
  setState: (state) => {}, // noop default callback
};
