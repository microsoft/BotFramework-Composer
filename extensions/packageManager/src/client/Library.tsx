// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState, Fragment, useEffect } from 'react';
import formatMessage from 'format-message';
import { Link, Pivot, PivotItem, Dialog, DialogType, Dropdown, MessageBar, MessageBarType, MessageBarButton, ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react';
import { render, useHttpClient, useProjectApi, useApplicationApi } from '@bfc/extension-client';

import { Toolbar, IToolbarItem } from '@bfc/ui-shared';

import { ContentHeaderStyle, HeaderText } from './styles';
import { ImportDialog } from './importDialog';
import { LibraryRef, LibraryList } from './libraryList';
import { WorkingModal } from './workingModal';

const DEFAULT_CATEGORY = formatMessage('Available');

const docsUrl = `https://aka.ms/composer-use-package-library`;



const Library: React.FC = () => {
  const [items, setItems] = useState<LibraryRef[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const { settings, projectId, reloadProject } = useProjectApi();
  const { setApplicationLevelError, navigateTo, confirm } = useApplicationApi();

  const [ejectedRuntime, setEjectedRuntime] = useState<boolean>(false);
  const [availableLibraries, updateAvailableLibraries] = useState<LibraryRef[]>([]);
  const [installedComponents, updateInstalledComponents] = useState<LibraryRef[]>([]);
  const [recentlyUsed, setRecentlyUsed] = useState<LibraryRef[]>([]);
  const [programmingLanguageSelection, setProgrammingLanguageSelection] = useState<string>('c#');
  const [runtimeLanguage, setRuntimeLanguage] = useState<string>('c#');

  const [selectedItem, setSelectedItem] = useState<LibraryRef>();
  const [working, setWorking] = useState(false);
  const [addDialogHidden, setAddDialogHidden] = useState(true);
  const httpClient = useHttpClient();
  const API_ROOT = '';

  const strings = {
    title: formatMessage('Package Manager'),
    description: formatMessage('Discover and use components that can be installed into your bot.'),
    descriptionLink: formatMessage('Learn more'),
    installButton: formatMessage('Install Package'),
    importDialogTitle: formatMessage('Install a Package'),
    installProgress: formatMessage('Installing package...'),
    recentlyUsedCategory: formatMessage('Recently Used'),
    installedCategory: formatMessage('Installed'),
    updateConfirmationPrompt: formatMessage('Any changes you made to this package will be lost! Are you sure you want to continue?'),
    updateConfirmationTitle: formatMessage('Update Package'),
    conflictConfirmationTitle: formatMessage('Conflicting changes detected'),
    conflictConfirmationPrompt: formatMessage(
      'This operation will overwrite changes made to previously imported files. Do you want to proceed?'
    ),
    removeConfirmationTitle: formatMessage('Remove Package'),
    removeConfirmationPrompt: formatMessage(
        'Any changes you made to this package will be lost! In addition, this may leave your bot in a broken state. Are you sure you want to continue?'
    ),
    requireEject: formatMessage('To install components, this project must have an ejected runtime. Please navigate to the runtime settings page.'),
    ejectRuntime: formatMessage('Eject Runtime'),
    noComponentsInstalled: formatMessage('No packages installed'),
    noComponentsFound: formatMessage('No packages found. Check extension configuration.'),
    browseHeader: formatMessage('Browse'),
    installHeader: formatMessage('Installed'),
    libraryError: formatMessage('Package Manager Error'),
    importError: formatMessage('Install Error'),
  }

  const programmingLanguages = [
    {
      key: 'c#',
      text: 'C#',
    },
    {
      key: 'js',
      text: 'Javascript',
    }
  ];

  const onChangeLanguage = (ev, op, idx) => {
    setProgrammingLanguageSelection(op.key);
    return true;
  }

  const installComponentAPI = (projectId: string, packageName: string, version: string, isUpdating: boolean) => {
    return httpClient.post(`${API_ROOT}/projects/${projectId}/import`, {
      package: packageName,
      version: version,
      isUpdating,
    });
  };

  const getLibraryAPI = () => {
    return httpClient.get(`${API_ROOT}/library`);
  };

  const getInstalledComponentsAPI = (projectId: string) => {
    return httpClient.get(`${API_ROOT}/projects/${projectId}/installedComponents`);
  };

  const uninstallComponentAPI = (projectId: string, packageName: string) => {
    return httpClient.post(`${API_ROOT}/projects/${projectId}/unimport`, {
      package: packageName,
    });
  };

  const isCompatible = (component) => {
    return (component.language === programmingLanguageSelection);
  }

  useEffect(() => {


    getLibraries();

    if (settings.runtime && settings.runtime.customRuntime === true && settings.runtime.path) {
      setEjectedRuntime(true);
      getInstalledLibraries();

      // detect programming language.
      // should one day be a dynamic property of the runtime or at least stored in the settings?
      if (settings.runtime.key === 'node-azurewebapp') {
        setRuntimeLanguage('js');
        setProgrammingLanguageSelection('js');
      } else {
        setRuntimeLanguage('c#');
        setProgrammingLanguageSelection('c#');
      }
    }
  }, []);

  useEffect(() => {
    const groups: any[] = [];
    let items: any[] = [];

    // find all categories listed in the available libraries
    const categories = [DEFAULT_CATEGORY];
    if (availableLibraries) {
      const availableCompatibleLibraries = availableLibraries.filter(component => isCompatible(component));
      availableCompatibleLibraries.forEach((item) => {
        if (!item.category) {
          item.category = DEFAULT_CATEGORY;
        }
        if (item.category && categories.indexOf(item.category) == -1) {
          categories.push(item.category);
        }
      });

      categories.forEach((category) => {
        const categoryItems = availableCompatibleLibraries.filter((i) => i.category === category);
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
    }

    if (recentlyUsed) {
      const recentlyUsedCompatible = recentlyUsed.filter(component => isCompatible(component));
      if (recentlyUsedCompatible.length) {
        groups.push({
          key: 'recently',
          name: strings.recentlyUsedCategory,
          startIndex: items.length,
          count: recentlyUsedCompatible.length,
          level: 0,
        });
        items = items.concat(recentlyUsedCompatible || []);
      }
    }


    setItems(items);
    setGroups(groups);
  }, [installedComponents, availableLibraries, recentlyUsed, programmingLanguageSelection]);

  const toolbarItems: IToolbarItem[] = [
    {
      type: 'action',
      text: strings.installButton,
      buttonProps: {
        iconProps: {
          iconName: 'Add',
        },
        onClick: () => setAddDialogHidden(false),
      },
      align: 'left',
      dataTestid: 'publishPage-ToolBar-Add',
      disabled: !ejectedRuntime,
    },
  ];

  const closeDialog = () => {
    setAddDialogHidden(true);
  };

  const importFromWeb = async (packageName, version, isUpdating) => {
    const existing = installedComponents?.find((l) => l.name === packageName);
    let okToProceed = true;
    if (existing) {
      const title = strings.updateConfirmationTitle;
      const msg = strings.updateConfirmationPrompt;
      okToProceed = await confirm(title, msg);
    }

    if (okToProceed) {
      closeDialog();
      setWorking(true);
      await importComponent(packageName, version, isUpdating || false);
      setWorking(false);
    }
  };

  const importComponent = async (packageName, version, isUpdating) => {
    try {
      const results = await installComponentAPI(projectId, packageName, version, isUpdating);

      // check to see if there was a conflict that requires confirmation
      if (results.data.success === false) {
        const title = strings.conflictConfirmationTitle;
        const msg = strings.conflictConfirmationPrompt;
        if (await confirm(title, msg)) {
          await installComponentAPI(projectId, packageName, version, true);
        }
      } else {
        updateInstalledComponents(results.data.components);

        // reload modified content
        await reloadProject();
      }
    } catch (err) {
      console.error(err);
      setApplicationLevelError({
        status: err.response.status,
        message: err.response && err.response.data.message ? err.response.data.message : err,
        summary: strings.importError,
      });
    }
  };

  const getLibraries = async () => {
    try {
      const response = await getLibraryAPI();
      updateAvailableLibraries(response.data.available);
      setRecentlyUsed(response.data.recentlyUsed);
    } catch (err) {
      setApplicationLevelError({
        status: err.response.status,
        message: err.response && err.response.data.message ? err.response.data.message : err,
        summary: strings.libraryError,
      });
    }
  };

  const getInstalledLibraries = async () => {
    try {
      const response = await getInstalledComponentsAPI(projectId);
      updateInstalledComponents(response.data.components);
    } catch (err) {
      setApplicationLevelError({
        status: err.response.status,
        message: err.response && err.response.data.message ? err.response.data.message : err,
        summary: strings.libraryError,
      });
    }
  };

  const install = async () => {
    return importFromWeb(selectedItem?.name, selectedItem?.version, false);
  };

  const redownload = async () => {
    return importFromWeb(selectedItem?.name, selectedItem?.version, true);
  };

  const removeComponent = async () => {
    if (selectedItem) {
      const title = strings.removeConfirmationTitle;
      const msg = strings.removeConfirmationPrompt;
      const okToProceed = await confirm(title, msg);
      if (okToProceed) {
        closeDialog();
        setWorking(true);
        try {
          const results = await uninstallComponentAPI(projectId, selectedItem.name);

          if (results.data.success) {
            updateInstalledComponents(results.data.components);
          } else {
            throw new Error(results.data.message);
          }

          // reload modified content
          await reloadProject();
        } catch (err) {
          setApplicationLevelError({
            status: err.response.status,
            message: err.response && err.response.data.message ? err.response.data.message : err,
            summary: strings.importError,
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
    <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
      <Dialog
        dialogContentProps={{
          title: strings.importDialogTitle,
          type: DialogType.normal,
        }}
        hidden={addDialogHidden}
        minWidth={450}
        modalProps={{ isBlocking: true }}
        onDismiss={closeDialog}
      >
        <ImportDialog closeDialog={closeDialog} doImport={importFromWeb} />
      </Dialog>
      <WorkingModal hidden={!working} title={strings.installProgress} />
      <Toolbar toolbarItems={toolbarItems} />
      <div css={ContentHeaderStyle}>
        <h1 css={HeaderText}>{strings.title}</h1>
        <p>{strings.description} <Link href={docsUrl} target="_new">{strings.descriptionLink }</Link></p>
      </div>
      {!ejectedRuntime && (
        <MessageBar
          messageBarType={MessageBarType.warning}
          isMultiline={false}
          actions={
            <div>
              <MessageBarButton onClick={navigateToEject}>{strings.ejectRuntime}</MessageBarButton>
            </div>
          }
        >
          {strings.requireEject}
        </MessageBar>
      )}
      <Fragment>
        <Pivot aria-label="Library Views" style={{paddingLeft: '12px'}}>
          <PivotItem headerText={strings.browseHeader}>
            <section style={{paddingRight: '20px', display: 'grid', justifyContent: 'end'}}>
              <Dropdown
                placeholder="Format"
                selectedKey={programmingLanguageSelection}
                options={programmingLanguages}
                onChange={onChangeLanguage}
                styles={{
                root: { width: '200px',  },
              }}
              >
              </Dropdown>
            </section>
            <LibraryList
                disabled={!ejectedRuntime || runtimeLanguage != programmingLanguageSelection}
                groups={groups}
                install={install}
                isInstalled={isInstalled}
                items={items}
                redownload={redownload}
                removeLibrary={removeComponent}
                updateItems={setItems}
                onItemClick={selectItem}
              />
              {!items || items.length === 0 ? (
                <div
                  style={{
                    marginLeft: '50px',
                    fontSize: 'smaller',
                    marginTop: '20px',
                  }}
                >
                  {strings.noComponentsFound}
                </div>
              ) : null}
          </PivotItem>
          <PivotItem headerText={strings.installHeader}>
          <LibraryList
                disabled={!ejectedRuntime}
                groups={[{
                  key: 'installed',
                  name: strings.installedCategory,
                  startIndex: 0,
                  count: installedComponents ? installedComponents.length : 0,
                  level: 0,
                }]}
                install={install}
                isInstalled={isInstalled}
                items={installedComponents}
                redownload={redownload}
                removeLibrary={removeComponent}
                updateItems={setItems}
                onItemClick={selectItem}
              />
              {!installedComponents || installedComponents.length === 0 ? (
                <div
                  style={{
                    marginLeft: '50px',
                    fontSize: 'smaller',
                    marginTop: '20px',
                  }}
                >
                  {strings.noComponentsInstalled}
                </div>
              ) : null}
          </PivotItem>
        </Pivot>
      </Fragment>
    </ScrollablePane>
  );
};

render(<Library />);
