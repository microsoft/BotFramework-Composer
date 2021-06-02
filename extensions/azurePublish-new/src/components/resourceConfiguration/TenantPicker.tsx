// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AzureTenant } from '@botframework-composer/types';
import React, { useEffect, useState, memo } from 'react';
import { IComboBoxProps, ComboBox } from 'office-ui-fabric-react';
import formatMessage from 'format-message';
import {
  logOut,
  usePublishApi,
  getTenants,
  getARMTokenForTenant,
  useLocalStorage,
  useTelemetryClient,
  TelemetryClient,
  useApplicationApi,
} from '@bfc/extension-client';

import { decodeToken } from '../util';
import { UserInfo } from '../../recoilModel/types';
const {
  currentProjectId,
  publishConfig,
  startProvision,
  closeDialog,
  onBack,
  savePublishConfig,
  setTitle,
  getSchema,
  getType,
  getName,
  getTokenFromCache,
  userShouldProvideTokens,
  getTenantIdFromCache,
  setTenantId,
} = usePublishApi();
type ComboBoxPropsWithOutOptions = Omit<IComboBoxProps, 'options' | 'onChange'>;
type Props = {
  allowCreation?: boolean;
  canRefresh?: boolean;
  onTenantChange: React.Dispatch<React.SetStateAction<string>>;
  onUserInfoFetch: React.Dispatch<React.SetStateAction<UserInfo>>;
} & ComboBoxPropsWithOutOptions;

export const TenantPicker = memo((props: Props) => {
  const { allowCreation, canRefresh, onTenantChange, onUserInfoFetch } = props;
  const [tenants, setTenants] = useState<AzureTenant[]>([]);
  const [tenantsErrorMessage, setTenantsErrorMessage] = useState<string>('');

  useEffect(() => {
    if (!userShouldProvideTokens()) {
      // TODO: handle when existing profile is being edited
      // We should get an ARM token for the tenant in the profile and then fetch tenant details after to show in the UI.
      // Note: For electron, getTenants may cause the sign-in dialog to appear.
      getTenants()
        .then((tenants) => {
          setTenants(tenants);

          if (tenants.length === 0) {
            setTenantsErrorMessage(formatMessage('No Azure Directories were found.'));
          } else {
            setTenantsErrorMessage(undefined);
          }

          const cachedTenantId = getTenantIdFromCache();

          // default to the last used tenant only if it is in the account's tenants
          if (cachedTenantId && tenants.map((t) => t.tenantId).includes(cachedTenantId)) {
            setTenantId(cachedTenantId);
          } else {
            setTenantId(undefined);
            if (tenants?.length > 0) {
              // seed tenant selection with 1st tenant
              setTenantId(tenants[0].tenantId);
            }
          }
          props.onTenantChange(cachedTenantId);
        })
        .catch((err) => {
          setTenantsErrorMessage(
            formatMessage('There was a problem loading Azure directories. {errMessage}', {
              errMessage: err.message || err.toString(),
            })
          );
        });
    }
  }, []);

  const getTokenForTenant = (tenantId: string) => {
    getARMTokenForTenant(tenantId)
      .then((token) => {
        setTenantId(tenantId);
        const decoded = decodeToken(token);
        onUserInfoFetch({
          token: token,
          email: decoded.upn,
          name: decoded.name,
          expiration: (decoded.exp || 0) * 1000, // convert to ms,
          sessionExpired: false,
        });
        setTenantsErrorMessage(undefined);
      })
      .catch((err) => {
        setTenantId(undefined);
        onUserInfoFetch(undefined);
        setTenantsErrorMessage(
          formatMessage('There was a problem getting the access token for the current Azure directory. {errMessage}', {
            errMessage: err.message || err.toString(),
          })
        );
        setTenantsErrorMessage(err.message || err.toString());
      });
  };
  useEffect(() => {
    if (!userShouldProvideTokens()) {
      getTokenForTenant(props.selectedKey as string);
    }
  }, [props.selectedKey]);
  return (
    <ComboBox
      required
      errorMessage={tenantsErrorMessage}
      label="Azure Directory"
      options={tenants.map((t) => ({ key: t.tenantId, text: t.displayName }))}
      placeholder="Select Resource Group"
      onChange={(event, option) => props.onTenantChange(option.key as string)}
      {...props}
    />
  );
});
