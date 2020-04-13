// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { VisualWidget } from '@bfc/extension';
import { SDKKinds, getInputType } from '@bfc/shared';
import { VisualEditorColors as Colors, ListOverview, BorderedDiv, FixedInfo } from '@bfc/ui-shared';

const BaseInputSchema: VisualWidget = {
  widget: 'PromptWidget',
  nowrap: true,
  botAsks: {
    widget: 'ActionCard',
    header: {
      widget: 'ActionHeader',
      title: data => `Bot Asks (${getInputType(data.$kind)})`,
      icon: 'MessageBot',
      colors: {
        theme: Colors.BlueMagenta20,
        icon: Colors.BlueMagenta30,
      },
    },
    body: {
      widget: 'LgWidget',
      field: 'prompt',
      defaultContent: '<prompt>',
    },
  },
  userInput: {
    widget: 'ActionCard',
    header: {
      widget: 'ActionHeader',
      title: data => `User Input (${getInputType(data.$kind)})`,
      disableSDKTitle: true,
      icon: 'User',
      menu: 'none',
      colors: {
        theme: Colors.LightBlue,
        icon: Colors.AzureBlue,
      },
    },
    body: data =>
      data.$kind === SDKKinds.ChoiceInput && Array.isArray(data.choices) && data.choices.length ? (
        <ListOverview
          items={data.choices}
          renderItem={item => {
            const value = typeof item === 'object' ? item.value : item;
            return (
              <BorderedDiv height={20} title={value}>
                {value}
              </BorderedDiv>
            );
          }}
        />
      ) : (
        <>{data.choices}</>
      ),
    footer: data =>
      data.property ? (
        <>
          {data.property} <FixedInfo>= Input({getInputType(data.$kind)})</FixedInfo>
        </>
      ) : null,
  },
};

export default {
  [SDKKinds.AttachmentInput]: BaseInputSchema,
  [SDKKinds.ConfirmInput]: BaseInputSchema,
  [SDKKinds.DateTimeInput]: BaseInputSchema,
  [SDKKinds.NumberInput]: BaseInputSchema,
  [SDKKinds.TextInput]: BaseInputSchema,
  [SDKKinds.ChoiceInput]: BaseInputSchema,
};
