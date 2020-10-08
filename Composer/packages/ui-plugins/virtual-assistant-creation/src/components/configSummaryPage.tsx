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

const renderCategoryTextStyling = css`
  display: block;
  margin-top: 10px;
`;

const entryTextStyle = (bold: boolean) => css`
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

  const renderCategoryText = (text: string) => {
    return (
      <div css={renderCategoryTextStyling}>
        <Text variant="xLarge">{text}</Text>
        <Separator styles={separatorStyles} />
      </div>
    );
  };

  const renderConfigEntry = (name: string, value: string) => {
    return (
      <div>
        <Text css={entryTextStyle(true)}>{name} : </Text>
        <Text css={entryTextStyle(false)}>{value}</Text>
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
        {renderCategoryText(formatMessage('General'))}
        {renderConfigEntry(formatMessage('Selected Assistant Type'), state.selectedAssistant.name)}
        {renderConfigEntry(formatMessage('Bot Name'), state.selectedBotName)}
        {renderConfigEntry(formatMessage('Personality Choice'), state.selectedPersonality)}
        {renderConfigEntry(formatMessage('Bot Configured for Text'), state.isTextEnabled.toString())}
        {renderConfigEntry(formatMessage('Bot Configured for Speech'), state.isSpeechEnabled.toString())}
        {renderConfigEntry(formatMessage('Selected Assistant Type'), state.selectedAssistant.name)}
        {renderCategoryText(formatMessage('Content'))}
        {renderConfigEntry(formatMessage('Greeting Message'), state.selectedGreetingMessage)}
        {renderConfigEntry(formatMessage('Fallback Text'), state.selectedFallbackText)}
        <DialogFooterWrapper
          nextPath={RouterPaths.provisionSummaryPage}
          prevPath={RouterPaths.customizeBotPage}
          onDismiss={onDismiss}
        />
      </DialogWrapper>
    </Fragment>
  );
};
