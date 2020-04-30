// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import React, { useContext, useMemo, useState } from 'react';
import { Dropdown, IDropdownOption, ResponsiveMode } from 'office-ui-fabric-react/lib/Dropdown';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { Sticky, StickyPositionType } from 'office-ui-fabric-react/lib/Sticky';
import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
import {
  DetailsList,
  DetailsListLayoutMode,
  SelectionMode,
  CheckboxVisibility,
} from 'office-ui-fabric-react/lib/DetailsList';
import formatMessage from 'format-message';

import { calculateTimeDiff } from '../../../../utils';
import { StoreContext } from '../../../../store';
import { ContentProps, SCHEMA_URIS, VERSION_REGEX } from '../constants';

const styles = {
  detailListContainer: css`
    position: relative;
    max-height: 40vh;
    padding-top: 10px;
    overflow: hidden;
    flex-grow: 1;
    min-height: 250px;
  `,
  create: css`
    display: flex;
  `,
};

export const SelectManifest: React.FC<ContentProps> = ({ completeStep, skillManifests, setSkillManifest }) => {
  const { actions } = useContext(StoreContext);
  const [manifestVersion, setManifestVersion] = useState<string>(SCHEMA_URIS[0]);
  const [errors, setErrors] = useState<{ version?: string }>({});

  const [version] = VERSION_REGEX.exec(manifestVersion) || [''];
  const fileName = `skill-manifest-${version.replace(/\./g, '-')}`;

  const options: IDropdownOption[] = useMemo(
    () =>
      SCHEMA_URIS.map((key, index) => {
        const [version] = VERSION_REGEX.exec(key) || [];

        return {
          text: formatMessage('Version {version}', { version }),
          key,
          selected: !index,
        };
      }),
    []
  );

  const handleChange = (_e: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) => {
    if (option) {
      setManifestVersion(option.key as string);
    }
  };

  const handleCreate = () => {
    if (skillManifests.some(manifest => manifest.id === fileName)) {
      setErrors({ version: formatMessage('{fileName} already exists', { fileName }) });
      return;
    } else if (!version) {
      setErrors({ version: formatMessage('Please select a version of the manifest schema') });
      return;
    }
    actions.createSkillManifest({ id: fileName, content: { $schema: manifestVersion } });
    setSkillManifest(fileName);
    completeStep();
  };

  // for detail file list in open panel
  const tableColumns = [
    {
      key: 'column1',
      name: formatMessage('Name'),
      fieldName: 'id',
      minWidth: 150,
      maxWidth: 200,
      isRowHeader: true,
      isResizable: true,
      isSorted: true,
      isSortedDescending: false,
      sortAscendingAriaLabel: formatMessage('Sorted A to Z'),
      sortDescendingAriaLabel: formatMessage('Sorted Z to A'),
      data: 'string',
      onRender: item => {
        return <span aria-label={item.name}>{item.id}</span>;
      },
      isPadded: true,
    },
    {
      key: 'column2',
      name: formatMessage('Date Modified'),
      fieldName: 'lastModified',
      minWidth: 60,
      maxWidth: 70,
      isResizable: true,
      data: 'number',
      onRender: item => {
        return <span>{calculateTimeDiff(item.dateModified)}</span>;
      },
      isPadded: true,
    },
  ];

  function onRenderDetailsHeader(props, defaultRender) {
    return (
      <Sticky stickyPosition={StickyPositionType.Header} isScrollSynced={true}>
        {defaultRender({
          ...props,
          onRenderColumnHeaderTooltip: tooltipHostProps => <TooltipHost {...tooltipHostProps} />,
        })}
      </Sticky>
    );
  }

  return (
    <div>
      <div>
        <Label
          required
          styles={{
            root: { fontWeight: '400' },
          }}
        >
          {formatMessage('Manifest Version')}
        </Label>
        <div css={styles.create}>
          <Dropdown
            errorMessage={errors?.version}
            options={options}
            responsiveMode={ResponsiveMode.large}
            styles={{
              root: {
                width: '250px',
              },
            }}
            onChange={handleChange}
          />
          <PrimaryButton
            styles={{
              root: {
                marginLeft: 8,
              },
            }}
            onClick={handleCreate}
          >
            {formatMessage('Create')}
          </PrimaryButton>
        </div>
      </div>
      <div css={styles.detailListContainer}>
        <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
          <DetailsList
            items={skillManifests}
            compact={false}
            columns={tableColumns}
            getKey={item => item.name}
            layoutMode={DetailsListLayoutMode.justified}
            onRenderDetailsHeader={onRenderDetailsHeader}
            isHeaderVisible={true}
            onActiveItemChanged={({ id }) => setSkillManifest(id)}
            selectionMode={SelectionMode.single}
            checkboxVisibility={CheckboxVisibility.hidden}
          />
        </ScrollablePane>
      </div>
    </div>
  );
};
