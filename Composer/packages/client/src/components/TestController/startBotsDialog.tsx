// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React, { useEffect, useState } from 'react';
import { Dialog, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import { FontWeights } from 'office-ui-fabric-react/lib/Styling';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { DefaultButton, ActionButton, IButtonStyles } from 'office-ui-fabric-react/lib/Button';
import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
import formatMessage from 'format-message';
import {
  DetailsList,
  DetailsListLayoutMode,
  IDetailsRowProps,
  SelectionMode,
} from 'office-ui-fabric-react/lib/DetailsList';
import { useRecoilValue } from 'recoil';
import { IRenderFunction } from 'office-ui-fabric-react/lib/Utilities';
import { SharedColors, FontSizes } from '@uifabric/fluent-theme';

import { botProjectSpaceSelector } from '../../recoilModel';

const styles = {
  detailListContainer: css`
    flex-grow: 1;
    height: 350px;
    position: relative;
    overflow: hidden;
  `,
};

export const actionButton = css`
  font-size: 14px;
  margin-top: 2px;
  color: #0078d4;
`;

const dialog = {
  title: {
    fontWeight: FontWeights.bold,
  },
};

const rowHeader = { display: 'flex', alignItems: 'center' };
const statusStyle = {
  color: SharedColors.green20,
};

const icon = () =>
  ({
    root: {
      color: `${SharedColors.cyanBlue20}`,
      marginRight: '12px',
      boxSizing: 'border-box',
      fontSize: `${FontSizes.size16}`,
      width: '20px',
    },
  } as IButtonStyles);

// eslint-disable-next-line react/display-name

interface IStartBotsDialogProps {
  isOpen: boolean;
  onDismiss: () => void;
}

export const StartBotsDialog: React.FC<IStartBotsDialogProps> = (props) => {
  const { isOpen, onDismiss } = props;
  const projectCollection = useRecoilValue(botProjectSpaceSelector);

  const [items, setItems] = useState<{ displayName: string; status: string }[]>([]);
  const [allBotsStarted, setAllBotsStarted] = useState<boolean>(false);

  useEffect(() => {
    const transformedItems: any[] = projectCollection.map((projectData) => {
      return {
        displayName: projectData.name,
        status: 'Running',
      };
    });
    setItems(transformedItems);
  }, [projectCollection]);

  const onRenderRow = (props?: IDetailsRowProps, defaultRender?: IRenderFunction<IDetailsRowProps>): JSX.Element => {
    return <div>{defaultRender && defaultRender(props)}</div>;
  };

  const tableColumns = [
    {
      key: 'column1',
      name: formatMessage('Bot'),
      fieldName: 'id',
      isRowHeader: true,
      isResizable: true,
      isSortedDescending: false,
      sortAscendingAriaLabel: formatMessage('Sorted A to Z'),
      sortDescendingAriaLabel: formatMessage('Sorted Z to A'),
      data: 'string',
      onRender: (item: any) => {
        return (
          <div style={rowHeader}>
            <Icon iconName={item.status === 'Running' ? 'CircleStopSolid' : 'Play'} styles={icon()} />
            <span aria-label={item.displayName}>{item.displayName}</span>
          </div>
        );
      },
      isPadded: true,
    },
    {
      key: 'column2',
      name: formatMessage('Status'),
      fieldName: 'type',
      isRowHeader: true,
      isResizable: true,
      isSorted: true,
      data: 'string',
      onRender: (item: any) => {
        return (
          <span aria-label={item.status} style={statusStyle}>
            {item.status}
          </span>
        );
      },
      isPadded: true,
    },
  ];

  return (
    <Dialog
      dialogContentProps={{
        type: DialogType.normal,
        title: formatMessage('Local bot runtime manager'),
        styles: dialog,
      }}
      hidden={!isOpen}
      maxWidth={700}
      minWidth={700}
      modalProps={{
        isBlocking: false,
        isModeless: true,
      }}
      onDismiss={onDismiss}
    >
      <div css={styles.detailListContainer}>
        <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
          <ActionButton css={actionButton}>
            {allBotsStarted ? <Icon iconName={allBotsStarted ? 'CircleStopSolid' : ''} styles={icon()} /> : null}
            {allBotsStarted ? <span> Stop all Bots </span> : <span>Start all bots</span>}
          </ActionButton>

          <DetailsList
            columns={tableColumns}
            compact={false}
            getKey={(item) => item.id}
            items={items}
            layoutMode={DetailsListLayoutMode.justified}
            selectionMode={SelectionMode.none}
            onRenderRow={onRenderRow}
          />
        </ScrollablePane>
      </div>
      <DialogFooter>
        <DefaultButton data-testid={'start-bots-dialog'} text={formatMessage('Close')} onClick={onDismiss} />
      </DialogFooter>
    </Dialog>
  );
};
