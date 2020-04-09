// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import path from 'path';

import { jsx } from '@emotion/core';
import { useMemo } from 'react';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
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

import { FileTypes } from '../../constants/index';
import { styles as wizardStyles } from '../StepWizard/styles';
import { StorageFolder, File } from '../../store/types';
import { getFileIconName, formatBytes, calculateTimeDiff } from '../../utils';

import { dropdown, detailListContainer, detailListClass } from './styles';

interface FileSelectorProps {
  operationMode: {
    read: boolean;
    write: boolean;
  };
  focusedStorageFolder: StorageFolder;
  onCurrentPathUpdate: (newPath?: string, storageId?: string) => void;
  onFileChosen: (file: any) => void;
  checkShowItem: (file: File) => boolean;
}

export const FileSelector: React.FC<FileSelectorProps> = props => {
  const { onFileChosen, focusedStorageFolder, checkShowItem, onCurrentPathUpdate, operationMode } = props;
  // for detail file list in open panel
  const currentPath = path.join(focusedStorageFolder.parent, focusedStorageFolder.name);
  const tableColumns = [
    {
      key: 'column1',
      name: formatMessage('File Type'),
      className: detailListClass.fileIconCell,
      iconClassName: detailListClass.fileIconHeaderIcon,
      ariaLabel: formatMessage('Column operations for File type, Press to sort on File type'),
      iconName: 'Page',
      isIconOnly: true,
      fieldName: 'name',
      minWidth: 16,
      maxWidth: 16,
      onRender: item => {
        const iconName = item.iconName;
        if (iconName === FileTypes.FOLDER) {
          return (
            <Icon
              style={{
                fontSize: '16px',
              }}
              iconName="OpenFolderHorizontal"
            />
          );
        } else if (iconName === FileTypes.BOT) {
          return (
            <Icon
              style={{
                fontSize: '16px',
              }}
              iconName="Robot"
            />
          );
        } else if (iconName === FileTypes.UNKNOWN) {
          return (
            <Icon
              style={{
                fontSize: '16px',
              }}
              iconName="Page"
            />
          );
        }
        const url = `https://static2.sharepointonline.com/files/fabric/assets/brand-icons/document/svg/${iconName}_16x1.svg`;
        return <img src={url} className={detailListClass.fileIconImg} alt={`${iconName} file icon`} />;
      },
    },
    {
      key: 'column2',
      name: formatMessage('Name'),
      fieldName: 'name',
      minWidth: 150,
      maxWidth: 200,
      isRowHeader: true,
      isResizable: true,
      isSorted: true,
      isSortedDescending: false,
      sortAscendingAriaLabel: formatMessage('Sorted A to Z'),
      sortDescendingAriaLabel: formatMessage('Sorted Z to A'),
      data: 'string',
      onRender: item => {
        return <span aria-label={item.name}>{item.name}</span>;
      },
      isPadded: true,
    },
    {
      key: 'column3',
      name: formatMessage('Date Modified'),
      fieldName: 'dateModifiedValue',
      minWidth: 60,
      maxWidth: 70,
      isResizable: true,
      data: 'number',
      onRender: item => {
        return <span>{calculateTimeDiff(item.lastModified)}</span>;
      },
      isPadded: true,
    },
  ];
  const diskRootPattern = /[a-zA-Z]:\/$/;
  const storageFiles = useMemo(() => {
    if (!focusedStorageFolder.children) return [];
    const files = focusedStorageFolder.children.reduce((result, file) => {
      const check = typeof checkShowItem === 'function' ? checkShowItem : () => true;
      if (check(file)) {
        result.push({
          name: file.name,
          value: file.name,
          fileType: file.type,
          iconName: getFileIconName(file),
          lastModified: file.lastModified,
          fileSize: file.size ? formatBytes(file.size) : '',
          filePath: file.path,
        });
      }
      return result;
    }, [] as any[]);
    // add parent folder
    files.unshift({
      name: '..',
      value: '..',
      fileType: 'folder',
      iconName: 'folder',
      filePath: diskRootPattern.test(currentPath) || currentPath === '/' ? '/' : focusedStorageFolder.parent,
    });
    return files;
  }, [focusedStorageFolder]);
  function onRenderDetailsHeader(props, defaultRender) {
    return (
      <Sticky stickyPosition={StickyPositionType.Header} isScrollSynced={true}>
        {defaultRender({
          ...props,
          onRenderColumnHeaderTooltip: tooltipHostProps => <TooltipHost {...tooltipHostProps} />,
        })}
      </Sticky>
    );
  }

  function getNavItemPath(array, separator, start, end) {
    if (end === 0) return array[0];
    if (!start) start = 0;
    if (!end) end = array.length - 1;
    end++;
    return array.slice(start, end).join(separator);
  }

  const separator = path.sep;
  const pathItems = currentPath.split(separator).filter(p => p !== '');
  const breadcrumbItems = pathItems.map((item, index) => {
    let itemPath = getNavItemPath(pathItems, separator, 0, index);
    // put a leading / back on the path if it started as a unix style path
    itemPath = currentPath.startsWith('/') ? `/${itemPath}` : itemPath;
    // add a trailing / if the last path is something like c:
    itemPath = itemPath[itemPath.length - 1] === ':' ? `${itemPath}/` : itemPath;
    const displayText = itemPath.startsWith('/') ? itemPath : `/${itemPath}`;
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
      <Stack horizontal tokens={{ childrenGap: '2rem' }} styles={wizardStyles.stackinput}>
        <StackItem grow={0} styles={wizardStyles.halfstack}>
          <Dropdown
            label={formatMessage('Location')}
            styles={dropdown}
            options={breadcrumbItems}
            onChange={updateLocation}
            selectedKey={currentPath}
            errorMessage={
              operationMode.write && !focusedStorageFolder.writable
                ? formatMessage('You do not have permission to save bots here')
                : ''
            }
          />
        </StackItem>
      </Stack>
      <div data-is-scrollable="true" css={detailListContainer}>
        <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
          <DetailsList
            items={storageFiles}
            compact={false}
            columns={tableColumns}
            getKey={item => item.name}
            layoutMode={DetailsListLayoutMode.justified}
            onRenderDetailsHeader={onRenderDetailsHeader}
            isHeaderVisible={true}
            onItemInvoked={onFileChosen}
            selectionMode={SelectionMode.single}
            checkboxVisibility={CheckboxVisibility.hidden}
          />
        </ScrollablePane>
      </div>
    </Fragment>
  );
};
