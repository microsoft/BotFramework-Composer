// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import path from 'path';

import { jsx } from '@emotion/core';
import { useMemo, useState } from 'react';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { Sticky, StickyPositionType } from 'office-ui-fabric-react/lib/Sticky';
import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
import {
  DetailsList,
  DetailsListLayoutMode,
  SelectionMode,
  CheckboxVisibility,
} from 'office-ui-fabric-react/lib/DetailsList';
import formatMessage from 'format-message';
import { Fragment } from 'react';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { Stack, StackItem } from 'office-ui-fabric-react/lib/Stack';
import moment from 'moment';

import { FileTypes } from '../../../constants/index';
import { StorageFolder, File } from '../../../store/types';
import { getFileIconName, calculateTimeDiff } from '../../../utils';

import { dropdown, detailListContainer, detailListClass, tableCell, content, halfstack, stackinput } from './styles';

interface FileSelectorProps {
  operationMode: {
    read: boolean;
    write: boolean;
  };
  focusedStorageFolder: StorageFolder;
  isWindows: boolean;
  onCurrentPathUpdate: (newPath?: string, storageId?: string) => void;
  onFileChosen: (file: any) => void;
  checkShowItem: (file: File) => boolean;
}

type SortState = {
  key: string;
  descending: boolean;
};

const renderIcon = (file: File) => {
  const iconName = getFileIconName(file);
  if (iconName === FileTypes.FOLDER) {
    return <Icon iconName="OpenFolderHorizontal" style={{ fontSize: '16px' }} />;
  } else if (iconName === FileTypes.BOT) {
    return <Icon iconName="Robot" style={{ fontSize: '16px' }} />;
  } else if (iconName === FileTypes.UNKNOWN) {
    return <Icon iconName="Page" style={{ fontSize: '16px' }} />;
  }
  // fallback for other possible file types
  const url = `https://static2.sharepointonline.com/files/fabric/assets/brand-icons/document/svg/${iconName}_16x1.svg`;
  return <img alt={`${iconName} file icon`} className={detailListClass.fileIconImg} src={url} />;
};

const renderNameColumn = (onFileChosen: (file: File) => void) => (file: File) => {
  const iconName = getFileIconName(file);
  return (
    <div data-is-focusable css={tableCell}>
      <Link
        aria-label={
          file.name === '..'
            ? formatMessage('previous folder')
            : formatMessage('{icon} name is {file}', {
                icon: iconName,
                file: file.name,
              })
        }
        onClick={() => onFileChosen(file)}
      >
        {file.name}
      </Link>
    </div>
  );
};

