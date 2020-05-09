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
import React, { useState, useCallback } from 'react';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
import { Sticky, StickyPositionType } from 'office-ui-fabric-react/lib/Sticky';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { FontSizes } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';
import { Skill } from '@bfc/shared';
import { JsonEditor } from '@bfc/code-editor';

import { TableView, TableCell, ManifestModalHeaderStyle, ManifestModalBodyStyle } from './styles';

export interface ISkillListProps {
  skills: Skill[];
  projectId: string;
  onEdit: (index?: number) => void;
  onDelete: (index?: number) => void;
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
    minWidth: 150,
    maxWidth: 280,
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
    minWidth: 250,
    maxWidth: 400,
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
    minWidth: 200,
    maxWidth: 400,
    isResizable: true,
    data: 'string',
    onRender: (item: Skill) => {
      return <div css={TableCell}>{item.description}</div>;
    },
  },
];

const SkillList: React.FC<ISkillListProps> = props => {
  const { skills, projectId, onEdit, onDelete } = props;

  const [selectedSkillIndex, setSelectedSkillIndex] = useState<number | null>(null);

  const onViewManifest = index => {
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
            <Stack tokens={{ childrenGap: 8 }} horizontal>
              <IconButton
                iconProps={{
                  iconName: 'Edit',
                }}
                onClick={() => onEdit(index)}
                title="Edit"
                ariaLabel="Edit"
                data-testid="EditSkill"
              />
              <IconButton
                iconProps={{
                  iconName: 'Delete',
                }}
                onClick={() => onDelete(index)}
                title="Delete"
                ariaLabel="Delete"
                data-testid="DeleteSkill"
              />
              <IconButton
                iconProps={{ iconName: 'ContextMenu' }}
                onClick={() => onViewManifest(index)}
                title="View"
                ariaLabel="View"
                data-testid="ViewManifest"
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

  return (
    <React.Fragment>
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
            checkboxVisibility={CheckboxVisibility.hidden}
          />
        </ScrollablePane>
      </div>
      <Modal
        titleAriaId={'skillManifestModal'}
        isOpen={selectedSkillIndex !== null}
        onDismiss={onHideManifest}
        isBlocking={false}
      >
        <div>
          <span css={ManifestModalHeaderStyle} id={'skillManifestModalHeader'}>
            {selectedSkillIndex !== null && skills[selectedSkillIndex] && skills[selectedSkillIndex].name}
          </span>
          <IconButton
            style={{ float: 'right' }}
            iconProps={{ iconName: 'Cancel' }}
            ariaLabel={formatMessage('Close popup modal')}
            onClick={onHideManifest}
          />
        </div>
        <div css={ManifestModalBodyStyle}>
          <JsonEditor
            key={'testkey'}
            id={'modaljsonview'}
            onChange={() => {}}
            value={selectedSkillIndex !== null && JSON.parse(skills[selectedSkillIndex].body || '')}
            height={800}
            width={800}
            options={{ readOnly: true }}
          />
        </div>
      </Modal>
    </React.Fragment>
  );
};

export default SkillList;
