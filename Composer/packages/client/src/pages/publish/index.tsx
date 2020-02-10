// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { RouteComponentProps } from '@reach/router';
import { useEffect, useContext, useState } from 'react';

import { ToolBar } from '../../components/ToolBar';
import { TestController } from '../../TestController';
import { StoreContext } from '../../store';

import { root } from './styles';
import { PublisherHeader } from './publisherHeader';
import { PublisherList } from './publisherList';
import { IPublisher } from './types';

const PublisherPage: React.FC<RouteComponentProps> = () => {
  const { state, actions } = useContext(StoreContext);
  const [selected, setSelected] = useState<IPublisher | undefined>(undefined);
  const { getPublishers, publishBot, getPublisherHistory, rollbackBot } = actions;
  const { publishers, runingBot } = state;

  useEffect(() => {
    if (publishers.length === 0) {
      getPublishers();
    }
  }, []);

  useEffect(() => {
    if (selected) {
      const current = publishers.find(item => item.id === selected.id);
      setSelected(current);
    } else {
      if (publishers.length !== 0) {
        setSelected(publishers[0]);
      }
    }
  }, [publishers]);

  const handlePublish = async (id: string, version: string) => {
    await publishBot(id, version);
    await getPublisherHistory(id);
  };

  const handleRollback = async (id: string, version: string) => {
    await rollbackBot(id, version);
    await getPublisherHistory(id);
  };

  const toolbarItems = [
    {
      type: 'element',
      element: <TestController />,
      align: 'right',
    },
  ];

  return (
    <div css={root} data-testid="notifications-page">
      <ToolBar toolbarItems={toolbarItems} />
      <PublisherHeader />
      <PublisherList
        items={publishers}
        activeItem={selected}
        runingBot={runingBot}
        onItemClick={setSelected}
        onPublish={handlePublish}
        onRollback={handleRollback}
      />
    </div>
  );
};

export default PublisherPage;
