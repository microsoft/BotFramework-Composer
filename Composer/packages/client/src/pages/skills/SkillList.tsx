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
import React, { useContext, useState, useCallback } from 'react';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
import { Sticky, StickyPositionType } from 'office-ui-fabric-react/lib/Sticky';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { FontSizes } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';

import { StoreContext } from '../../store';

import SkillForm from './SkillForm';
import { ContentStyle, TableView, ActionButton, TableCell } from './styles';
import { ISkill, ISkillByAppConfig, ISkillByManifestUrl } from './types';

export interface ISkillListProps {
  skills: ISkill[];
  projectId: string;
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

const SkillList: React.FC<ISkillListProps> = props => {
  const { actions } = useContext(StoreContext);

  const { skills, projectId } = props;
  const [editIndex, setEditIndex] = useState<number | undefined>(undefined);

  const onSubmitForm = useCallback(
    (submitFormData: ISkillByAppConfig | ISkillByManifestUrl, editIndex: number) => {
      const payload = {
        projectId,
        targetId: editIndex,
        skillData: submitFormData,
      };
      actions.updateSkill(payload);
      setEditIndex(undefined);
    },
    [projectId]
  );

  const onDismissForm = useCallback(() => {
    setEditIndex(undefined);
  }, []);

  const onItemEdit = useCallback(index => {
    setEditIndex(index);
  }, []);

  const onItemDelete = useCallback(
    index => {
      const payload = {
        projectId,
        targetId: index,
        skillData: null,
      };
      actions.updateSkill(payload);
    },
    [projectId]
  );

  const getColumns = useCallback(() => {
    return columns.concat({
      key: 'buttons',
      name: '',
      minWidth: 100,
      maxWidth: 100,
      fieldName: 'buttons',
      data: 'string',
      onRender: (_item, index) => {
        return (
          <div>
            <Stack tokens={{ childrenGap: 8 }} horizontal>
              <IconButton
                iconProps={{
                  iconName: 'Edit',
                }}
                onClick={() => onItemEdit(index)}
                title="Edit"
                ariaLabel="Edit"
              />
              <IconButton
                iconProps={{
                  iconName: 'Delete',
                }}
                onClick={() => onItemDelete(index)}
                title="Delete"
                ariaLabel="Delete"
              />
            </Stack>
          </div>
        );
      },
    });
  }, [projectId]);

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
        {typeof editIndex === 'number' ? (
          <SkillForm
            skills={skills}
            editIndex={editIndex}
            onSubmit={onSubmitForm}
            onDismiss={onDismissForm}
          ></SkillForm>
        ) : (
          <Link onClick={() => setEditIndex(-1)}>Connect to a new skill</Link>
        )}
      </div>
    );
  }, [editIndex, skills]);

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
