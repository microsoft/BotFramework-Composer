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

import { IDiagnosticInfo } from './types';

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
  onItemClick: (item: IDiagnosticInfo) => void;
}

const columns: IColumn[] = [
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
    key: 'DiagnosticType',
    name: formatMessage('Type'),
    className: diagnostic.columnCell,
    fieldName: 'type',
    minWidth: 70,
    maxWidth: 90,
    isRowHeader: true,
    isResizable: true,
    data: 'string',
    onRender: (item: IDiagnosticInfo) => {
      return (
        <div data-is-focusable css={tableCell}>
          <div
            aria-label={formatMessage(`This is a {severity} diagnostic`, { severity: item.severity })}
            css={content}
            tabIndex={-1}
          >
            {item.severity}
          </div>
        </div>
      );
    },
    isPadded: true,
  },
  {
    key: 'DiagnosticLocation',
    name: formatMessage('Location'),
    className: diagnostic.columnCell,
    fieldName: 'location',
    minWidth: 70,
    maxWidth: 90,
    isResizable: true,
    data: 'string',
    onRender: (item: IDiagnosticInfo) => {
      return (
        <div data-is-focusable css={tableCell}>
          <div
            aria-label={formatMessage(`location is {location}`, { location: item.location })}
            css={content}
            tabIndex={-1}
          >
            {item.location}
          </div>
        </div>
      );
    },
    isPadded: true,
  },
  {
    key: 'DiagnosticDetail',
    name: formatMessage('Message'),
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
            aria-label={formatMessage(`Diagnostic Message {msg}`, { msg: item.message })}
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

export const DiagnosticList: React.FC<IDiagnosticListProps> = ({ diagnosticItems, onItemClick }) => {
  return (
    <DetailsList
      isHeaderVisible
      checkboxVisibility={CheckboxVisibility.hidden}
      columns={columns}
      css={detailList}
      items={diagnosticItems}
      layoutMode={DetailsListLayoutMode.justified}
      selectionMode={SelectionMode.single}
      setKey="none"
      onItemInvoked={onItemClick}
      onRenderDetailsHeader={onRenderDetailsHeader}
    />
  );
};
