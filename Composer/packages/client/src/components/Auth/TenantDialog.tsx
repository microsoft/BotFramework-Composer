// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { DialogWrapper, DialogTypes } from '@bfc/ui-shared';
import formatMessage from 'format-message';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { ChoiceGroup } from 'office-ui-fabric-react/lib/ChoiceGroup';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';

import { availableTenantsState, dispatcherState } from '../../recoilModel/atoms';

export interface TenantDialogProps {
  onDismiss: () => void;
}
export const TenantDialog: React.FC<TenantDialogProps> = (props) => {
  const availableTenants = useRecoilValue(availableTenantsState);
  const { setCurrentTenant } = useRecoilValue(dispatcherState);
  const [tenant, setTenant] = useState<string>('');

  return (
    <DialogWrapper
      isBlocking
      isOpen
      dialogType={DialogTypes.CreateFlow}
      subText={formatMessage(
        'The directory you choose will impact subscription, resource group, and region filters that are available when you select or create Azure resources. You can change this later.'
      )}
      title={formatMessage('Select directory')}
      onDismiss={props.onDismiss}
    >
      <ChoiceGroup
        required
        options={availableTenants.map((tenant) => {
          return { key: tenant.tenantId, text: tenant.displayName };
        })}
        onChange={(ev, choice) => {
          setTenant(choice?.key ?? '');
        }}
      />
      <DialogFooter>
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
