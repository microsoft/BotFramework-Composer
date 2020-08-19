// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useMemo } from 'react';
import { DialogInfo, ITrigger, SDKKinds } from '@bfc/shared';
import { Selection } from 'office-ui-fabric-react/lib/DetailsList';
import { useRecoilValue } from 'recoil';
import formatMessage from 'format-message';

import { ContentProps } from '../constants';
import { dialogsState, schemasState } from '../../../../recoilModel';
import { getFriendlyName } from '../../../../utils/dialogUtil';
import { isSupportedTrigger } from '../generateSkillManifest';

import { SelectItems } from './SelectItems';

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

  return <SelectItems items={items} selection={selection} tableColumns={tableColumns} />;
};
