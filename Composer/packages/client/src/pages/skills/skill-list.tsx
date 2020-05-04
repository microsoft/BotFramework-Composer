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
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { FontSizes } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';
import { Skill } from '@bfc/shared';
import { JsonEditor } from '@bfc/code-editor';

import { StoreContext } from '../../store';

import SkillForm from './skill-form';
import { TableView, ActionButton, TableCell, ManifestModalHeaderStyle, ManifestModalBodyStyle } from './styles';
import { ISkillFormData } from './types';

export interface ISkillListProps {
  skills: Skill[];
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
    onRender: (item: Skill) => {
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
    onRender: (item: Skill) => {
      return <div css={TableCell}>{item.msAppId}</div>;
    },
  },
  {
    key: 'endpointUrl',
    name: formatMessage('Skill Endpoint'),
    fieldName: 'endpointUrl',
    minWidth: 450,
    isResizable: true,
    data: 'string',
    onRender: (item: Skill) => {
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
    onRender: (item: Skill) => {
      return <div css={TableCell}>{item.description}</div>;
    },
  },
];

const SkillList: React.FC<ISkillListProps> = (props) => {
  const { actions } = useContext(StoreContext);

  const { skills, projectId } = props;

  const [editIndex, setEditIndex] = useState<number | undefined>(undefined);
  const [selectedSkillIndex, setSelectedSkillIndex] = useState<number | null>(null);

  const onSubmitForm = useCallback(
    (submitFormData: ISkillFormData, editIndex: number) => {
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

  const onItemEdit = useCallback((index) => {
    setEditIndex(index);
  }, []);

  const onItemDelete = useCallback(
    (index) => {
      const payload = {
        projectId,
        targetId: index,
        skillData: null,
      };
      actions.updateSkill(payload);

      // close form, if delete is current opened
      if (index === editIndex) {
        setEditIndex(undefined);
      }
    },
    [projectId, editIndex]
  );

  const onViewManifest = (index) => {
    setSelectedSkillIndex(index);
  };

  const onHideManifest = () => {
    setSelectedSkillIndex(null);
  };

  const getColumns = useCallback(() => {
    return columns.concat({
      key: 'buttons',
      name: '',
      minWidth: 120,
      maxWidth: 120,
      fieldName: 'buttons',
      data: 'string',
      onRender: (_item, index) => {
        return (
          <div>
            <Stack horizontal tokens={{ childrenGap: 8 }}>
              <IconButton
                ariaLabel="Edit"
                iconProps={{
                  iconName: 'Edit',
                }}
                onClick={() => onItemEdit(index)}
                title="Edit"
              />
              <IconButton
                ariaLabel="Delete"
                iconProps={{
                  iconName: 'Delete',
                }}
                onClick={() => onItemDelete(index)}
                title="Delete"
              />
              <IconButton
                ariaLabel="View"
                iconProps={{ iconName: 'ContextMenu' }}
                onClick={() => onViewManifest(index)}
                title="View"
              />
            </Stack>
          </div>
        );
      },
    });
  }, [projectId, editIndex]);

  const onRenderDetailsHeader = useCallback((props, defaultRender) => {
    return (
      <div data-testid="tableHeader">
        <Sticky isScrollSynced stickyPosition={StickyPositionType.Header}>
          {defaultRender({
            ...props,
            onRenderColumnHeaderTooltip: (tooltipHostProps) => <TooltipHost {...tooltipHostProps} />,
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
            editIndex={editIndex}
            onDismiss={onDismissForm}
            onSubmit={onSubmitForm}
            skills={skills}
          ></SkillForm>
        ) : (
          <Link onClick={() => setEditIndex(-1)}>{formatMessage('Connect to a new skill')}</Link>
        )}
      </div>
    );
  }, [editIndex, skills]);

  return (
    <div data-testid="skill-list">
      <div css={TableView}>
        <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
          <DetailsList
            checkboxVisibility={CheckboxVisibility.hidden}
            columns={getColumns()}
            isHeaderVisible
            items={skills}
            layoutMode={DetailsListLayoutMode.justified}
            onRenderDetailsFooter={onRenderDetailsFooter}
            onRenderDetailsHeader={onRenderDetailsHeader}
            selectionMode={SelectionMode.single}
            styles={{ contentWrapper: { fontSize: FontSizes.size16 } }}
          />
        </ScrollablePane>
      </div>
      <Modal
        isBlocking={false}
        isOpen={selectedSkillIndex !== null}
        onDismiss={onHideManifest}
        titleAriaId={'skillManifestModal'}
      >
        <div>
          <span css={ManifestModalHeaderStyle} id={'skillManifestModalHeader'}>
            {selectedSkillIndex !== null && skills[selectedSkillIndex] && skills[selectedSkillIndex].name}
          </span>
          <IconButton
            ariaLabel={formatMessage('Close popup modal')}
            iconProps={{ iconName: 'Cancel' }}
            onClick={onHideManifest}
            style={{ float: 'right' }}
          />
        </div>
        <div css={ManifestModalBodyStyle}>
          <JsonEditor
            height={800}
            id={'modaljsonview'}
            key={'testkey'}
            onChange={() => {}}
            options={{ readOnly: true }}
            value={selectedSkillIndex !== null && JSON.parse(skills[selectedSkillIndex].body || '')}
            width={800}
          />
        </div>
      </Modal>
    </div>
  );
};

export default SkillList;
