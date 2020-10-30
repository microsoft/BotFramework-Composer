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
import React, { useState, useCallback, useMemo } from 'react';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
import { Sticky, StickyPositionType } from 'office-ui-fabric-react/lib/Sticky';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { FontSizes } from '@uifabric/fluent-theme';
import { useRecoilValue } from 'recoil';
import formatMessage from 'format-message';

import { DisplayManifestModal } from '../../components/Modal/DisplayManifestModal';
import { dispatcherState, skillsState } from '../../recoilModel';

import { TableView, TableCell } from './styles';

const columns: IColumn[] = [
  {
    key: 'name',
    name: formatMessage('Available Skills'),
    fieldName: 'name',
    minWidth: 100,
    maxWidth: 150,
    isResizable: true,
    data: 'string',
    onRender: ({ skill: { name } }) => {
      return <div css={TableCell}>{name}</div>;
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
    onRender: ({ skill, onEditSkill }) => {
      const { endpoints, endpointUrl: selectedEndpointUrl } = skill;

      const options = (endpoints || []).map(({ name, endpointUrl, msAppId }, key) => ({
        key,
        text: name,
        data: {
          endpointUrl,
          msAppId,
        },
        selected: endpointUrl === selectedEndpointUrl,
      }));

      const handleChange = (_, option?: IDropdownOption) => {
        if (option) {
          onEditSkill({ ...skill, ...option.data });
        }
      };

      return <Dropdown options={options} onChange={handleChange} />;
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
    onRender: ({ skill: { description } }) => {
      return <div css={TableCell}>{description}</div>;
    },
  },
  {
    key: 'buttons',
    name: '',
    minWidth: 120,
    maxWidth: 120,
    fieldName: 'buttons',
    data: 'string',
    onRender: ({ onDelete, onViewManifest }) => {
      return (
        <div>
          <Stack horizontal tokens={{ childrenGap: 8 }}>
            <IconButton
              ariaLabel={formatMessage('Delete')}
              data-testid="DeleteSkill"
              iconProps={{
                iconName: 'Delete',
              }}
              title={formatMessage('Delete')}
              onClick={() => onDelete()}
            />
            <IconButton
              ariaLabel={formatMessage('View')}
              data-testid="ViewManifest"
              iconProps={{ iconName: 'ContextMenu' }}
              title={formatMessage('View')}
              onClick={() => onViewManifest()}
            />
          </Stack>
        </div>
      );
    },
  },
];

interface SkillListProps {
  projectId: string;
}

const SkillList: React.FC<SkillListProps> = ({ projectId }) => {
  const { removeSkill, updateSkill } = useRecoilValue(dispatcherState);
  const skills = useRecoilValue(skillsState(projectId));

  const [selectedSkillUrl, setSelectedSkillUrl] = useState<string | null>(null);

  const handleViewManifest = (item) => {
    if (item && item.name && item.content) {
      setSelectedSkillUrl(item.manifestUrl);
    }
  };

  const handleEditSkill = (projectId, skillId) => (skillData) => {
    updateSkill(projectId, skillId, skillData);
  };

  const items = useMemo(
    () =>
      skills.map((skill) => ({
        skill,
        onDelete: () => removeSkill(projectId, skill.id),
        onViewManifest: () => handleViewManifest(skill),
        onEditSkill: handleEditSkill(projectId, skill.id),
      })),
    [skills, projectId]
  );

  const onDismissManifest = () => {
    setSelectedSkillUrl(null);
  };

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

  return (
    <React.Fragment>
      <div aria-label={formatMessage('List view')} css={TableView} role="region">
        <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
          <DetailsList
            isHeaderVisible
            checkboxVisibility={CheckboxVisibility.hidden}
            columns={columns}
            items={items}
            layoutMode={DetailsListLayoutMode.justified}
            selectionMode={SelectionMode.single}
            styles={{ contentWrapper: { fontSize: FontSizes.size16 } }}
            onRenderDetailsHeader={onRenderDetailsHeader}
          />
        </ScrollablePane>
      </div>
      <DisplayManifestModal
        isDraggable={false}
        isModeless={false}
        manifestId={selectedSkillUrl}
        projectId={projectId}
        onDismiss={onDismissManifest}
      />
    </React.Fragment>
  );
};

export default SkillList;
