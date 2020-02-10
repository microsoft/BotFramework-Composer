// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';

import { publisherList, sectionStackTokens } from './styles';
import { IPublisher } from './types';
import { PublisherCard } from './publisherCard';
import { HistoryList } from './historyList';
import { IRunningBot } from './../../store/types';

export interface IPublisherListProps {
  items: IPublisher[];
  activeItem?: IPublisher;
  runingBot: IRunningBot | null;
  onItemClick: (item: IPublisher) => void;
  onPublish: (id: string, version: string) => void;
  onRollback: (id: string, version: string) => void;
}

export const PublisherList: React.FC<IPublisherListProps> = props => {
  const { items, onItemClick, onPublish, activeItem, onRollback, runingBot } = props;
  return (
    <div css={publisherList.containter}>
      <div css={publisherList.list}>
        <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
          <Stack tokens={sectionStackTokens}>
            {items.map(item => (
              <PublisherCard key={item.id} publisher={item} onClick={item => onItemClick(item)} onPublish={onPublish} />
            ))}
          </Stack>
        </ScrollablePane>
      </div>
      {activeItem && <HistoryList publisher={activeItem} onRollback={onRollback} runingBot={runingBot} />}
    </div>
  );
};
