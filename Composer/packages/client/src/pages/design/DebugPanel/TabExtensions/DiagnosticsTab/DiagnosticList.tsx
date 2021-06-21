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
  ConstrainMode,
} from 'office-ui-fabric-react/lib/DetailsList';
import { Sticky, StickyPositionType } from 'office-ui-fabric-react/lib/Sticky';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { FontIcon } from 'office-ui-fabric-react/lib/Icon';
import formatMessage from 'format-message';
import { mergeStyleSets } from 'office-ui-fabric-react/lib/Styling';
import { FontSizes, SharedColors, FluentTheme } from '@uifabric/fluent-theme';
import { css } from '@emotion/core';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { useEffect, useState, useMemo } from 'react';
import { ScrollablePane } from 'office-ui-fabric-react/lib/ScrollablePane';

import {
  botDisplayNameState,
  botProjectSpaceSelector,
  exportSkillModalInfoState,
  localeState,
  rootBotProjectIdSelector,
} from '../../../../../recoilModel';
import { navigateTo } from '../../../../../utils/navigation';

import { IDiagnosticInfo } from './DiagnosticType';

// -------------------- Styles -------------------- //

const maxHeightDetailsList = 32;

const icons = [
  { iconName: 'StatusErrorFull', color: SharedColors.red10 },
  { iconName: 'WarningSolid', color: FluentTheme.palette.yellow },
];

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

const tableCell = css`
  margin-top: 4px;
  outline: none;

  :focus {
    outline: rgb(102, 102, 102) solid 1px;
  }
`;

const blodText = css`
  font-weight: bold !important;
`;

const content = css`
  outline: none;
`;

const textWrapStyle = css`
  white-space: normal;
  width: 400px;
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
  const rootBotId = useRecoilValue(rootBotProjectIdSelector);
  const locale = useRecoilValue(localeState(rootBotId ?? ''));

  const getProjectName = (projectId: string) =>
    botProjectSpace.find((bot) => bot.projectId === projectId)?.name ?? projectId;

  const staticColumns: IColumn[] = [
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
      onColumnClick: (event) => {
        const newColumns = columns.slice();
        newColumns[1].isSorted = true;
        newColumns[1].isSortedDescending = !columns[1].isSortedDescending;
        setColumns(newColumns);
        event.stopPropagation();
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
        let locationPath = item.location;
        if (item.friendlyLocationBreadcrumbItems) {
          locationPath = item.friendlyLocationBreadcrumbItems.join(' > ');
        }
        return (
          <div css={[tableCell, textWrapStyle]}>
            <Link
              css={content}
              underline="true"
              onClick={() => {
                navigateTo(item.getUrl(item.dialogPath));
                if (item.location === 'manifest.json') {
                  setExportSkillModalInfo(item.projectId);
                }
              }}
            >
              {locationPath}
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
              <span css={blodText}>{item.title ?? ''}</span>
              &nbsp;
              <span>{item.message}</span>
              &nbsp;
              <Link
                hidden={!item.learnMore}
                href="https://github.com/microsoft/botframework-components/blob/main/docs/overview.md"
                target="_blank"
              >
                {item.learnMore}
              </Link>
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

  const displayedDiagnosticItems = useMemo(() => {
    const sortFactor = columns[1].isSortedDescending ? 1 : -1;
    const result = diagnosticItems.sort((a, b) => {
      // Error before Warning
      const severityComparator = a.severity - b.severity;
      if (severityComparator === 0) {
        // Sort by name
        return sortFactor * getProjectName(a.projectId).localeCompare(getProjectName(b.projectId), locale);
      }
      return severityComparator;
    });
    return result;
  }, [diagnosticItems, columns]);

  return (
    <ScrollablePane>
      <DetailsList
        isHeaderVisible
        checkboxVisibility={CheckboxVisibility.hidden}
        columns={columns}
        constrainMode={ConstrainMode.unconstrained}
        items={displayedDiagnosticItems}
        layoutMode={DetailsListLayoutMode.justified}
        selectionMode={SelectionMode.single}
        setKey="none"
        styles={{
          root: {
            maxHeight: `calc(100% - ${maxHeightDetailsList}px)`,
          },
        }}
        onRenderDetailsHeader={onRenderDetailsHeader}
      />
    </ScrollablePane>
  );
};
