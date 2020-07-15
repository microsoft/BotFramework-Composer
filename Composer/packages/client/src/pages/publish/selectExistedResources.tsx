// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { useState, useMemo, useContext, Fragment } from 'react';
import formatMessage from 'format-message';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
// import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
// import { List } from 'office-ui-fabric-react/lib/List';

import { StoreContext } from '../../store';
import { Subscription, ResourceGroups } from '../../store/types';

// import { resourcesListCell, resourcesListCellContent } from './styles';

interface SelectExistedResourcesProps {
  onDismiss: () => void;
  onSubmit: (value) => void;
}

export const SelectExistedResources: React.FC<SelectExistedResourcesProps> = (props) => {
  const { state, actions } = useContext(StoreContext);
  const { subscriptions, resourceGroups } = state;
  const [currentSubscription, setSubscription] = useState<Subscription>();
  const [currentResourceGroup, setResourceGroup] = useState<ResourceGroups>();

  const subscriptionOption = useMemo(() => {
    return subscriptions.map((t) => ({ key: t.subscriptionId, text: t.displayName }));
  }, [subscriptions]);

  const resourceGroupsOption = useMemo(() => {
    return resourceGroups.map((t) => ({ key: t.id, text: t.name }));
  }, [resourceGroups]);

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
        // actions.getResourcesByResourceGroup(currentSubscription?.subscriptionId, group.name);
      }
    },
    [resourceGroups]
  );

  // useEffect(() => {
  //   if (currentSubscription) {
  //     // get resource group under subscription
  //     actions.getResourceGroups(currentSubscription.subscriptionId);
  //   }
  // }, [currentSubscription]);

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
