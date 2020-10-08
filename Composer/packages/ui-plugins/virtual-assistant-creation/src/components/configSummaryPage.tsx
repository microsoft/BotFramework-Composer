// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable format-message/literal-pattern */

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import formatMessage from 'format-message';
import React, { Fragment, useContext } from 'react';
import { RouteComponentProps } from '@reach/router';
import { DialogWrapper, DialogTypes } from '@bfc/ui-shared';
import { Text } from 'office-ui-fabric-react/lib/Text';
import { Separator, ISeparatorStyles } from 'office-ui-fabric-react/lib/Separator';

import { RouterPaths } from '../constants';

import { AppContext } from './VirtualAssistantCreationModal';
import { DialogFooterWrapper } from './DialogFooterWrapper';

// -------------------- Styles -------------------- //

const categoryTextStyling = css`
  display: block;
  margin-top: 10px;
`;

const entryText = (bold: boolean) => css`
  display: inline;
  font-weight: ${bold ? 'bold' : 'initial'};
`;

const separatorStyles: Partial<ISeparatorStyles> = {
  root: { color: 'black' },
};

// -------------------- ConfigSummaryPage -------------------- //
type ConfigSummaryPageProps = {
  onDismiss: () => void;
} & RouteComponentProps<{}>;

export const ConfigSummaryPage: React.FC<ConfigSummaryPageProps> = (props) => {
  const { state } = useContext(AppContext);
  const onDismiss = props.onDismiss;

  const categoryText = (text: string) => {
    return (
      <div css={categoryTextStyling}>
        <Text variant="xLarge">{text}</Text>
        <Separator styles={separatorStyles} />
      </div>
    );
  };

  const configEntry = (name: string, value: string) => {
    return (
      <div>
        <Text css={entryText(true)}>{name} : </Text>
        <Text css={entryText(false)}>{value}</Text>
      </div>
    );
  };

  return (
    <Fragment>
      <DialogWrapper
        isOpen
        dialogType={DialogTypes.CreateFlow}
        subText={formatMessage('The following customizations will be applied to your bot')}
        title={formatMessage('Configuration Summary')}
        onDismiss={props.onDismiss}
      >
        {categoryText(formatMessage('General'))}
        {configEntry(formatMessage('Selected Assistant Type'), state.selectedAssistant.name)}
        {configEntry(formatMessage('Bot Name'), state.selectedBotName)}
        {configEntry(formatMessage('Personality Choice'), state.selectedPersonality)}
        {configEntry(formatMessage('Bot Configured for Text'), state.isTextEnabled.toString())}
        {configEntry(formatMessage('Bot Configured for Speech'), state.isSpeechEnabled.toString())}
        {configEntry(formatMessage('Selected Assistant Type'), state.selectedAssistant.name)}
        {categoryText(formatMessage('Content'))}
        {configEntry(formatMessage('Greeting Message'), state.selectedGreetingMessage)}
        {configEntry(formatMessage('Fallback Text'), state.selectedFallbackText)}
        <DialogFooterWrapper
          nextPath={RouterPaths.provisionSummaryPage}
          prevPath={RouterPaths.customizeBotPage}
          onDismiss={onDismiss}
        />
      </DialogWrapper>
    </Fragment>
  );
};
