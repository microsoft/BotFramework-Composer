// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import {
  DetailsList,
  DetailsListLayoutMode,
  SelectionMode,
  CheckboxVisibility,
  IColumn,
} from 'office-ui-fabric-react/lib/DetailsList';
import React, { useContext, useRef, useEffect, useState, useCallback } from 'react';
import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
import { IconButton, Stack } from 'office-ui-fabric-react';
import formatMessage from 'format-message';

import { listRoot, tableView } from './styles';

export interface ISkillListProps {
  items: any[];
}

const columns: IColumn[] = [
  {
    key: 'name',
    name: formatMessage('Available Skills'),
    fieldName: 'name',
    minWidth: 100,
    maxWidth: 150,
    isResizable: true,
    data: 'string',
  },
  {
    key: 'msAppId',
    name: formatMessage('App Id'),
    fieldName: 'msAppId',
    minWidth: 200,
    isResizable: true,
    data: 'string',
  },
  {
    key: 'endpointUrl',
    name: formatMessage('Skill Endpoint'),
    fieldName: 'endpointUrl',
    minWidth: 300,
    isResizable: true,
    data: 'string',
  },
  {
    key: 'description',
    name: formatMessage('Description'),
    fieldName: 'description',
    minWidth: 300,
    isResizable: true,
    data: 'string',
  },
  {
    key: 'buttons',
    name: '',
    minWidth: 100,
    maxWidth: 100,
    fieldName: 'buttons',
    data: 'string',
    onRender: (item, index) => {
      return (
        <div>
          <Stack tokens={{ childrenGap: 8 }} horizontal>
            <IconButton
              iconProps={{
                iconName: 'Edit',
              }}
              title="Edit"
              ariaLabel="Edit"
            />
            <IconButton
              iconProps={{
                iconName: 'Delete',
              }}
              title="Delete"
              ariaLabel="Delete"
            />
          </Stack>
        </div>
      );
    },
  },
];

const SkillList: React.FC<ISkillListProps> = props => {
  const { items } = props;

  items.push({
    name: 'production',
    protocol: 'BotFrameworkV3',
    description: 'Production endpoint for the Email Skill',
    endpointUrl: 'https://yuesuemailskill0207-gjvga67.azurewebsites.net/api/messages',
    msAppId: '79432da8-0f7e-4a16-8c23-ddbba30ae85d',
  });

  return (
    <div css={listRoot} data-testid="skill-list">
      <div css={tableView}>
        <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
          <DetailsList
            items={items}
            columns={columns}
            selectionMode={SelectionMode.single}
            layoutMode={DetailsListLayoutMode.justified}
            isHeaderVisible={true}
            checkboxVisibility={CheckboxVisibility.hidden}
          />
        </ScrollablePane>
      </div>
      <div>connecte to new skill</div>
    </div>
  );
};

export default SkillList;
