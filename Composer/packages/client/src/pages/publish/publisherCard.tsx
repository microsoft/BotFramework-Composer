// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useEffect, useContext, Fragment, useState } from 'react';
import { Card } from '@uifabric/react-cards';
import { Text } from 'office-ui-fabric-react/lib/Text';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import formatMessage from 'format-message';

import { StoreContext } from '../../store';

import { IPublisher } from './types';
import {
  buttonStyles,
  idTextStyles,
  nameTextStyles,
  endpointTextStyles,
  detailCardSectionStyles,
  footerCardSectionStyles,
  cardIconStyles,
  cardTokens,
  footerCardSectionTokens,
} from './styles';
import { PublishDialog } from './publishDialog';

export interface IPublisherCardProps {
  publisher: IPublisher;
  onClick: (item: IPublisher) => void;
  onPublish: (id: string, version: string) => void;
}

export const PublisherCard: React.FC<IPublisherCardProps> = props => {
  const { actions } = useContext(StoreContext);
  const [open, setOpen] = useState(false);
  const { getPublisherStatus, getPublisherHistory } = actions;
  const { onClick, publisher, onPublish } = props;
  const { name, id, endpoint, online, history } = publisher;

  useEffect(() => {
    getPublisherStatus(id);
    getPublisherHistory(id);
  }, []);

  const handlePublish = async (version: string) => {
    if (history && history.find(item => item.version === version)) {
      throw formatMessage('History contains duplicate version');
      return;
    }
    await onPublish(id, version);
    setOpen(false);
  };

  return (
    <Fragment>
      <Card horizontal onClick={() => onClick(publisher)} tokens={cardTokens}>
        <Card.Section styles={detailCardSectionStyles}>
          <Text variant="small" styles={idTextStyles}>
            {id}
          </Text>
          <Text styles={nameTextStyles}>{name}</Text>
          <Text variant="small" styles={endpointTextStyles}>
            {endpoint}
          </Text>
          <PrimaryButton
            text="Publish"
            onClick={() => setOpen(true)}
            styles={buttonStyles}
            disabled={!publisher.online}
          />
        </Card.Section>
        <Card.Section styles={footerCardSectionStyles} tokens={footerCardSectionTokens}>
          <Text styles={endpointTextStyles}>{online ? formatMessage('online') : formatMessage('offline')}</Text>
          <Icon iconName="CircleFill" css={cardIconStyles(online)} />
        </Card.Section>
      </Card>
      <PublishDialog onSubmit={handlePublish} onDismiss={() => setOpen(false)} isOpen={open} name={name} />
    </Fragment>
  );
};
