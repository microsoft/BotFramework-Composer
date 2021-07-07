// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import formatMessage from 'format-message';
import { Fragment, useEffect, useState, useRef } from 'react';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { Callout } from 'office-ui-fabric-react/lib/Callout';
import { Persona, PersonaSize } from 'office-ui-fabric-react/lib/Persona';
import { ILinkStyles, Link } from 'office-ui-fabric-react/lib/Link';
import { useRecoilValue } from 'recoil';
import { NeutralColors } from '@uifabric/fluent-theme';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { FontSizes } from 'office-ui-fabric-react/lib/Styling';

import {
  currentUserState,
  isAuthenticatedState,
  dispatcherState,
  showAuthDialogState,
  showTenantDialogState,
  requiresGraphState,
} from '../../recoilModel/atoms';
import { zIndices } from '../../utils/zIndices';

import { AuthDialog } from './AuthDialog';
import { TenantDialog } from './TenantDialog';

const styles = {
  username: {
    fontWeight: 600,
  },
  email: {
    display: 'block',
    fontSize: FontSizes.small,
  },
  link: {
    root: {
      display: 'block',
      fontSize: FontSizes.small,
      marginTop: 5,
    },
  },
  logoutLink: {
    root: {
      display: 'block',
      fontSize: FontSizes.small,
    },
  },
};

export const AuthCard: React.FC = () => {
  const [authCardVisible, setAuthCardVisible] = useState<boolean>(false);
  const { refreshLoginStatus, requireUserLogin, logoutUser, setShowAuthDialog, setShowTenantDialog } = useRecoilValue(
    dispatcherState
  );
  const isAuthenticated = useRecoilValue(isAuthenticatedState);
  const currentUser = useRecoilValue(currentUserState);
  const showAuthDialog = useRecoilValue(showAuthDialogState);
  const showTenantDialog = useRecoilValue(showTenantDialogState);
  const requiresGraph = useRecoilValue(requiresGraphState);

  const personaRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    refreshLoginStatus();
  }, []);

  const logout = () => {
    logoutUser();
  };

  const toggleAuthCardVisibility = () => {
    setAuthCardVisible(!authCardVisible);
  };

  const switchTenants = () => {
    requireUserLogin('', { chooseTenant: true });
    toggleAuthCardVisibility();
  };

  return (
    <Fragment>
      {/* this is the icon that appears at the top of the header bar */}
      <div ref={personaRef}>
        <Persona
          hidePersonaDetails
          initialsColor={currentUser ? NeutralColors.gray160 : undefined}
          size={PersonaSize.size32}
          styles={{
            root: {
              marginLeft: 10,
              cursor: 'pointer',
            },
          }}
          text={currentUser?.name}
          onClick={toggleAuthCardVisibility}
        />
      </div>

      {/* this is the actual login card */}
      {authCardVisible && (
        <Callout
          gapSpace={10}
          isBeakVisible={false}
          styles={{
            root: { width: 320, zIndex: zIndices.authContainer, backgroundColor: NeutralColors.white },
          }}
          target={personaRef.current}
          onDismiss={toggleAuthCardVisibility}
        >
          {isAuthenticated ? (
            <Stack tokens={{ childrenGap: 10, padding: 20 }}>
              <Stack.Item align="end">
                <Link styles={styles.logoutLink as ILinkStyles} onClick={logout}>
                  {formatMessage('Sign out')}
                </Link>
              </Stack.Item>
              <Stack.Item>
                <Stack horizontal tokens={{ childrenGap: 20 }}>
                  <Stack.Item>
                    <Persona hidePersonaDetails initialsColor={NeutralColors.gray160} text={currentUser?.name} />
                  </Stack.Item>
                  <Stack.Item>
                    <div style={styles.username}>{currentUser.name}</div>
                    <div style={styles.email}>{currentUser.email}</div>
                    <Link
                      href={'https://myaccount.microsoft.com/'}
                      styles={styles.link as ILinkStyles}
                      target={'_blank'}
                    >
                      {formatMessage('View account on Azure')}
                    </Link>
                    <div>
                      <Link styles={styles.link as ILinkStyles} onClick={switchTenants}>
                        {formatMessage('Switch directory')}
                      </Link>
                    </div>
                  </Stack.Item>
                </Stack>
              </Stack.Item>
            </Stack>
          ) : (
            <div css={{ padding: 10 }}>
              <ActionButton allowDisabledFocus iconProps={{ iconName: 'FollowUser' }} onClick={switchTenants}>
                {formatMessage('Sign in to your Azure account')}
              </ActionButton>
            </div>
          )}
        </Callout>
      )}

      {showAuthDialog && (
        <AuthDialog
          needGraph={requiresGraph}
          onDismiss={() => {
            setShowAuthDialog(false, false);
          }}
        />
      )}

      {showTenantDialog && (
        <TenantDialog
          onDismiss={() => {
            setShowTenantDialog(false);
          }}
        />
      )}
    </Fragment>
  );
};
