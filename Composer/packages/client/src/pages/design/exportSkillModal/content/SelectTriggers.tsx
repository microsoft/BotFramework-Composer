// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useEffect, useMemo, useRef } from 'react';
import { DialogInfo, ITrigger, getFriendlyName } from '@bfc/shared';
import { Selection } from 'office-ui-fabric-react/lib/DetailsList';
import { useRecoilValue } from 'recoil';
import formatMessage from 'format-message';

import { ContentProps } from '../constants';
import { isSupportedTrigger } from '../generateSkillManifest';
import { dialogsSelectorFamily } from '../../../../recoilModel';

import { SelectItems } from './SelectItems';

export const SelectTriggers: React.FC<ContentProps> = ({ selectedTriggers, setSelectedTriggers, projectId }) => {
  const dialogs = useRecoilValue(dialogsSelectorFamily(projectId));

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
      name: formatMessage('Trigger name'),
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
  ];

  const selectionRef = useRef(
    new Selection({
      getKey: (item) => item.id,
      onSelectionChanged: () => {
        const selectedItems = selectionRef.current.getSelection();
        setSelectedTriggers(selectedItems);
      },
    })
  );

  useEffect(() => {
    for (const item of selectedTriggers) {
      selectionRef.current.setKeySelected(selectionRef.current.getKey(item), true, false);
    }
  }, []);

  return <SelectItems items={items} selection={selectionRef.current} tableColumns={tableColumns} />;
};
