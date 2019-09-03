/* eslint-disable react/prop-types */
/** @jsx jsx */
import path from 'path';

import { jsx } from '@emotion/core';
import { Fragment, useEffect, useState, useContext, useRef } from 'react';
// import findindex from 'lodash.findindex';

import { FileSelector } from './FileSelector';
// import { SaveAction } from './SaveAction';
import { StoreContext } from './../../store';
import { OpenStatus, FileTypes } from './../../constants';

export function LocationSelectContent(props) {
  const { state, actions } = useContext(StoreContext);
  const { storages, storageExplorerStatus, focusedStorageFolder, storageFileLoadingStatus } = state;
  //   const { onSaveAs, onOpen } = props;
  const { onOpen, onChange } = props;

  const { fetchFolderItemsByPath } = actions;
  const currentStorageIndex = useRef(0);
  const [currentPath, setCurrentPath] = useState('');
  const currentStorageId = storages[currentStorageIndex.current] ? storages[currentStorageIndex.current].id : 'default';

  useEffect(() => {
    const index = currentStorageIndex.current;
    updateCurrentPath(storages[index].path, storages[index].id);
  }, [storages]);

  const updateCurrentPath = async (newPath, storageId) => {
    if (!storageId) {
      storageId = currentStorageId;
    }

    if (newPath) {
      const formatedPath = path.normalize(newPath.replace(/\\/g, '/'));
      await fetchFolderItemsByPath(storageId, formatedPath);
      setCurrentPath(formatedPath);
      if (onChange) {
        onChange(formatedPath);
      }
    }
  };

  const onSelectionChanged = item => {
    if (item) {
      const type = item.fileType;
      const storageId = storages[currentStorageIndex.current].id;
      const path = item.filePath;
      if (type === FileTypes.FOLDER) {
        updateCurrentPath(path, storageId);
      } else {
        onOpen(path, storageId);
      }
    }
  };

  const checkShowItem = item => {
    if (storageExplorerStatus === OpenStatus.SAVEAS && item.type !== 'folder') {
      return false;
    }
    return true;
  };

  //   const checkDuplicate = value => {
  //     if (focusedStorageFolder.children) {
  //       const index = findindex(focusedStorageFolder.children, function(child) {
  //         return child.name.toLowerCase() === value.toLowerCase();
  //       });
  //       if (index >= 0) {
  //         return 'Duplicate folder name';
  //       }
  //     }
  //     return '';
  //   };

  //   const handleSaveAs = async value => {
  //     let parent = focusedStorageFolder.parent;
  //     if (parent === '/') {
  //       parent = '';
  //     }
  //     const dir = `${parent}/${focusedStorageFolder.name}`;
  //     const absolutePath = `${dir}/${value}`;
  //     await onSaveAs(storages[currentStorageIndex.current].id, absolutePath);
  //   };

  return (
    <Fragment>
      <FileSelector
        // saveAction={
        //   storageExplorerStatus === OpenStatus.OPEN ? (
        //     <div />
        //   ) : (
        //     <SaveAction onSave={handleSaveAs} onGetErrorMessage={checkDuplicate} />
        //   )
        // }
        storageExplorerStatus={storageExplorerStatus}
        storageFileLoadingStatus={storageFileLoadingStatus}
        checkShowItem={checkShowItem}
        currentPath={currentPath}
        focusedStorageFolder={focusedStorageFolder}
        updateCurrentPath={updateCurrentPath}
        onSelectionChanged={onSelectionChanged}
      />
    </Fragment>
  );
}
