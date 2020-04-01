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
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
import { Sticky, StickyPositionType } from 'office-ui-fabric-react/lib/Sticky';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { FontSizes } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';

import SkillForm from './SkillForm';
import { ContentStyle, TableView, ActionButton, TableCell } from './styles';
import { ISkill, ISkillByAppConfig, ISkillByManifestUrl, ISkillFormData } from './types';

export interface ISkillListProps {
  skills: ISkill[];
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
    onRender: (item: ISkill) => {
      return <div css={TableCell}>{item.name}</div>;
    },
  },
  {
    key: 'msAppId',
    name: formatMessage('App Id'),
    fieldName: 'msAppId',
    minWidth: 200,
    isResizable: true,
    data: 'string',
    onRender: (item: ISkill) => {
      return <div css={TableCell}>{item.msAppId}</div>;
    },
  },
  {
    key: 'endpointUrl',
    name: formatMessage('Skill Endpoint'),
    fieldName: 'endpointUrl',
    minWidth: 300,
    isResizable: true,
    data: 'string',
    onRender: (item: ISkill) => {
      return <div css={TableCell}>{item.endpointUrl}</div>;
    },
  },
  {
    key: 'description',
    name: formatMessage('Description'),
    fieldName: 'description',
    minWidth: 300,
    isResizable: true,
    data: 'string',
    onRender: (item: ISkill) => {
      return <div css={TableCell}>{item.description}</div>;
    },
  },
];

// const builtInSkills = new Array(2).fill({
//   name: 'production',
//   protocol: 'BotFrameworkV3',
//   description: 'Production endpoint for the Email Skill',
//   endpointUrl: 'https://yuesuemailskill0207-gjvga67.azurewebsites.net/api/messages',
//   msAppId: '79432da8-0f7e-4a16-8c23-ddbba30ae85d',
// });

const builtInSkills = [
  {
    name: 'productionByConfig',
    protocol: 'BotFrameworkV3',
    description: 'Production endpoint for the Email Skill',
    endpointUrl: 'https://yuesuemailskill0207-gjvga67.azurewebsites.net/api/messages',
    msAppId: '79432da8-0f7e-4a16-8c23-ddbba30ae85d',
  },
  {
    name: 'production',
    manifestUrl: 'https://yuesuemailskill0207-gjvga67.azurewebsites.net/manifest/manifest-1.0.json',
    protocol: 'BotFrameworkV3',
    description: 'Production endpoint for the Email Skill',
    endpointUrl: 'https://yuesuemailskill0207-gjvga67.azurewebsites.net/api/messages',
    msAppId: '79432da8-0f7e-4a16-8c23-ddbba30ae85d',
  },
];

const SkillList: React.FC<ISkillListProps> = props => {
  let { skills } = props;
  const [editIsOpen, setEditIsOpen] = useState(false);
  const [formData, setFormData] = useState<ISkillFormData | null>(null);

  skills = builtInSkills;

  const onSubmitForm = (formData: ISkillByAppConfig | ISkillByManifestUrl) => {
    console.log(formData);
  };

  const onDismissForm = () => {
    setFormData(null);
    setEditIsOpen(false);
  };

  const onItemEdit = item => {
    // console.log(item);
    const { manifestUrl, name, msAppId, endpointUrl } = item;
    setFormData({ manifestUrl, name, msAppId, endpointUrl });
    setEditIsOpen(true);
  };

  const onItemDelete = item => {
    console.log(item);
  };

  const getColumns = useCallback(() => {
    return columns.concat({
      key: 'buttons',
      name: '',
      minWidth: 100,
      maxWidth: 100,
      fieldName: 'buttons',
      data: 'string',
      onRender: item => {
        return (
          <div>
            <Stack tokens={{ childrenGap: 8 }} horizontal>
              <IconButton
                iconProps={{
                  iconName: 'Edit',
                }}
                onClick={() => onItemEdit(item)}
                title="Edit"
                ariaLabel="Edit"
              />
              <IconButton
                iconProps={{
                  iconName: 'Delete',
                }}
                onClick={() => onItemDelete(item)}
                title="Delete"
                ariaLabel="Delete"
              />
            </Stack>
          </div>
        );
      },
    });
  }, [formData]);

  const onRenderDetailsHeader = useCallback((props, defaultRender) => {
    return (
      <div data-testid="tableHeader">
        <Sticky stickyPosition={StickyPositionType.Header} isScrollSynced={true}>
          {defaultRender({
            ...props,
            onRenderColumnHeaderTooltip: tooltipHostProps => <TooltipHost {...tooltipHostProps} />,
          })}
        </Sticky>
      </div>
    );
  }, []);

  const onRenderDetailsFooter = useCallback(() => {
    // do not allow add template in particular dialog lg, it suppose to be auto generated in form.
    return (
      <div css={ActionButton} data-testid="add-skill">
        {editIsOpen ? (
          <SkillForm skills={skills} formData={formData} onSubmit={onSubmitForm} onDismiss={onDismissForm}></SkillForm>
        ) : (
          <Link onClick={() => setEditIsOpen(true)}>Connect to a new skill</Link>
        )}
      </div>
    );
  }, [editIsOpen, formData]);

  return (
    <div css={ContentStyle} data-testid="skill-list">
      <div css={TableView}>
        <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
          <DetailsList
            items={skills}
            styles={{ contentWrapper: { fontSize: FontSizes.size16 } }}
            columns={getColumns()}
            selectionMode={SelectionMode.single}
            layoutMode={DetailsListLayoutMode.justified}
            isHeaderVisible={true}
            onRenderDetailsHeader={onRenderDetailsHeader}
            onRenderDetailsFooter={onRenderDetailsFooter}
            checkboxVisibility={CheckboxVisibility.hidden}
          />
        </ScrollablePane>
      </div>
    </div>
  );
};

export default SkillList;
