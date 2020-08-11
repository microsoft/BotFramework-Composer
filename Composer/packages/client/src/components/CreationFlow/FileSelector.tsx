// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import path from 'path';

import { css, jsx } from '@emotion/core';
import formatMessage from 'format-message';
import moment from 'moment';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { ComboBox, IComboBox, IComboBoxOption } from 'office-ui-fabric-react/lib/ComboBox';
import {
  CheckboxVisibility,
  DetailsList,
  DetailsListLayoutMode,
  Selection,
  SelectionMode,
} from 'office-ui-fabric-react/lib/DetailsList';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
import { Stack, StackItem } from 'office-ui-fabric-react/lib/Stack';
import { Sticky, StickyPositionType } from 'office-ui-fabric-react/lib/Sticky';
import { mergeStyleSets } from 'office-ui-fabric-react/lib/Styling';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';

import { FileTypes, nameRegex } from '../../constants';
import { File, StorageFolder } from '../../recoilModel/types';
import { calculateTimeDiff, getFileIconName } from '../../utils/fileUtil';

// -------------------- Styles -------------------- //

const detailListContainer = css`
  position: relative;
  overflow: hidden;
  flex-grow: 1;
`;

const detailListClass = mergeStyleSets({
  fileIconHeaderIcon: {
    padding: 0,
    fontSize: '16px',
  },
  fileIconCell: {
    textAlign: 'center',
    selectors: {
      '&:before': {
        content: '.',
        display: 'inline-block',
        verticalAlign: 'middle',
        height: '100%',
        width: '0px',
        visibility: 'hidden',
      },
    },
  },
  fileIconImg: {
    verticalAlign: 'middle',
    maxHeight: '16px',
    maxWidth: '16px',
  },
});

const tableCell = css`
  outline: none;
  :focus {
    outline: rgb(102, 102, 102) solid 1px;
  }
`;

export const content = css`
  outline: none;
  margin-top: 3px;
`;

export const halfstack = {
  root: [
    {
      flexBasis: '50%',
    },
  ],
};

export const stackinput = {
  root: [
    {
      marginBottom: '1rem',
    },
  ],
};

export const editButton = {
  root: {
    height: 20,
  },
};

export const nameField = {
  fieldGroup: {
    height: 22,
  },
  field: {
    height: 22,
  },
};

// -------------------- FileSelector -------------------- //

interface FileSelectorProps {
  operationMode: {
    read: boolean;
    write: boolean;
  };
  focusedStorageFolder: StorageFolder;
  storages: any[];
  isWindows: boolean;
  createFolder?: (path: string, name) => void;
  updateFolder?: (path: string, oldName: string, newName: string) => void;
  onCurrentPathUpdate: (newPath: string, storageId?: string) => void;
  onFileChosen: (file: any) => void;
  checkShowItem: (file: File) => boolean;
}

type SortState = {
  key: string;
  descending: boolean;
};

enum EditMode {
  NONE,
  Creating,
  Updating,
}

const renderIcon = (file: File) => {
  const iconName = getFileIconName(file);
  if (iconName === FileTypes.FOLDER) {
    return <Icon iconName="OpenFolderHorizontal" style={{ fontSize: '16px', marginTop: 3 }} />;
  } else if (iconName === FileTypes.BOT) {
    return <Icon iconName="Robot" style={{ fontSize: '16px', marginTop: 3 }} />;
  } else if (iconName === FileTypes.UNKNOWN) {
    return <Icon iconName="Page" style={{ fontSize: '16px', marginTop: 3 }} />;
  }
  // fallback for other possible file types
  const url = `https://static2.sharepointonline.com/files/fabric/assets/brand-icons/document/svg/${iconName}_16x1.svg`;
  return (
    <img alt={formatMessage(`{iconName} file icon`, { iconName })} className={detailListClass.fileIconImg} src={url} />
  );
};

