// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from "@emotion/core";
import React, { useState, Fragment, useEffect } from "react";
import formatMessage from "format-message";
import { Dialog, DialogType, MessageBar, MessageBarType, MessageBarButton } from "office-ui-fabric-react";
import {
  render,
  useHttpClient,
  useProjectApi,
  useApplicationApi,
} from "@bfc/extension-client";

import { Toolbar, IToolbarItem } from "@bfc/ui-shared";
// import { OpenConfirmModal } from "../../components/Modal/ConfirmDialog";

import {
  ContentHeaderStyle,
  HeaderText,
  ContentStyle,
  contentEditor,
} from "./styles";
import { ImportDialog } from "./importDialog";
import { LibraryRef, LibraryList } from "./libraryList";
import { WorkingModal } from "./workingModal";

const DEFAULT_CATEGORY = formatMessage("Available");

const Library: React.FC = () => {
  const [items, setItems] = useState<LibraryRef[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const { settings, projectId, reloadProject } = useProjectApi();
  const { setApplicationLevelError, navigateTo } = useApplicationApi();

  const [ejectedRuntime, setEjectedRuntime] = useState<boolean>(false);
  const [availableLibraries, updateAvailableLibraries] = useState<any[]>([]);
  const [installedComponents, updateInstalledComponents] = useState<any[]>([]);

  const [selectedItem, setSelectedItem] = useState<LibraryRef>();
  const [working, setWorking] = useState(false);
  const [addDialogHidden, setAddDialogHidden] = useState(true);
  const httpClient = useHttpClient();
  const API_ROOT = '';

  const installComponentAPI = async (projectId: string, packageName: string, version: string, isUpdating: boolean) => {
    return httpClient.post(`${API_ROOT}/projects/${projectId}/import`, {
      package: packageName,
      version: version,
      isUpdating,
    });
  }

  const getLibraryAPI = async () => {
    return httpClient.get(`${API_ROOT}/library`);
  }

  const getInstalledComponentsAPI = async (projectId: string) => {
    return httpClient.get(
      `${API_ROOT}/projects/${projectId}/installedComponents`
    );
  }

  const uninstallComponentAPI  = async (projectId: string, packageName: string) => {
    return httpClient.post(`${API_ROOT}/projects/${projectId}/unimport`, {
      package: packageName,
    });
  }

  useEffect(() => {
    getLibraries();
    if (
      settings.runtime &&
      settings.runtime.customRuntime === true &&
      settings.runtime.path
    ) {
      setEjectedRuntime(true);
      getInstalledLibraries();
    }
  }, []);

  useEffect(() => {
    const groups: any[] = [];
    let items: any[] = [];

    if (installedComponents.length) {
      items = items.concat(installedComponents || []);

      groups.push({
        key: "installed",
        name: "Installed",
        startIndex: 0,
        count: installedComponents ? installedComponents.length : 0,
        level: 0,
      });
    }

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
      const categoryItems = availableLibraries.filter(
        (i) => i.category === category
      );
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
      type: "action",
      text: formatMessage("Install Package"),
      buttonProps: {
        iconProps: {
          iconName: "Add",
        },
        onClick: () => setAddDialogHidden(false),
      },
      align: "left",
      dataTestid: "publishPage-ToolBar-Add",
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
      const title = formatMessage("Update Package");
      const msg = formatMessage(
        "Any changes you made to this package will be lost! Are you sure you want to continue?"
      );
      // okToProceed = (await OpenConfirmModal(title, msg)) ? true : false;
      okToProceed = confirm(msg);
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
        const title = formatMessage("Conflicting changes detected");
        const msg = formatMessage(
          "This operation will overwrite changes made to previously imported files. Do you want to proceed?"
        );
        // if (await OpenConfirmModal(title, msg)) {
        if (confirm(msg)) {
          await await installComponentAPI(projectId, packageName, version, true);
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
        message:
          err.response && err.response.data.message
            ? err.response.data.message
            : err,
        summary: "IMPORT ERROR",
      });
    }
  };

  const getLibraries = async () => {
    try {
      const response = await getLibraryAPI();
      updateAvailableLibraries(response.data);
    } catch (err) {
      setApplicationLevelError({
        status: err.response.status,
        message:
          err.response && err.response.data.message
            ? err.response.data.message
            : err,
        summary: "LIBRARY ERROR",
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
        message:
          err.response && err.response.data.message
            ? err.response.data.message
            : err,
        summary: "LIBRARY ERROR",
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
      const title = formatMessage("Remove Package");
      const msg = formatMessage(
        "Any changes you made to this package will be lost! In addition, this may leave your bot in a broken state. Are you sure you want to continue?"
      );
      // const okToProceed = (await OpenConfirmModal(title, msg)) ? true : false;
      const okToProceed = confirm(msg);
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
            message:
              err.response && err.response.data.message
                ? err.response.data.message
                : err,
            summary: "IMPORT ERROR",
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
    // TODO: update this when navigateTo is available
    navigateTo(`/settings/bot/${projectId}/runtime`);
  };

  return (
    <Fragment>
      <Dialog
        dialogContentProps={{
          title: formatMessage("Import a Package"),
          type: DialogType.normal,
        }}
        hidden={addDialogHidden}
        minWidth={450}
        modalProps={{ isBlocking: true }}
        onDismiss={closeDialog}
      >
        <ImportDialog closeDialog={closeDialog} doImport={importFromWeb} />
      </Dialog>
      <WorkingModal
        hidden={!working}
        title={formatMessage("Installing package...")}
      />
      <Toolbar toolbarItems={toolbarItems} />
      <div css={ContentHeaderStyle}>
        <h1 css={HeaderText}>{formatMessage("Package Library")}</h1>
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
        <div
          aria-label={formatMessage("List view")}
          css={contentEditor}
          role="region"
        >
          <Fragment>
            <LibraryList
              disabled={!ejectedRuntime}
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
                  marginLeft: "50px",
                  fontSize: "smaller",
                  marginTop: "20px",
                }}
              >
                No libraries installed
              </div>
            ) : null}
          </Fragment>
        </div>
      </div>
    </Fragment>
  );
};

render(<Library />);
