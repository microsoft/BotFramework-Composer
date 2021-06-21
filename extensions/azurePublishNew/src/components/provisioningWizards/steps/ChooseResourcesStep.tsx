// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { FC } from 'react';
import { ScrollablePane, ScrollbarVisibility, Stack } from 'office-ui-fabric-react';
import formatMessage from 'format-message';
import { Text } from 'office-ui-fabric-react/lib/Text';
import styled from '@emotion/styled';
import { FluentTheme } from '@uifabric/fluent-theme';
import { usePublishApi } from '@bfc/extension-client';
import { useRecoilValue } from 'recoil';

import { ChooseResourcesList } from '../../shared/ChooseResourcesList';
import { ResourcesItem } from '../../../types';
import { useResourcesApi } from '../../../hooks/useResourcesApi';
import { hostNameState } from '../../../recoilModel/atoms/resourceConfigurationState';
import { useDispatcher } from '../../../hooks/useDispatcher';

const AddResourcesSectionName = styled(Text)`
  font-size: ${FluentTheme.fonts.mediumPlus.fontSize};
`;
type Props = {
  enabledResources: ResourcesItem[] | undefined;
  onChangeSelection?: (requiredItems: ResourcesItem[]) => void;
};

const Root = styled(ScrollablePane)`
  height: calc(100vh - 65px);
`;

export const ChooseResourcesStep: FC<Props> = ({ enabledResources, onChangeSelection }) => {
  const [items, setItems] = React.useState<ResourcesItem[]>([]);
  const { getResourceList, getPreview, getExistingResources } = useResourcesApi();
  const { publishConfig } = usePublishApi();
  const hostName = useRecoilValue(hostNameState);
  const { setRequiredResources } = useDispatcher();
  const { currentProjectId, getType } = usePublishApi();

  const requiredListItems = items.filter((item) => item.required);
  const optionalListItems = items.filter((item) => !item.required);

  React.useEffect(() => {
    (async () => {
      try {
        const resources = await getResourceList(currentProjectId(), getType());
        const alreadyHave = getExistingResources(publishConfig);

        const names = getPreview(hostName);
        const result = [];
        for (const resource of resources) {
          if (alreadyHave.find((item) => item === resource.key)) {
            continue;
          }
          const previewObject = names.find((n) => n.key === resource.key);
          result.push({
            ...resource,
            name: previewObject ? previewObject.name : `UNKNOWN NAME FOR ${resource.key}`,
            icon: previewObject ? previewObject.icon : undefined,
          });
        }
        setItems(result);
      } catch (err) {
        // TODO(#8175): Add error handling on the choose resources step
        // eslint-disable-next-line no-console
        console.log('ERROR', err);
      }
    })();
  }, [getResourceList, getExistingResources, getPreview]);

  React.useEffect(() => {
    if (items.length > 0) {
      setRequiredResources(requiredListItems);
      !enabledResources && onChangeSelection(optionalListItems); // select all the optional items by default
    }
  }, [items]);

  return (
    <Root data-is-scrollable="true" scrollbarVisibility={ScrollbarVisibility.auto}>
      <Stack>
        {requiredListItems.length > 0 && (
          <>
            <AddResourcesSectionName>{formatMessage('Required')}</AddResourcesSectionName>
            <ChooseResourcesList items={requiredListItems} />
          </>
        )}
        {optionalListItems.length > 0 && (
          <>
            <AddResourcesSectionName>{formatMessage('Optional')}</AddResourcesSectionName>
            <ChooseResourcesList
              items={optionalListItems}
              selectedKeys={enabledResources?.map((er) => er.key) ?? []}
              onSelectionChanged={(keys) => {
                onChangeSelection?.(optionalListItems.filter((item) => keys.includes(item.key)));
              }}
            />
          </>
        )}
      </Stack>
    </Root>
  );
};
