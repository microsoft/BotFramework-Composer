// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AzureTenant } from '@botframework-composer/types';
import React, { useEffect, useState, memo } from 'react';
import formatMessage from 'format-message';
import { usePublishApi, getTenants, getARMTokenForTenant } from '@bfc/extension-client';
import jwtDecode from 'jwt-decode';

import { UserInfo } from '../../recoilModel/types';
import { AutoComplete, IAutoCompleteProps } from '../shared/autoComplete/AutoComplete';

const { userShouldProvideTokens, getTenantIdFromCache, setTenantId } = usePublishApi();

type Props = {
  onTenantChange: React.Dispatch<React.SetStateAction<string>>;
  onUserInfoFetch: React.Dispatch<React.SetStateAction<UserInfo>>;
} & Omit<IAutoCompleteProps, 'items' | 'onSubmit'>;

const messages = {
  placeholder: formatMessage('Select Azure directory'),
  tenantListEmpty: formatMessage('No Azure Directories were found.'),
};

export const TenantPicker = memo((props: Props) => {
  const { onTenantChange, onUserInfoFetch } = props;
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
    if (!userShouldProvideTokens()) {
      // We should get an ARM token for the tenant in the profile and then fetch tenant details after to show in the UI.
      // Note: For electron, getTenants may cause the sign-in dialog to appear.
      setErrorMessage(undefined);
      setIsLoading(true);
      getTenants()
        .then((tenants) => {
          setTenants(tenants);
          setIsLoading(false);
          if (tenants.length === 0) {
            setErrorMessage(messages.tenantListEmpty);
          } else {
            setErrorMessage(undefined);
          }

          const cachedTenantId = getTenantIdFromCache();
          if (cachedTenantId && tenants.map((t) => t.tenantId).includes(cachedTenantId)) {
            setTenantId(cachedTenantId);
          } else {
            setTenantId(undefined);
            if (tenants?.length > 0) {
              // seed tenant selection with 1st tenant
              setTenantId(tenants[0].tenantId);
            }
          }
          onTenantChange(cachedTenantId);
        })
        .catch((err) => {
          setIsLoading(false);
          setErrorMessage(
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
        setErrorMessage(undefined);
      })
      .catch((err) => {
        setTenantId(undefined);
        onUserInfoFetch(undefined);
        setErrorMessage(
          formatMessage('There was a problem getting the access token for the current Azure directory. {errMessage}', {
            errMessage: err.message || err.toString(),
          })
        );
        setErrorMessage(err.message || err.toString());
      });
  };

  const getValue = React.useCallback(() => {
    if (props.value) {
      return tenants.find((tenant) => tenant.tenantId === props.value)?.displayName;
    } else if (tenants.length === 1) {
      props.onTenantChange(tenants[0].tenantId);
    }
    return '';
  }, [tenants, props.value]);

  useEffect(() => {
    if (props.value && !userShouldProvideTokens()) {
      getTokenForTenant(props.value as string);
    }
  }, [props.value]);

  const localTextFieldProps = {
    disabled: tenants.length === 1,
    placeholder: messages.placeholder,
  };

  return (
    <AutoComplete
      errorMessage={errorMessage}
      isLoading={isLoading}
      items={tenants.map((t) => ({ key: t.tenantId, text: t.displayName }))}
      onSubmit={(option) => props.onTenantChange(option.key as string)}
      {...{ ...props, textFieldProps: { ...localTextFieldProps, ...props.textFieldProps }, value: getValue() }}
    />
  );
});
