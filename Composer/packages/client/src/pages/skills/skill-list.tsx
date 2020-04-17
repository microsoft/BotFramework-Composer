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
import { ContentStyle, TableView, ActionButton, TableCell } from './styles';
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

const SkillList: React.FC<ISkillListProps> = props => {
  const { actions } = useContext(StoreContext);

  const { skills, projectId } = props;

  const [editIndex, setEditIndex] = useState<number | undefined>(undefined);
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [modalOpenIndex, setModalOpenIndex] = useState<number>(0);

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

      // close form, if delete is current opened
      if (index === editIndex) {
        setEditIndex(undefined);
      }
    },
    [projectId, editIndex]
  );

  const onViewManifest = index => {
    setModalOpen(true);
    setModalOpenIndex(index);
  };

  const onHideManifest = () => {
    setModalOpen(false);
    setModalOpenIndex(0);
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
              <IconButton
                iconProps={{ iconName: 'ContextMenu' }}
                onClick={() => onViewManifest(index)}
                title="View"
                ariaLabel="View"
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
      <Modal titleAriaId={'skillManifestModal'} isOpen={isModalOpen} onDismiss={onHideManifest} isBlocking={false}>
        <div>
          <span
            style={{ margin: '14px 0 0 16px', fontSize: '20px', fontWeight: 'bolder', alignItems: 'left' }}
            id={'skillManifestModalHeader'}
          >
            {skills[modalOpenIndex] && skills[modalOpenIndex].name}
          </span>
          <IconButton
            style={{ float: 'right' }}
            iconProps={{ iconName: 'Cancel' }}
            ariaLabel={formatMessage('Close popup modal')}
            onClick={onHideManifest}
          />
        </div>
        <div style={{ margin: '15px 15px 15px 15px' }}>
          <JsonEditor
            key={'testkey'}
            id={'modaljsonview'}
            onChange={() => {}}
            value={isModalOpen && JSON.parse(skills[modalOpenIndex].body)}
            height={800}
            width={800}
            options={{ readOnly: true }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default SkillList;
