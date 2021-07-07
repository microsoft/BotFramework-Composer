// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { DialogWrapper, DialogTypes, PropertyAssignment } from '@bfc/ui-shared';
import { FontSizes } from '@uifabric/fluent-theme';
import { FontWeights } from 'office-ui-fabric-react/lib/Styling';
import formatMessage from 'format-message';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { ChoiceGroup } from 'office-ui-fabric-react/lib/ChoiceGroup';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';

import {
  availableTenantsState,
  dispatcherState,
  currentTenantIdState,
  isAuthenticatedState,
} from '../../recoilModel/atoms';

export interface TenantDialogProps {
  onDismiss: () => void;
}
export const TenantDialog: React.FC<TenantDialogProps> = (props) => {
  const availableTenants = useRecoilValue(availableTenantsState);
  const { setCurrentTenant } = useRecoilValue(dispatcherState);
  const currentTenant = useRecoilValue(currentTenantIdState);
  const isAuthenticated = useRecoilValue(isAuthenticatedState);
  // select current or default to first
  const [tenant, setTenant] = useState<string>(currentTenant || availableTenants[0]?.tenantId);

  return (
    <DialogWrapper
      isBlocking
      isOpen
      customerStyle={{
        dialog: {
          title: {
            fontWeight: FontWeights.bold,
            fontSize: FontSizes.size20,
            paddingTop: '14px',
            paddingBottom: '11px',
          },
          subText: {
            fontSize: FontSizes.size14,
          },
        },
        modal: {
          main: {
            maxWidth: '80% !important',
            width: '492px !important',
          },
        },
      }}
      dialogType={DialogTypes.Customer}
      subText={formatMessage(
        'The directory you choose will impact subscription, resource group, and region filters that are available when you select or create Azure resources. You can change this later.'
      )}
      title={formatMessage('Select directory')}
      onDismiss={props.onDismiss}
    >
      <div css={{ maxHeight: 210, overflowY: 'auto' }}>
        <ChoiceGroup
          required
          options={availableTenants.map((tenant) => {
            return { key: tenant.tenantId, text: tenant.displayName };
          })}
          selectedKey={tenant}
          onChange={(ev, choice) => {
            setTenant(choice?.key ?? '');
          }}
        />
      </div>
      <DialogFooter>
        {isAuthenticated && (
          <DefaultButton
            text={formatMessage('Cancel')}
            onClick={() => {
              props.onDismiss();
            }}
          />
        )}
        <PrimaryButton
          disabled={!tenant}
          text={formatMessage('Select')}
          onClick={() => {
            props.onDismiss();
            setCurrentTenant(tenant);
          }}
        />
      </DialogFooter>
    </DialogWrapper>
  );
};
