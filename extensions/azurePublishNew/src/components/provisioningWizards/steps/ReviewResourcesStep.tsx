// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import formatMessage from 'format-message';
import { NeutralColors } from '@uifabric/fluent-theme';
import styled from '@emotion/styled';
import {
  ScrollablePane,
  DetailsList,
  ScrollbarVisibility,
  DetailsListLayoutMode,
  SelectionMode,
  IColumn,
} from 'office-ui-fabric-react';
import { useRecoilValue } from 'recoil';

import { ResourcesItem } from '../../../types';
import {
  requiredResourcesState,
  enabledResourcesState,
  resourceGroupState,
  deployLocationState,
  luisRegionState,
} from '../../../recoilModel/atoms/resourceConfigurationState';
import { AzureResourceTypes } from '../../../constants';

const Root = styled(ScrollablePane)`
  height: calc(100vh - 65px);
`;

const ListItem = styled.div`
  white-space: normal;
  font-size: 12px;
  color: ${NeutralColors.gray130};
`;

const getResourceRegion = (item: ResourcesItem): string => {
  const { key, region } = item;
  switch (key) {
    case AzureResourceTypes.APP_REGISTRATION:
    case AzureResourceTypes.BOT_REGISTRATION:
      return 'global';
    default:
      return region;
  }
};

export const ReviewResourcesStep = () => {
  const requiredResources = useRecoilValue(requiredResourcesState);
  const enabledOptionalResource = useRecoilValue(enabledResourcesState);
  const resourceGroup = useRecoilValue(resourceGroupState);
  const deployLocation = useRecoilValue(deployLocationState);
  const luisRegion = useRecoilValue(luisRegionState);

  const reviewCols: IColumn[] = React.useMemo(
    () => [
      {
        key: 'Icon',
        name: 'File Type',
        isIconOnly: true,
        fieldName: 'name',
        minWidth: 16,
        maxWidth: 16,
        onRender: (item: ResourcesItem & { name; icon }) => {
          return <img src={item.icon} />;
        },
      },
      {
        key: 'Resource Type',
        name: formatMessage('Resource Type'),
        className: 'Resource Type',
        fieldName: 'Resource Type',
        minWidth: 150,
        isRowHeader: true,
        data: 'string',
        onRender: (item: ResourcesItem) => {
          return <div>{item.text}</div>;
        },
        isPadded: true,
      },
      {
        key: 'resourceGroup',
        name: formatMessage('Resource Group'),
        className: 'resourceGroup',
        fieldName: 'resourceGroup',
        minWidth: 100,
        isRowHeader: true,
        data: 'string',
        onRender: (item: ResourcesItem) => {
          return <ListItem>{item.resourceGroup}</ListItem>;
        },
        isPadded: true,
      },
      {
        key: 'Name',
        name: formatMessage('Name'),
        className: 'name',
        fieldName: 'name',
        minWidth: 150,
        isRowHeader: true,
        data: 'string',
        onRender: (item: ResourcesItem & { name; icon }) => {
          return <ListItem>{item.name}</ListItem>;
        },
        isPadded: true,
      },
      {
        key: 'Region',
        name: formatMessage('Region'),
        className: 'region',
        fieldName: 'region',
        minWidth: 100,
        isRowHeader: true,
        data: 'string',
        onRender: (item: ResourcesItem) => {
          return <ListItem>{getResourceRegion(item)}</ListItem>;
        },
        isPadded: true,
      },
    ],
    []
  );

  const reviewListItems = React.useMemo(() => {
    return [...requiredResources, ...enabledOptionalResource].map((resource: ResourcesItem) => {
      let region = deployLocation;
      if (resource.key.includes('luis')) {
        region = luisRegion;
      }
      return {
        ...resource,
        region,
        resourceGroup: resourceGroup?.name,
      };
    });
  }, [requiredResources, enabledOptionalResource]);

  return (
    <Root scrollbarVisibility={ScrollbarVisibility.auto}>
      <DetailsList
        isHeaderVisible
        columns={reviewCols}
        getKey={(item) => item.key}
        items={reviewListItems}
        layoutMode={DetailsListLayoutMode.justified}
        selectionMode={SelectionMode.none}
        setKey="none"
      />
    </Root>
  );
};
