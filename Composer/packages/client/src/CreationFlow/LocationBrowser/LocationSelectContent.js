/**
    Copyright (c) Microsoft. All rights reserved.
    Licensed under the MIT license.

    Microsoft Bot Framework: http://botframework.com

    Bot Framework Composer Github:
    https://github.com/Microsoft/BotFramwork-Composer

    Copyright (c) Microsoft Corporation
    All rights reserved.

    MIT License:
    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/
/* eslint-disable react/prop-types */
/** @jsx jsx */
import path from 'path';

import { jsx } from '@emotion/core';
import { Fragment, useEffect, useState, useContext, useRef } from 'react';

import { FileSelector } from './FileSelector';
import { StoreContext } from './../../store';
import { FileTypes } from './../../constants';

export function LocationSelectContent(props) {
  const { state, actions } = useContext(StoreContext);
  const { storages, storageExplorerStatus, focusedStorageFolder, storageFileLoadingStatus } = state;
  const { onOpen, onChange } = props;

  const { fetchFolderItemsByPath } = actions;
  const currentStorageIndex = useRef(0);
  const [currentPath, setCurrentPath] = useState('');
  const currentStorageId = storages[currentStorageIndex.current] ? storages[currentStorageIndex.current].id : 'default';

  useEffect(() => {
    const index = currentStorageIndex.current;
    let path = '';
    let id = '';
    if (storages[index]) {
      path = storages[index].path;
      id = storages[index].id;
    }
    updateCurrentPath(path, id);
  }, [storages]);

  useEffect(() => {
    if (onChange) {
      onChange(currentPath);
    }
  }, [currentPath]);

  const updateCurrentPath = async (newPath, storageId) => {
    if (!storageId) {
      storageId = currentStorageId;
    }
    if (newPath) {
      // const formatedPath = path.normalize(newPath.replace(/\\/g, '/'));
      const formatedPath = path.normalize(newPath);
      await fetchFolderItemsByPath(storageId, formatedPath);
      setCurrentPath(formatedPath);
    }
  };

  const onSelectionChanged = item => {
    if (item) {
      const type = item.fileType;
      const storageId = storages[currentStorageIndex.current].id;
      const path = item.filePath;
      if (type === FileTypes.FOLDER) {
        updateCurrentPath(path, storageId);
      } else if (type === FileTypes.BOT) {
        onOpen(path, storageId);
      }
    }
  };

  const checkShowItem = item => {
    // this is a file->open browser
    if (onOpen) {
      if (item.type === 'bot' || item.type === 'folder') {
        return true;
      }
      return false;
    } else {
      return item.type === 'folder';
    }
  };

  return (
    <Fragment>
      <FileSelector
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
