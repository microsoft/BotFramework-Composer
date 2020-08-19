// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import React from 'react';
import {
  CheckboxVisibility,
  DetailsList,
  DetailsListLayoutMode,
  IDetailsRowProps,
  SelectionMode,
  IColumn,
  SelectAllVisibility,
} from 'office-ui-fabric-react/lib/DetailsList';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { IRenderFunction, ISelection, IObjectWithKey } from 'office-ui-fabric-react/lib/Utilities';
import { Sticky, StickyPositionType } from 'office-ui-fabric-react/lib/Sticky';
import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import formatMessage from 'format-message';

const styles = {
  detailListContainer: css`
    flex-grow: 1;
    height: 350px;
    position: relative;
    overflow: hidden;
  `,
};

interface SelectItemsProps {
  items: any[];
  selection: ISelection<IObjectWithKey>;
  tableColumns: IColumn[];
}

export const SelectItems: React.FC<SelectItemsProps> = ({ items, selection, tableColumns }) => {
  const onRenderDetailsHeader = (props, defaultRender) => {
    return (
      <Sticky isScrollSynced stickyPosition={StickyPositionType.Header}>
        {defaultRender({
          ...props,
          selectAllVisibility: SelectAllVisibility.hidden,
          onRenderColumnHeaderTooltip: (tooltipHostProps) => <TooltipHost {...tooltipHostProps} />,
        })}
      </Sticky>
    );
  };

  const onRenderRow = (props?: IDetailsRowProps, defaultRender?: IRenderFunction<IDetailsRowProps>): JSX.Element => {
    return <div data-selection-toggle>{defaultRender && defaultRender(props)}</div>;
  };

  const handleToggleSelectAll = () => {
    selection.setAllSelected(!selection.isAllSelected());
  };

  return (
    <React.Fragment>
      <div css={styles.detailListContainer}>
        <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
          <DetailsList
            checkboxVisibility={CheckboxVisibility.always}
            columns={tableColumns}
            compact={false}
            getKey={(item) => item.id}
            items={items}
            layoutMode={DetailsListLayoutMode.justified}
            selection={selection}
            selectionMode={SelectionMode.multiple}
            onRenderDetailsHeader={onRenderDetailsHeader}
            onRenderRow={onRenderRow}
          />
        </ScrollablePane>
      </div>
      <Checkbox
        checked={selection.isAllSelected()}
        label={formatMessage('Select all')}
        styles={{ root: { marginTop: '10px' } }}
        onChange={handleToggleSelectAll}
      />
    </React.Fragment>
  );
};