export const FileSelector: React.FC<FileSelectorProps> = (props) => {
  const {
    onFileChosen,
    focusedStorageFolder,
    checkShowItem,
    onCurrentPathUpdate,
    operationMode,
    isWindows = false,
  } = props;
  // for detail file list in open panel
  const currentPath = path.join(focusedStorageFolder.parent, focusedStorageFolder.name);

  const tableColumns = [
    {
      key: 'type',
      name: formatMessage('File Type'),
      className: detailListClass.fileIconCell,
      iconClassName: detailListClass.fileIconHeaderIcon,
      ariaLabel: formatMessage('Click to sort by file type'),
      iconName: 'Page',
      isIconOnly: true,
      fieldName: 'name',
      minWidth: 16,
      maxWidth: 16,
      onRender: renderIcon,
    },
    {
      key: 'name',
      name: formatMessage('Name'),
      fieldName: 'name',
      minWidth: 150,
      maxWidth: 200,
      isRowHeader: true,
      isResizable: true,
      sortAscendingAriaLabel: formatMessage('Sorted A to Z'),
      sortDescendingAriaLabel: formatMessage('Sorted Z to A'),
      data: 'string',
      onRender: renderNameColumn(onFileChosen),
      isPadded: true,
    },
    {
      key: 'lastModified',
      name: formatMessage('Date Modified'),
      fieldName: 'dateModifiedValue',
      minWidth: 60,
      maxWidth: 70,
      isResizable: true,
      data: 'number',
      onRender: (item: File) => {
        return (
          <div data-is-focusable css={tableCell}>
            <div
              aria-label={formatMessage(`Last modified time is {time}`, { time: calculateTimeDiff(item.lastModified) })}
              css={content}
              tabIndex={-1}
            >
              {calculateTimeDiff(item.lastModified)}
            </div>
          </div>
        );
      },
      isPadded: true,
    },
  ];

  const [currentSort, setSort] = useState<SortState>({ key: tableColumns[0].key, descending: true });

  const diskRootPattern = /[a-zA-Z]:\/$/;
  const storageFiles = useMemo(() => {
    if (!focusedStorageFolder.children) return [];
    const files = focusedStorageFolder.children.reduce((result, file) => {
      const check = typeof checkShowItem === 'function' ? checkShowItem : () => true;
      if (check(file)) {
        if (isWindows) {
          const newName = file.name.replace(/\//g, '\\');
          const newfile: File = { ...file, name: newName };
          result.push(newfile);
        } else {
          result.push(file);
        }
      }
      result.sort((f1, f2) => {
        // NOTE: bringing in Moment for this is not very efficient, but will
        // work for now until we can read file modification dates in as
        // numeric timestamps instead of preformatted strings
        const { key } = currentSort;
        const v1 = key === 'lastModified' ? moment(f1[key]) : f1[key];
        const v2 = key === 'lastModified' ? moment(f2[key]) : f2[key];
        if (v1 < v2) return currentSort.descending ? 1 : -1;
        if (v1 > v2) return currentSort.descending ? -1 : 1;
        return 0;
      });
      return result;
    }, [] as File[]);
    // add parent folder
    files.unshift({
      name: '..',
      type: 'folder',
      path: diskRootPattern.test(currentPath) || currentPath === '/' ? '/' : focusedStorageFolder.parent,
    });
    return files;
  }, [focusedStorageFolder, currentSort.key, currentSort.descending]);

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

  function getNavItemPath(array: string[], separator: string, end: number) {
    return array.slice(0, end + 1).join(separator);
  }

  const separator = path.sep;
  const pathItems = currentPath.split(separator).filter((p) => p !== '');
  const breadcrumbItems = pathItems.map((item, index) => {
    let itemPath = getNavItemPath(pathItems, separator, index);
    // put a leading / back on the path if it started as a unix style path
    itemPath = currentPath.startsWith('/') ? `/${itemPath}` : itemPath;
    // add a trailing / if the last path is something like c:
    itemPath = itemPath[itemPath.length - 1] === ':' ? `${itemPath}/` : itemPath;
    const displayText = isWindows ? itemPath.replace(/\//g, '\\') : itemPath;
    return {
      text: displayText, // displayed text
      key: itemPath, // value returned
      title: item, // title shown on hover
    };
  });
  if (currentPath) {
    breadcrumbItems.splice(0, 0, {
      text: '/', // displayed text
      key: '/', // value returned
      title: '/', // title shown on hover
    });
  }
  breadcrumbItems.reverse();
  const updateLocation = (e, item?: IDropdownOption) => {
    onCurrentPathUpdate(item ? (item.key as string) : '');
  };
  return (
    <Fragment>
      <Stack horizontal styles={stackinput} tokens={{ childrenGap: '2rem' }}>
        <StackItem grow={0} styles={halfstack}>
          <Dropdown
            data-testid={'FileSelectorDropDown'}
            errorMessage={
              operationMode.write && !focusedStorageFolder.writable
                ? formatMessage('You do not have permission to save bots here')
                : ''
            }
            label={formatMessage('Location')}
            options={breadcrumbItems}
            selectedKey={currentPath}
            styles={dropdown}
            onChange={updateLocation}
          />
        </StackItem>
      </Stack>
      <div css={detailListContainer} data-is-scrollable="true">
        <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
          <DetailsList
            isHeaderVisible
            checkboxVisibility={CheckboxVisibility.hidden}
            columns={tableColumns.map((col) => ({
              ...col,
              isSorted: col.key === currentSort.key,
              isSortedDescending: currentSort.descending,
            }))}
            compact={false}
            getKey={(item) => item.name}
            items={storageFiles}
            layoutMode={DetailsListLayoutMode.justified}
            selectionMode={SelectionMode.single}
            onColumnHeaderClick={(_, clickedColumn) => {
              if (clickedColumn == null) return;
              if (clickedColumn.key === currentSort.key) {
                clickedColumn.isSortedDescending = !currentSort.descending;
                setSort({ key: currentSort.key, descending: !currentSort.descending });
              } else {
                clickedColumn.isSorted = true;
                clickedColumn.isSortedDescending = false;
                setSort({ key: clickedColumn.key, descending: false });
              }
            }}
            onItemInvoked={onFileChosen}
            onRenderDetailsHeader={onRenderDetailsHeader}
          />
        </ScrollablePane>
      </div>
    </Fragment>
  );
};
