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
import { IRenderFunction, ISelection, IObjectWithKey } from 'office-ui-fabric-react/lib/Utilities';
import { Sticky, StickyPositionType } from 'office-ui-fabric-react/lib/Sticky';
import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';

const styles = {
  detailListContainer: css`
    flex-grow: 1;
    height: 310px;
    position: relative;
    overflow: hidden;
  `,
};

interface SelectItemsProps {
  items: any[];
  selection: ISelection<IObjectWithKey>;
  tableColumns: IColumn[];
}

const onRenderDetailsHeader = (props, defaultRender) => {
  return (
    <Sticky isScrollSynced stickyPosition={StickyPositionType.Header}>
      {defaultRender({
        ...props,
        selectAllVisibility: SelectAllVisibility.visible,
        onRenderColumnHeaderTooltip: (tooltipHostProps) => <TooltipHost {...tooltipHostProps} />,
      })}
    </Sticky>
  );
};

const onRenderRow = (props?: IDetailsRowProps, defaultRender?: IRenderFunction<IDetailsRowProps>): JSX.Element => {
  return <div data-selection-toggle>{defaultRender?.(props)}</div>;
};

export const SelectItems: React.FC<SelectItemsProps> = ({ items, selection, tableColumns }) => {
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
    </React.Fragment>
  );
};
