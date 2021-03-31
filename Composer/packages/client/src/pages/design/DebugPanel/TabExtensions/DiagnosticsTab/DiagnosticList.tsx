// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import {
  DetailsList,
  DetailsListLayoutMode,
  SelectionMode,
  IColumn,
  CheckboxVisibility,
} from 'office-ui-fabric-react/lib/DetailsList';
import { Sticky, StickyPositionType } from 'office-ui-fabric-react/lib/Sticky';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { FontIcon } from 'office-ui-fabric-react/lib/Icon';
import formatMessage from 'format-message';
import { mergeStyleSets } from 'office-ui-fabric-react/lib/Styling';
import { FontSizes, SharedColors } from '@uifabric/fluent-theme';
import { css } from '@emotion/core';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { useEffect, useState } from 'react';

import { IDiagnosticInfo } from '../../../../diagnostics/types';
import { botDisplayNameState, botProjectSpaceSelector, exportSkillModalInfoState } from '../../../../../recoilModel';
import { navigateTo } from '../../../../../utils/navigation';

// -------------------- Styles -------------------- //

const icons = {
  Error: { iconName: 'StatusErrorFull', color: SharedColors.red10 },
  Warning: { iconName: 'WarningSolid', color: SharedColors.yellow10 },
};

const diagnostic = mergeStyleSets({
  typeIconHeaderIcon: {
    padding: 0,
    fontSize: FontSizes.size16,
  },
  typeIconCell: {
    textAlign: 'center',
    cursor: 'pointer',
  },
  columnCell: {
    cursor: 'pointer',
  },
});

const typeIcon = (icon) => css`
  vertical-align: middle;
  font-size: 16px;
  width: 24px;
  height: 24px;
  line-height: 24px;
  color: ${icon.color};
  cursor: pointer;
`;

const detailList = css`
  overflow-x: hidden;
`;

const tableCell = css`
  margin-top: 4px;
  outline: none;
  :focus {
    outline: rgb(102, 102, 102) solid 1px;
  }
`;

const content = css`
  outline: none;
`;

// -------------------- Diagnosticist -------------------- //
export interface IDiagnosticListProps {
  diagnosticItems: IDiagnosticInfo[];
}

function onRenderDetailsHeader(props, defaultRender) {
  return (
    <Sticky isScrollSynced stickyPosition={StickyPositionType.Header}>
      {defaultRender({
        ...props,
        onRenderColumnHeaderTooltip: (tooltipHostProps) => <TooltipHost {...tooltipHostProps} />,
      })}
    </Sticky>
  );
}

const BotNameRender: React.FC<{ item: IDiagnosticInfo }> = ({ item }) => {
  const botName = useRecoilValue(botDisplayNameState(item.projectId));
  return (
    <div data-is-focusable css={tableCell}>
      <div aria-label={formatMessage(`Bot is {botName}`, { botName })} css={content} tabIndex={-1}>
        {botName}
      </div>
    </div>
  );
};

export const DiagnosticList: React.FC<IDiagnosticListProps> = ({ diagnosticItems }) => {
  const setExportSkillModalInfo = useSetRecoilState(exportSkillModalInfoState);
  const botProjectSpace = useRecoilValue(botProjectSpaceSelector);

  const getSkillName = (projectId: string) =>
    botProjectSpace.find((bot) => bot.projectId === projectId)?.name ?? projectId;

  const staticColumns = [
    {
      key: 'Icon',
      name: '',
      className: diagnostic.typeIconCell,
      iconClassName: diagnostic.typeIconHeaderIcon,
      fieldName: 'icon',
      minWidth: 30,
      maxWidth: 30,
      onRender: (item: IDiagnosticInfo) => {
        const icon = icons[item.severity];
        return <FontIcon css={typeIcon(icon)} iconName={icon.iconName} />;
      },
    },
    {
      key: 'DiagnosticResourceId',
      name: formatMessage('Bot'),
      className: diagnostic.columnCell,
      fieldName: 'resourceId',
      minWidth: 70,
      maxWidth: 90,
      isResizable: true,
      data: 'string',
      onRender: (item: IDiagnosticInfo) => <BotNameRender item={item} />,
      isPadded: true,
      isSorted: true,
      isSortedDescending: false,
      onColumnClick: () => {
        const newColumns = columns.slice();
        newColumns[1].isSorted = true;
        newColumns[1].isSortedDescending = !columns[1].isSortedDescending;
        setColumns(newColumns);
      },
    },
    {
      key: 'DiagnosticLocation',
      name: formatMessage('Location'),
      className: diagnostic.columnCell,
      fieldName: 'location',
      minWidth: 150,
      maxWidth: 180,
      isResizable: true,
      data: 'string',
      onRender: (item: IDiagnosticInfo) => {
        return (
          <div css={tableCell}>
            <Link
              css={content}
              underline="true"
              onClick={() => {
                navigateTo(item.getUrl());
                if (item.location === 'manifest.json') {
                  setExportSkillModalInfo(item.projectId);
                }
              }}
            >
              {item.location}
            </Link>
          </div>
        );
      },
      isPadded: true,
    },
    {
      key: 'DiagnosticDetail',
      name: formatMessage('Description'),
      className: diagnostic.columnCell,
      fieldName: 'message',
      minWidth: 70,
      maxWidth: 90,
      isResizable: true,
      isCollapsible: true,
      isMultiline: true,
      data: 'string',
      onRender: (item: IDiagnosticInfo) => {
        return (
          <div data-is-focusable css={tableCell}>
            <div
              aria-label={formatMessage(`Diagnostic Description {msg}`, { msg: item.message })}
              css={content}
              tabIndex={-1}
            >
              {item.message}
            </div>
          </div>
        );
      },
      isPadded: true,
    },
  ];
  const [columns, setColumns] = useState<IColumn[]>(staticColumns);

  useEffect(() => {
    setColumns(staticColumns);
  }, [diagnosticItems]);

  const sortFactor = columns[1].isSortedDescending ? 1 : -1;
  const displayedDiagnosticItems = diagnosticItems.sort((a, b) => {
    const aName = getSkillName(a.projectId);
    const bName = getSkillName(b.projectId);
    if (aName < bName) {
      return sortFactor;
    } else if (aName > bName) {
      return -sortFactor;
    } else {
      return a.location < b.location ? sortFactor : -sortFactor;
    }
  });

  return (
    <DetailsList
      isHeaderVisible
      checkboxVisibility={CheckboxVisibility.hidden}
      columns={columns}
      css={detailList}
      items={displayedDiagnosticItems}
      layoutMode={DetailsListLayoutMode.justified}
      selectionMode={SelectionMode.single}
      setKey="none"
      onRenderDetailsHeader={onRenderDetailsHeader}
    />
  );
};
