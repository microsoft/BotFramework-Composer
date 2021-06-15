// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AzureTenant } from '@botframework-composer/types';
import React, { useEffect, useState, memo } from 'react';
import formatMessage from 'format-message';
import { usePublishApi, getTenants, getARMTokenForTenant } from '@bfc/extension-client';
import jwtDecode from 'jwt-decode';

import { UserInfo } from '../../types';
import { SearchableDropdown, SearchableDropdownProps } from '../shared/searchableDropdown/SearchableDropdown';
import { SearchableDropdownTextFieldProps } from '../shared/searchableDropdown/SearchableDropdownTextField';

const { userShouldProvideTokens, getTokenFromCache, setTenantId } = usePublishApi();

type Props = {
  onTenantChange: (tenantId: string) => void;
  onUserInfoFetch: (userInfo: UserInfo) => void;
} & Omit<SearchableDropdownProps, 'items' | 'onSubmit'>;

export const TenantPicker = memo((props: Props) => {
  const { onTenantChange, onUserInfoFetch, value } = props;
  const [tenants, setTenants] = useState<AzureTenant[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const decodeToken = (token: string) => {
    try {
      return jwtDecode<any>(token);
    } catch (err) {
      console.error('decode token error in ', err);
      return null;
    }
  };
  useEffect(() => {
    if (userShouldProvideTokens()) {
      const { accessToken } = getTokenFromCache();

      const decoded = decodeToken(accessToken);
      onTenantChange(decoded.tid as string);
      onUserInfoFetch({
        token: accessToken,
        email: decoded.upn,
        name: decoded.name,
        expiration: (decoded.exp || 0) * 1000, // convert to ms,
        sessionExpired: false,
      });
    }
  }, []);

  useEffect(() => {
    if (!userShouldProvideTokens()) {
      // We should get an ARM token for the tenant in the profile and then fetch tenant details after to show in the UI.
      // Note: For electron, getTenants may cause the sign-in dialog to appear.

      setErrorMessage(undefined);
      setIsLoading(true);
      (async () => {
        try {
          const tenants = await getTenants();
          setTenants(tenants);
          setIsLoading(false);
          if (tenants.length === 0) {
            setErrorMessage('No Azure Directories were found.');
          } else {
            setErrorMessage(undefined);
          }

          if (!value && tenants?.length > 0) {
            onTenantChange(tenants[0].tenantId);
          }
        } catch (err) {
          setTenants([]);
          setIsLoading(false);
          setErrorMessage(
            formatMessage('There was a problem loading Azure directories. {errMessage}', {
              errMessage: err.message || err.toString(),
            })
          );
        }
      })();
    }
  }, []);

  const getTokenForTenant = async (tenantId: string) => {
    try {
      const token = await getARMTokenForTenant(tenantId);
      setErrorMessage(undefined);
      setTenantId(tenantId);
      const decoded = decodeToken(token);
      onUserInfoFetch({
        token: token,
        email: decoded.upn,
        name: decoded.name,
        expiration: (decoded.exp || 0) * 1000, // convert to ms,
        sessionExpired: false,
      });
    } catch (ex) {
      setTenantId(undefined);
      onUserInfoFetch(undefined);
      setErrorMessage(
        formatMessage('There was a problem getting the access token for the current Azure directory. {errMessage}', {
          errMessage: ex.message || ex.toString(),
        })
      );
    }
  };

  useEffect(() => {
    if (value && !userShouldProvideTokens()) {
      (async () => {
        await getTokenForTenant(props.value);
      })();
    }
  }, [value]);

  const localTextFieldProps = React.useMemo<Partial<SearchableDropdownTextFieldProps>>(
    () => ({
      disabled: true,
      placeholder: formatMessage('Select Azure directory'),
      errorMessage,
    }),
    [errorMessage, tenants]
  );

  return (
    <SearchableDropdown
      isLoading={isLoading}
      items={tenants.map((t) => ({ key: t.tenantId, text: t.displayName }))}
      onSubmit={(option) => props.onTenantChange(option.key)}
      {...{
        ...props,
        textFieldProps: { ...localTextFieldProps, ...props.textFieldProps },
        value: tenants.find(({ tenantId }) => tenantId === props.value)?.displayName,
      }}
    />
  );
});
