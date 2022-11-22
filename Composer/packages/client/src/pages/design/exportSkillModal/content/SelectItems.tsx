// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import React from 'react';
import {
  CheckboxVisibility,
  DetailsList,
  DetailsListLayoutMode,
  IDetailsRowProps,
  SelectionMode,
  IColumn,
  SelectAllVisibility,
} from '@fluentui/react/lib/DetailsList';
import { IRenderFunction, ISelection, IObjectWithKey } from '@fluentui/react/lib/Utilities';
import { Sticky, StickyPositionType } from '@fluentui/react/lib/Sticky';
import { ScrollablePane, ScrollbarVisibility } from '@fluentui/react/lib/ScrollablePane';
import { TooltipHost } from '@fluentui/react/lib/Tooltip';

const styles = {
  detailListContainer: css`
    flex-grow: 1;
    min-height: 140px;
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
