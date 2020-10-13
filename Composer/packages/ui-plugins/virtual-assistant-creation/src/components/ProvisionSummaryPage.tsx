// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import formatMessage from 'format-message';
import React, { Fragment } from 'react';
import { RouteComponentProps } from '@reach/router';
import { DialogWrapper, DialogTypes } from '@bfc/ui-shared';
import { Pivot, PivotItem } from 'office-ui-fabric-react/lib/Pivot';
import { DetailsList, DetailsListLayoutMode, IColumn, SelectionMode } from 'office-ui-fabric-react/lib/DetailsList';
import { TextField } from 'office-ui-fabric-react/lib/TextField';

import { RouterPaths } from '../constants';

import { DialogFooterWrapper } from './DialogFooterWrapper';

// Content Data
const getProvisioningDetailItems = () => {
  return [
    {
      key: '0',
      Resource: formatMessage('Azure Bot Service'),
      Notes: formatMessage(
        'The Azure Bot Service resource stores configuration information that allows your Virtual Assistant to be accessed on the supported Channels and provide OAuth authentication.'
      ),
    },
    {
      key: '1',
      Resource: formatMessage('Azure Blob Storage'),
      Notes: formatMessage('Used to store conversation transcripts.'),
    },
    {
      key: '2',
      Resource: formatMessage('Azure Cosmos DB'),
      Notes: formatMessage('Used to store conversation state.'),
    },
    {
      key: '3',
      Resource: formatMessage('Azure App Service Plan'),
      Notes: formatMessage('Used to host your Bot Web App and QnA Maker Web App.'),
    },
    {
      key: '4',
      Resource: formatMessage('Azure Application Insights'),
      Notes: formatMessage('Used to capture conversation and application telemetry.'),
    },
    {
      key: '5',
      Resource: formatMessage('Bot Web App'),
      Notes: formatMessage('Hosts your Bot application.'),
    },
    {
      key: '6',
      Resource: formatMessage('Language Understanding'),
      Notes: formatMessage('Subscription keys for Language Understanding Cognitive Service.'),
    },
    {
      key: '7',
      Resource: formatMessage('QnA Maker'),
      Notes: formatMessage(
        'Subscription keys for QnA Maker Cognitive Service which facilitates the bot personality you selected.'
      ),
    },
    {
      key: '8',
      Resource: formatMessage('QnA Maker Web App'),
      Notes: formatMessage('Hosts your QnA Maker knowledgebases'),
    },
    {
      key: '9',
      Resource: formatMessage('QnA Maker Azure Search Service'),
      Notes: formatMessage('Search index for your QnA Maker knowledgebases.'),
    },
  ];
};

const getColumns = (): IColumn[] => {
  return [
    {
      key: 'column1',
      name: formatMessage('Resource'),
      fieldName: 'Resource',
      minWidth: 50,
      maxWidth: 200,
      isResizable: false,
      isMultiline: false,
    },
    {
      key: 'column2',
      name: formatMessage('Notes'),
      fieldName: 'Notes',
      minWidth: 300,
      maxWidth: 500,
      isResizable: false,
      isMultiline: true,
    },
  ];
};

// -------------------- ProvisionSummaryPage -------------------- //
type ProvisionSummaryPageProps = {
  onDismiss: () => void;
  onSubmit: () => Promise<void>;
} & RouteComponentProps<{}>;

export const ProvisionSummaryPage: React.FC<ProvisionSummaryPageProps> = (props) => {
  const { onDismiss, onSubmit } = props;

  return (
    <Fragment>
      <DialogWrapper
        isOpen
        dialogType={DialogTypes.CreateFlow}
        subText={formatMessage('The following will be provisioned to enable your bot')}
        title={formatMessage('Provisioning Summary')}
        onDismiss={props.onDismiss}
      >
        <Pivot>
          <PivotItem headerText={formatMessage('Summary')}>
            <DetailsList
              columns={getColumns()}
              items={getProvisioningDetailItems()}
              layoutMode={DetailsListLayoutMode.justified}
              selectionMode={SelectionMode.none}
            />
          </PivotItem>
          <PivotItem headerText={formatMessage('ARM Template')}>
            <TextField disabled multiline rows={40} />
          </PivotItem>
        </Pivot>
        <DialogFooterWrapper prevPath={RouterPaths.configSummaryPage} onDismiss={onDismiss} onSubmit={onSubmit} />
      </DialogWrapper>
    </Fragment>
  );
};

export default ProvisionSummaryPage;
