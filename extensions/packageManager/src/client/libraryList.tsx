// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import formatMessage from 'format-message';
import {
  DetailsList,
  DetailsListLayoutMode,
  SelectionMode,
  CheckboxVisibility,
  Selection,
  FontIcon,
} from 'office-ui-fabric-react';
import React, { useState, useEffect, useMemo, Fragment } from 'react';

import { listRoot, tableView, detailList } from './styles';

export interface LibraryRef {
  name: string;
  version: string;
  authors?: string[];
  releaseNotes?: string;
  keywords?: string[];
  license?: string;
  repository?: string;
  copyright?: string;
  icon?: string;
  description: string;
  type?: string;
  category?: string;
  language: string;
  source?: string;
  isCompatible?: boolean;
}

export interface ILibraryListProps {
  disabled: boolean;
  items: LibraryRef[];
  redownload: (evt: any) => void;
  install: (evt: any) => void;
  isInstalled: (item: LibraryRef) => boolean;
  removeLibrary: (evt: any) => void;
  onItemClick: (item: LibraryRef | null) => void;
  updateItems: (items: LibraryRef[]) => void;
}

interface ILetterIconProps {
  letter: string;
}

const LetterIcon: React.FC<ILetterIconProps> = (props) => {
  return <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: '45px', height: '45px', color: '#FFF', backgroundColor: 'rgb(0, 120, 212)', fontSize: '30px'}}>
    <span>{ props.letter }</span>
  </div>
}

export const LibraryList: React.FC<ILibraryListProps> = (props) => {
  const { items, disabled } = props;
  const [selectIndex, setSelectedIndex] = useState<number>();

  const columns = [
    {
      key: 'icon',
      name: 'Icon',
      fieldName: 'icon',
      minWidth: 50,
      maxWidth: 50,
      isResizable: false,
      data: 'string',
      onRender: (item: LibraryRef) => {
        return <Fragment>
          {item.icon ? (
            <img src={item.icon} width="50" height="50" alt="icon" />
          ): (
            <LetterIcon letter={item.name[0]} />
          )}
        </Fragment>;
      },
      isPadded: true,
    },
    {
      key: 'ItemName',
      name: 'Name',
      fieldName: 'name',
      minWidth: 300,
      maxWidth: 800,
      isResizable: true,
      data: 'string',
      onRender: (item: LibraryRef) => {
        return <Fragment>
          <span style={{display: 'block', fontWeight: 'bold'}}>{item.name}</span>
          <span>{item.description}</span>
          </Fragment>;
      },
      isPadded: true,
    },
    {
      key: 'actions',
      name: '',
      minWidth: 90,
      maxWidth: 60,
      isResizable: false,
      data: 'string',
      onRender: (item: LibraryRef) => {
        return (
          <Fragment>
            {props.isInstalled(item) && (
              <span  style={{color: '#219653'}}>
                <FontIcon iconName={'CheckMark'} style={{color: '#219653', fontSize: '1rem', position: 'relative', top: '3px'}}/> Installed
              </span>
            )}
          </Fragment>
        );
      },
      isPadded: true,
    },
  ];

  const selection = useMemo(() => {
    return new Selection({
      onSelectionChanged: () => {
        const selectedIndexes = selection.getSelectedIndices();
        if (selectedIndexes.length > 0) {
          setSelectedIndex(selectedIndexes[0]);
        }
      },
    });
  }, [items]);

  useEffect(() => {
    if (items && typeof selectIndex === 'number' && items.length > selectIndex) {
      props.onItemClick(items[selectIndex]);
    } else {
      props.onItemClick(null);
    }
  }, [selectIndex, items]);

  return (
    <div css={listRoot}>
      <div css={tableView}>
        <DetailsList
          isHeaderVisible={false}
          checkboxVisibility={CheckboxVisibility.hidden}
          columns={columns}
          css={detailList}
          getKey={(item) => item.id}
          items={items}
          layoutMode={DetailsListLayoutMode.justified}
          selection={selection}
          selectionMode={SelectionMode.single}
          setKey="none"
        />
      </div>
    </div>
  );
};
