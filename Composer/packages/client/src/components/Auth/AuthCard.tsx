// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import formatMessage from 'format-message';
import { Fragment, useRef, useEffect, useState } from 'react';
import { HoverCard, IHoverCard, IPlainCardProps, HoverCardType } from 'office-ui-fabric-react/lib/HoverCard';
import { Persona, PersonaSize, IPersonaProps } from 'office-ui-fabric-react/lib/Persona';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { useRecoilValue } from 'recoil';

import { primaryTokenState, dispatcherState } from '../../recoilModel/atoms';
import { isTokenExpired, decodeToken, setTenantId } from '../../utils/auth';

const onCardHide = (): void => {
  console.log('I am now hidden');
};

const authCardStyles = {
  width: 200,
  height: 200,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export const AuthCard: React.FC = () => {
  const hoverCard = useRef<IHoverCard>(null);
  const token = useRecoilValue(primaryTokenState);
  const { refreshLoginStatus, requireUserLogin } = useRecoilValue(dispatcherState);
  const [currentUser, setCurrentUser] = useState<any>(undefined);

  // const instantDismissCard = (): void => {
  //   if (hoverCard.current) {
  //     hoverCard.current.dismiss();
  //   }
  // };

  useEffect(() => {
    refreshLoginStatus();
  }, []);

  useEffect(() => {
    try {
      if (!isTokenExpired(token)) {
        const profile = decodeToken(token);
        console.log('decoded profile', profile);
        setCurrentUser({
          email: profile.upn,
          name: profile.name,
        });
      }
    } catch (err) {
      alert(err);
    }
  }, [token]);

  const switchTenants = () => {
    setTenantId('');
    requireUserLogin();
  };

  const onRenderSecondaryText = (props: IPersonaProps): JSX.Element => {
    return (
      <div>
        <div>{props.secondaryText}</div>
        <div>
          <Link href={'https://myaccount.microsoft.com/'} target={'_blank'}>
            {props.tertiaryText}
          </Link>
        </div>
        <div>
          <Link onClick={switchTenants}>{formatMessage('Switch directory')}</Link>
        </div>
      </div>
    );
  };

  const onRenderPlainCard = (): JSX.Element => {
    return (
      <div css={authCardStyles}>
        Sign out
        <Persona
          secondaryText={currentUser?.email}
          size={PersonaSize.size48}
          tertiaryText={formatMessage('View account on Azure')}
          text={currentUser?.name}
          onRenderSecondaryText={onRenderSecondaryText}
        />
      </div>
    );
  };
  const plainCardProps: IPlainCardProps = {
    onRenderPlainCard: onRenderPlainCard,
  };
  return (
    <Fragment>
      <HoverCard
        cardDismissDelay={2000}
        componentRef={hoverCard}
        plainCardProps={plainCardProps}
        type={HoverCardType.plain}
        onCardHide={onCardHide}
      >
        <Persona
          hidePersonaDetails
          secondaryText={formatMessage('Sign out')}
          size={PersonaSize.size32}
          text={currentUser?.name}
        />
      </HoverCard>
    </Fragment>
  );
};
