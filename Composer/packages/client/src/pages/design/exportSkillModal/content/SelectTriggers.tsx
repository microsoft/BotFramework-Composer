// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import React, { useMemo } from 'react';
import {
  CheckboxVisibility,
  DetailsList,
  DetailsListLayoutMode,
  IDetailsRowProps,
  SelectionMode,
} from 'office-ui-fabric-react/lib/DetailsList';
import { DialogInfo, ITrigger, SDKKinds } from '@bfc/shared';
import { IRenderFunction } from 'office-ui-fabric-react/lib/Utilities';
import { Selection } from 'office-ui-fabric-react/lib/DetailsList';
import { Sticky, StickyPositionType } from 'office-ui-fabric-react/lib/Sticky';
import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { useRecoilValue } from 'recoil';
import formatMessage from 'format-message';

import { ContentProps } from '../constants';
import { dialogsState, schemasState } from '../../../../recoilModel';
import { getFriendlyName } from '../../../../utils/dialogUtil';
import { isSupportedTrigger } from '../generateSkillManifest';

const styles = {
  detailListContainer: css`
    flex-grow: 1;
    height: 350px;
    position: relative;
    padding-top: 10px;
    overflow: hidden;
  `,
};

const getLabel = (kind: SDKKinds, uiSchema) => {
  const { label } = uiSchema?.[kind]?.form || {};
  return label || kind.replace('Microsoft.', '');
};

export const SelectTriggers: React.FC<ContentProps> = ({ setSelectedTriggers }) => {
  const dialogs = useRecoilValue(dialogsState);
  const schemas = useRecoilValue(schemasState);

  const items = useMemo(() => {
    const { triggers = [] } = dialogs.find(({ isRoot }) => isRoot) || ({} as DialogInfo);

    return triggers
      .filter(isSupportedTrigger)
      .sort((a, b) =>
        a.type === b.type
          ? a.displayName.toLowerCase() > b.displayName.toLowerCase()
            ? 1
            : -1
          : a.type > b.type
          ? 1
          : -1
      );
  }, [dialogs]);

  // for detail file list in open panel
  const tableColumns = [
    {
      key: 'column1',
      name: formatMessage('Name'),
      fieldName: 'id',
      minWidth: 300,
      maxWidth: 350,
      isRowHeader: true,
      isResizable: true,
      isSortedDescending: false,
      sortAscendingAriaLabel: formatMessage('Sorted A to Z'),
      sortDescendingAriaLabel: formatMessage('Sorted Z to A'),
      data: 'string',
      onRender: (item: ITrigger) => {
        return <span aria-label={item.displayName}>{item.displayName || getFriendlyName({ $kind: item.type })}</span>;
      },
      isPadded: true,
    },
    {
      key: 'column2',
      name: formatMessage('Type'),
      fieldName: 'type',
      minWidth: 300,
      maxWidth: 350,
      isRowHeader: true,
      isResizable: true,
      isSorted: true,
      isSortedDescending: false,
      sortAscendingAriaLabel: formatMessage('Sorted A to Z'),
      sortDescendingAriaLabel: formatMessage('Sorted Z to A'),
      data: 'string',
      onRender: (item: ITrigger) => {
        const label = getLabel(item.type as SDKKinds, schemas.ui?.content || {});
        return <span aria-label={label}>{label}</span>;
      },
      isPadded: true,
    },
  ];

  const selection = useMemo(
    () =>
      new Selection({
        onSelectionChanged: () => {
          const selectedItems = selection.getSelection();
          setSelectedTriggers(selectedItems);
        },
      }),
    []
  );

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

  const onRenderRow = (props?: IDetailsRowProps, defaultRender?: IRenderFunction<IDetailsRowProps>): JSX.Element => {
    return <div data-selection-toggle="true">{defaultRender && defaultRender(props)}</div>;
  };

  return (
    <div css={styles.detailListContainer}>
      <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
        <DetailsList
          isHeaderVisible
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
  );
};