export const FileSelector: React.FC<FileSelectorProps> = (props) => {
  const {
    onFileChosen,
    focusedStorageFolder,
    checkShowItem,
    onCurrentPathUpdate,
    operationMode,
    createFolder,
    updateFolder,
    isWindows = false,
    storages,
  } = props;
  // for detail file list in open panel
  const [currentPath, setCurrentPath] = useState(path.join(focusedStorageFolder.parent, focusedStorageFolder.name));
  const initialPath = path.join(focusedStorageFolder.parent, focusedStorageFolder.name);
  const currentStorageIndex = useRef(0);
  const storage = storages[currentStorageIndex.current];
  const storageId = storage.id;
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [folderName, setFolderName] = useState('');
  const [editMode, setEditMode] = useState(EditMode.NONE);
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    setCurrentPath(initialPath);
  }, [focusedStorageFolder]);

  const createOrUpdateFolder = async (index: number) => {
    const isValid = nameRegex.test(folderName);
    const isDup = storageFiles.some((file) => file.name === folderName) && storageFiles[index].name !== folderName;
    if (isValid && !isDup) {
      if (editMode === EditMode.Creating) {
        createFolder && (await createFolder(initialPath, folderName));
        await onCurrentPathUpdate(path.join(initialPath, folderName), storageId);
      }
      if (editMode === EditMode.Updating) {
        updateFolder && (await updateFolder(initialPath, storageFiles[index].name, folderName));
        await onCurrentPathUpdate(initialPath, storageId);
      }
      setEditMode(EditMode.NONE);
      setNameError('');
      setFolderName('');
    } else if (!folderName) {
      // an empty name means to cancel the operation
      cancelEditOperation();
    } else if (isDup) {
      const nameError = formatMessage('folder {folderName} already exists', { folderName });
      setNameError(nameError);
      setFolderName('');
    } else {
      const nameError = formatMessage('Spaces and special characters are not allowed.');
      setNameError(nameError);
      setFolderName('');
    }
  };

  const onEditButtonClick = (file: File) => {
    setEditMode(EditMode.Updating);
    setFolderName(file.name);
  };

  const cancelEditOperation = () => {
    setEditMode(EditMode.NONE);
    setNameError('');
    setCurrentPath(initialPath);
    setFolderName('');
  };

  //This function won't be triggered when index is 0 since the storageFiles[0] is the 'go to parent folder button'
  const handleKeydown = (e, index) => {
    if (e.key === 'Enter' && index > 0) {
      createOrUpdateFolder(index);
      e.preventDefault();
    }
    if (e.key === 'Escape' && index > 0) {
      cancelEditOperation();
      e.stopPropagation();
      e.preventDefault();
    }
  };

  const renderNameColumn = (file: File, index: number | undefined) => {
    const iconName = getFileIconName(file);
    return (
      <div data-is-focusable css={tableCell}>
        {index == selectedIndex && editMode !== EditMode.NONE ? (
          <TextField
            autoFocus
            data-testid={'newFolderTextField'}
            errorMessage={nameError}
            styles={nameField}
            value={folderName}
            onBlur={() => createOrUpdateFolder(index)}
            onChange={(e, value) => {
              e.preventDefault();
              if (value !== undefined) {
                setFolderName(value);
              }
              if (editMode === EditMode.Creating) {
                let newFolderName = value;
                if (!newFolderName) {
                  newFolderName = '';
                }
                setCurrentPath(path.join(initialPath, newFolderName));
              }
            }}
            onKeyDown={(e) => handleKeydown(e, index)}
          />
        ) : (
          <Link
            aria-label={
              file.name === '..'
                ? formatMessage('previous folder')
                : formatMessage('{icon} name is {file}', {
                    icon: iconName,
                    file: file.name,
                  })
            }
            styles={{ root: { marginTop: 3, marginLeft: 10 } }}
            onClick={() => onFileChosen(file)}
          >
            {file.name}
          </Link>
        )}
      </div>
    );
  };

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
      maxWidth: 220,
      isRowHeader: true,
      isResizable: true,
      sortAscendingAriaLabel: formatMessage('Sorted A to Z'),
      sortDescendingAriaLabel: formatMessage('Sorted Z to A'),
      data: 'string',
      onRender: renderNameColumn,
      isPadded: true,
    },
    {
      key: 'lastModified',
      name: formatMessage('Date Modified'),
      fieldName: 'dateModifiedValue',
      minWidth: 100,
      maxWidth: 500,
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
    {
      key: 'Edit',
      name: '',
      fieldName: '',
      minWidth: 30,
      maxWidth: 30,
      isResizable: false,
      data: 'icon',
      onRender: (item: File, index: number | undefined) => {
        return index == 0 ||
          !operationMode.write ||
          !focusedStorageFolder.writable ||
          item.type !== FileTypes.FOLDER ||
          index !== selectedIndex ? null : (
          <div data-is-focusable css={tableCell}>
            <div css={content} tabIndex={-1}>
              <IconButton
                ariaLabel={formatMessage('Edit')}
                iconProps={{ iconName: 'Edit' }}
                styles={editButton}
                title="Edit"
                onClick={(e) => {
                  e.preventDefault();
                  onEditButtonClick(item);
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
              />
            </div>
          </div>
        );
      },
      isPadded: true,
    },
  ];

  function onCreateNewFolder() {
    setFolderName('');
    setSelectedIndex(1);
    setEditMode(EditMode.Creating);
  }

  const selection = useMemo(() => {
    return new Selection({
      onSelectionChanged: () => {
        const selectedIndexs = selection.getSelectedIndices();
        if (selectedIndexs.length > 0 && editMode === EditMode.NONE) {
          setSelectedIndex(selectedIndexs[0]);
        }
      },
    });
  }, []);

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

    if (editMode === EditMode.Creating) {
      const newFolder: File = {
        name: '',
        type: FileTypes.FOLDER,
        path: '',
      };
      files.splice(1, 0, newFolder);
    }
    return files;
  }, [focusedStorageFolder, currentSort.key, currentSort.descending, editMode]);

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
  const breadcrumbItems: IComboBoxOption[] = pathItems.map((item, index) => {
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
  const updatePath = (event: React.FormEvent<IComboBox>, option?: IComboBoxOption, index?: number, value?: string) => {
    event.preventDefault();
    if (option) {
      onCurrentPathUpdate(option.key as string, storageId);
      setCurrentPath(option.key as string);
    } else {
      onCurrentPathUpdate(value as string, storageId);
      setCurrentPath(value as string);
    }
  };
  return (
    <Fragment>
      <Stack horizontal styles={stackinput} tokens={{ childrenGap: '2rem' }}>
        <StackItem grow={0} styles={halfstack}>
          <ComboBox
            allowFreeform
            useComboBoxAsMenuWidth
            autoComplete={'on'}
            data-testid={'FileSelectorComboBox'}
            errorMessage={
              operationMode.write && !focusedStorageFolder.writable
                ? formatMessage('You do not have permission to save bots here')
                : ''
            }
            label={formatMessage('Location')}
            options={breadcrumbItems}
            selectedKey={currentPath}
            onChange={updatePath}
          />
        </StackItem>
        {operationMode.write && (
          <StackItem align={'end'} styles={{ root: { marginBottom: 5 } }}>
            <Link disabled={editMode !== EditMode.NONE} onClick={onCreateNewFolder}>
              {formatMessage('create new folder')}
            </Link>
          </StackItem>
        )}
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
            selection={selection}
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
