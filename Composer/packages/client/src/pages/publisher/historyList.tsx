// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import {
  DetailsList,
  DetailsListLayoutMode,
  IColumn,
  CheckboxVisibility,
} from 'office-ui-fabric-react/lib/DetailsList';
import { Sticky, StickyPositionType } from 'office-ui-fabric-react/lib/Sticky';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
import { FontIcon } from 'office-ui-fabric-react/lib/Icon';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { useMemo, useState } from 'react';

import { Pagination } from '../../components/Pagination';

import { IPublisher, IHistory } from './types';
import { historyListStyles, iconStyles, typeIcon } from './styles';
import { RollbackDialog } from './rollbackDialog';
import { IRunningBot } from './../../store/types';

export interface IHistoryListProps {
  publisher: IPublisher;
  runingBot: IRunningBot | null;
  onRollback: (id: string, version: string) => void;
}

const itemCount = 10;

function onRenderDetailsHeader(props, defaultRender) {
  return (
    <Sticky stickyPosition={StickyPositionType.Header} isScrollSynced={true}>
      {defaultRender({
        ...props,
        onRenderColumnHeaderTooltip: tooltipHostProps => <TooltipHost {...tooltipHostProps} />,
      })}
    </Sticky>
  );
}

export const HistoryList: React.FC<IHistoryListProps> = props => {
  const [pageIndex, setPageIndex] = useState<number>(1);
  const { publisher, onRollback, runingBot } = props;
  const [open, setOpen] = useState(false);
  const [version, setVersion] = useState();
  const history = publisher.history || [];

  const pageCount: number = useMemo(() => {
    return Math.ceil(history.length / itemCount) || 1;
  }, [history]);

  const showItems = history.slice((pageIndex - 1) * itemCount, pageIndex * itemCount);

  const onRollbackClick = (version: string) => {
    setVersion(version);
    setOpen(true);
  };

  const handleRollback = async () => {
    await onRollback(publisher.id, version);
    setOpen(false);
  };

  const columns: IColumn[] = [
    {
      key: 'Icon',
      name: 'Status',
      className: iconStyles.typeIconCell,
      iconClassName: iconStyles.typeIconHeaderIcon,
      fieldName: 'icon',
      minWidth: 30,
      maxWidth: 70,
      data: 'string',
      onRender: (item: IHistory) => {
        return <FontIcon iconName={'CircleFill'} css={typeIcon(item.version === runingBot?.version)} />;
      },
    },
    {
      key: 'Bot Id',
      name: 'Bot Id',
      fieldName: 'botId',
      minWidth: 70,
      maxWidth: 90,
      isRowHeader: true,
      isResizable: true,
      data: 'string',
      onRender: (item: IHistory) => {
        return <span>{item.botID}</span>;
      },
      isPadded: true,
    },
    {
      key: 'Version',
      name: 'Version',
      fieldName: 'version',
      minWidth: 70,
      maxWidth: 90,
      isResizable: true,
      data: 'string',
      onRender: (item: IHistory) => {
        return <span>{item.version}</span>;
      },
      isPadded: true,
    },
    {
      key: 'Last Update Time',
      name: 'Last Update Time',
      fieldName: 'lastUpdateTime',
      minWidth: 70,
      maxWidth: 120,
      isResizable: true,
      isCollapsible: true,
      isMultiline: true,
      data: 'string',
      onRender: (item: IHistory) => {
        return <span>{item.lastUpdateTime}</span>;
      },
      isPadded: true,
    },
    {
      key: 'Message',
      name: 'Message',
      fieldName: 'message',
      minWidth: 50,
      maxWidth: 200,
      isResizable: true,
      isCollapsible: true,
      isMultiline: true,
      data: 'string',
      onRender: (item: IHistory) => {
        return <span>{item.version === runingBot?.version ? runingBot.message : 'null'}</span>;
      },
      isPadded: true,
    },
    {
      key: 'Action',
      name: 'Action',
      fieldName: 'action',
      minWidth: 70,
      maxWidth: 90,
      isResizable: true,
      isCollapsible: true,
      isMultiline: true,
      data: 'string',
      onRender: (item: IHistory) => {
        return (
          <ActionButton
            iconProps={{ iconName: 'History' }}
            css={historyListStyles.action}
            onClick={() => onRollbackClick(item.version)}
            disabled={!publisher.online}
          >
            Rollback
          </ActionButton>
        );
      },
      isPadded: true,
    },
  ];

  return (
    <div css={historyListStyles.listRoot} data-testid="notifications-table-view">
      <div css={historyListStyles.tableView}>
        <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
          <DetailsList
            css={historyListStyles.detailList}
            items={showItems}
            columns={columns}
            setKey="none"
            layoutMode={DetailsListLayoutMode.justified}
            isHeaderVisible={true}
            checkboxVisibility={CheckboxVisibility.hidden}
            onRenderDetailsHeader={onRenderDetailsHeader}
          />
        </ScrollablePane>
      </div>
      <Pagination pageCount={pageCount} onChange={setPageIndex} />
      <RollbackDialog onSubmit={handleRollback} onDismiss={() => setOpen(false)} isOpen={open} version={version} />
    </div>
  );
};
