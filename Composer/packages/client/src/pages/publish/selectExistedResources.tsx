// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { useState, useMemo, useContext, Fragment } from 'react';
import formatMessage from 'format-message';
import { Dropdown, IDropdownOption, DropdownMenuItemType } from 'office-ui-fabric-react/lib/Dropdown';
// import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
// import { List } from 'office-ui-fabric-react/lib/List';

import { StoreContext } from '../../store';
import { Subscription, ResourceGroups } from '../../store/types';

// import { resourcesListCell, resourcesListCellContent } from './styles';

interface SelectExistedResourcesProps {
  onDismiss: () => void;
  onSubmit: (value) => void;
}
const selectedType = [
  'Microsoft.DocumentDB/databaseAccounts',
  'Microsoft.Storage/storageAccounts',
  'Microsoft.CognitiveServices/accounts',
  'Microsoft.Web/sites',
  'Microsoft.Insights/components',
];
export const SelectExistedResources: React.FC<SelectExistedResourcesProps> = (props) => {
  const { state, actions } = useContext(StoreContext);
  const { subscriptions, resourceGroups, resources } = state;
  const [currentSubscription, setSubscription] = useState<Subscription>();
  const [currentResourceGroup, setResourceGroup] = useState<ResourceGroups>();
  const [selectedResources, setExternalResources] = useState<string[]>([]);
  const subscriptionOption = useMemo(() => {
    return subscriptions.map((t) => ({ key: t.subscriptionId, text: t.displayName }));
  }, [subscriptions]);

  const resourceGroupsOption = useMemo(() => {
    return resourceGroups.map((t) => ({ key: t.id, text: t.name }));
  }, [resourceGroups]);

  const existedResources = useMemo(() => {
    let temp: any = [];
    selectedType.map((type) => {
      const group = [] as any;
      resources.map((res) => {
        if (res.type === type) group.push({ key: res.id, text: res.name });
      });
      if (group.length > 0) {
        temp.push({ key: type, text: type, itemType: DropdownMenuItemType.Header });
        temp = temp.concat(group);
      }
    });
    console.log(temp);
    return temp;
  }, [resources]);

  const updateCurrentSubscription = useMemo(
    () => (_e, option?: IDropdownOption) => {
      const sub = subscriptions.find((t) => t.subscriptionId === option?.key);

      if (sub) {
        setSubscription(sub);
        actions.getResourceGroups(sub.subscriptionId);
      }
    },
    [subscriptions]
  );

  const updateCurrentResoruceGroup = useMemo(
    () => (_e, option?: IDropdownOption) => {
      const group = resourceGroups.find((t) => t.id === option?.key);

      if (group) {
        setResourceGroup(group);
        actions.getResourcesByResourceGroup(currentSubscription?.subscriptionId, group.name);
      }
    },
    [resourceGroups]
  );

  const onSelectedResource = useMemo(
    () => (event, item?: IDropdownOption) => {
      if (item) {
        const newselected = item.selected
          ? [...selectedResources, item.key as string]
          : selectedResources.filter((key) => key !== item.key);
        setExternalResources(newselected);
      }
    },
    [selectedResources]
  );

  // const onRenderCell = (item: Resource): JSX.Element => {
  //   return (
  //     <div data-is-focusable css={resourcesListCell}>
  //       <div css={resourcesListCellContent}>
  //         {item.name} - {item.type}
  //       </div>
  //     </div>
  //   );
  // };

  return (
    <Fragment>
      <form>
        <Dropdown
          label={formatMessage('Subscription')}
          options={subscriptionOption}
          placeholder={formatMessage('Select your subscription')}
          onChange={updateCurrentSubscription}
        />
        <Dropdown
          label={formatMessage('Resource group')}
          options={resourceGroupsOption}
          placeholder={formatMessage('Select your resource group')}
          onChange={updateCurrentResoruceGroup}
        />
        <Dropdown
          multiSelect
          label="select existed resources"
          options={existedResources}
          placeholder="Select options"
          selectedKeys={selectedResources}
          onChange={onSelectedResource}
        />
        {/* <div css={resourcesListContainer} data-is-scrollable="true">
          <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
            <List items={resources} onRenderCell={onRenderCell} />
          </ScrollablePane>
        </div> */}
      </form>
      <DialogFooter>
        <DefaultButton text={formatMessage('Cancel')} onClick={props.onDismiss} />
        <PrimaryButton
          disabled={!currentSubscription || !currentResourceGroup}
          text={formatMessage('Ok')}
          onClick={async () => {
            await props.onSubmit({ subscription: currentSubscription, resourceGroup: currentResourceGroup });
          }}
        />
      </DialogFooter>
    </Fragment>
  );
};
