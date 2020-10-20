// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, Fragment, useEffect } from 'react';
import { RouteComponentProps } from '@reach/router';
import formatMessage from 'format-message';
import { Dialog, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import { MessageBarButton } from 'office-ui-fabric-react/lib/Button';

import { useRecoilValue } from 'recoil';
import { LibraryRef } from '@bfc/shared';

import { Toolbar, IToolbarItem } from '../../components/Toolbar';
import { OpenConfirmModal } from '../../components/Modal/ConfirmDialog';
import { settingsState, dispatcherState } from '../../recoilModel';

import httpClient from '../../utils/httpUtil';
import { navigateTo } from '../../utils/navigation';
import { ContentHeaderStyle, HeaderText, ContentStyle, contentEditor } from './styles';
import { ImportDialog } from './importDialog';
import { LibraryList } from './libraryList';
import { WorkingModal } from './workingModal';

const DEFAULT_CATEGORY = formatMessage('Available');

const Library: React.FC<RouteComponentProps<{ projectId: string; targetName?: string }>> = (props) => {
  const [items, setItems] = useState<LibraryRef[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const { projectId = '' } = props;
  const settings = useRecoilValue(settingsState(projectId));

  const [ejectedRuntime, setEjectedRuntime] = useState<boolean>(false);
  const [availableLibraries, updateAvailableLibraries] = useState<any[]>([]);
  const [installedComponents, updateInstalledComponents] = useState<any[]>([]);

  const [selectedItem, setSelectedItem] = useState<LibraryRef>();
  const [working, setWorking] = useState(false);
  const [addDialogHidden, setAddDialogHidden] = useState(true);
  const { fetchProjectById, setApplicationLevelError } = useRecoilValue(dispatcherState);

  useEffect(() => {
    getLibraries();
    getInstalledLibraries();
    if (settings.runtime && settings.runtime.customRuntime === true && settings.runtime.path) {
      setEjectedRuntime(true);
    }
  }, []);

  useEffect(() => {
    const groups: any[] = [];
    let items: any[] = [];

    items = items.concat(installedComponents || []);

    groups.push({
      key: 'installed',
      name: 'Installed',
      startIndex: 0,
      count: installedComponents ? installedComponents.length : 0,
      level: 0,
    });

    // find all categories listed in the available libraries
    const categories = [DEFAULT_CATEGORY];
    availableLibraries.forEach((item) => {
      if (!item.category) {
        item.category = DEFAULT_CATEGORY;
      }
      if (item.category && categories.indexOf(item.category) == -1) {
        categories.push(item.category);
      }
    });

    categories.forEach((category) => {
      const categoryItems = availableLibraries.filter((i) => i.category === category);
      if (categoryItems.length) {
        groups.push({
          key: category,
          name: category,
          startIndex: items.length,
          count: categoryItems.length,
          level: 0,
        });
        items = items.concat(categoryItems || []);
      }
    });

    setItems(items);
    setGroups(groups);
  }, [installedComponents, availableLibraries]);

  const toolbarItems: IToolbarItem[] = [
    {
      type: 'action',
      text: formatMessage('Import Library'),
      buttonProps: {
        iconProps: {
          iconName: 'Add',
        },
        onClick: () => setAddDialogHidden(false),
      },
      align: 'left',
      dataTestid: 'publishPage-ToolBar-Add',
      disabled: false,
    },
  ];

  const closeDialog = () => {
    setAddDialogHidden(true);
  };

  const importFromWeb = async (packageName, version, isUpdating) => {
    const existing = installedComponents?.find((l) => l.name === packageName);
    let okToProceed = true;
    if (existing) {
      const title = formatMessage('Update Library');
      const msg = formatMessage(
        'Any changes you made to this library will be lost! Are you sure you want to continue?'
      );
      okToProceed = (await OpenConfirmModal(title, msg)) ? true : false;
    }

    if (okToProceed) {
      closeDialog();
      setWorking(true);
      await importLibrary(packageName, version, isUpdating || false);
      setWorking(false);
    }
  };

  const importLibrary = async (packageName, version, isUpdating) => {
    try {
      const results = await httpClient.post(`/projects/${projectId}/import`, {
        package: packageName,
        version: version,
        isUpdating,
      });

      // check to see if there was a conflict that requires confirmation
      if (results.data.success === false) {
        const title = formatMessage('Conflicting changes detected');
        const msg = formatMessage(
          'This operation will overwrite changes made to previously imported files. Do you want to proceed?'
        );
        if (await OpenConfirmModal(title, msg)) {
          await httpClient.post(`/projects/${projectId}/import`, {
            package: packageName,
            version: version,
            isUpdating: true,
          });
        }
      }

      await getInstalledLibraries();

      // reload modified content
      await fetchProjectById(projectId);
    } catch (err) {
      console.error(err);
      setApplicationLevelError({
        status: err.response.status,
        message: err.response && err.response.data.message ? err.response.data.message : err,
        summary: 'IMPORT ERROR',
      });
    }
  };

  const getLibraries = async () => {
    try {
      const response = await httpClient.get(`/library`);
      updateAvailableLibraries(response.data);
    } catch (err) {
      setApplicationLevelError({
        status: err.response.status,
        message: err.response && err.response.data.message ? err.response.data.message : err,
        summary: 'LIBRARY ERROR',
      });
    }
  };

  const getInstalledLibraries = async () => {
    try {
      const response = await httpClient.get(`/projects/${projectId}/installedComponents`);
      updateInstalledComponents(response.data.components);
    } catch (err) {
      setApplicationLevelError({
        status: err.response.status,
        message: err.response && err.response.data.message ? err.response.data.message : err,
        summary: 'LIBRARY ERROR',
      });
    }
  };

  const install = async () => {
    return importFromWeb(selectedItem?.name, selectedItem?.version, false);
  };

  const redownload = async () => {
    return importFromWeb(selectedItem?.name, selectedItem?.version, true);
  };

  const removeLibrary = async () => {
    if (selectedItem) {
      const title = formatMessage('Remove Library');
      const msg = formatMessage(
        'Any changes you made to this library will be lost! In addition, this may leave your bot in a broken state. Are you sure you want to continue?'
      );
      const okToProceed = (await OpenConfirmModal(title, msg)) ? true : false;
      if (okToProceed) {
        closeDialog();
        setWorking(true);
        try {
          await httpClient.post(`/projects/${projectId}/unimport`, {
            package: selectedItem.name,
          });

          // reload modified content
          await fetchProjectById(projectId);
        } catch (err) {
          setApplicationLevelError({
            status: err.response.status,
            message: err.response && err.response.data.message ? err.response.data.message : err,
            summary: 'IMPORT ERROR',
          });
        }
        setWorking(false);
      }
    }
  };

  const isInstalled = (item: LibraryRef): boolean => {
    return installedComponents?.find((l) => l.name === item.name) != undefined;
  };
  const selectItem = (item: LibraryRef | null) => {
    if (item) {
      setSelectedItem(item);
    } else {
      setSelectedItem(undefined);
    }
  };

  const navigateToEject = (evt: any): void => {
    navigateTo(`/settings/bot/${projectId}/runtime`);
  };

  return (
    <Fragment>
      <Dialog
        dialogContentProps={{ title: formatMessage('Import a Package'), type: DialogType.normal }}
        hidden={addDialogHidden}
        minWidth={450}
        modalProps={{ isBlocking: true }}
        onDismiss={closeDialog}
      >
        <ImportDialog closeDialog={closeDialog} doImport={importFromWeb} />
      </Dialog>
      <WorkingModal hidden={!working} title={formatMessage('Importing library...')} />
      <Toolbar toolbarItems={toolbarItems} />
      <div css={ContentHeaderStyle}>
        <h1 css={HeaderText}>{formatMessage('Package Library')}</h1>
      </div>
      {!ejectedRuntime && (
        <MessageBar
          messageBarType={MessageBarType.warning}
          isMultiline={false}
          actions={
            <div>
              <MessageBarButton onClick={navigateToEject}>{formatMessage('Eject runtime')}</MessageBarButton>
            </div>
          }
        >
          To install components, this project must have an ejected runtime. Please navigate to the runtime settings
          page.
        </MessageBar>
      )}
      <div css={ContentStyle} data-testid="installedLibraries" role="main">
        <div aria-label={formatMessage('List view')} css={contentEditor} role="region">
          <Fragment>
            <LibraryList
              groups={groups}
              install={install}
              disabled={!ejectedRuntime}
              isInstalled={isInstalled}
              items={items}
              redownload={redownload}
              removeLibrary={removeLibrary}
              updateItems={setItems}
              onItemClick={selectItem}
            />
            {!items || items.length === 0 ? (
              <div style={{ marginLeft: '50px', fontSize: 'smaller', marginTop: '20px' }}>No libraries installed</div>
            ) : null}
          </Fragment>
        </div>
      </div>
    </Fragment>
  );
};

export default Library;
