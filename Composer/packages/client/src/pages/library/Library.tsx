// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useContext, Fragment, useEffect } from 'react';
import { RouteComponentProps } from '@reach/router';
import formatMessage from 'format-message';
import { Dialog, DialogType } from 'office-ui-fabric-react/lib/Dialog';

import { StoreContext } from '../../store';
import { ToolBar, IToolBarItem } from '../../components/ToolBar';
import { LibraryRef } from '../../store/types';
import { OpenConfirmModal } from '../../components/Modal/ConfirmDialog';

import { ContentHeaderStyle, HeaderText, ContentStyle, contentEditor } from './styles';
import { ImportDialog } from './importDialog';
import { LibraryList } from './libraryList';
import { WorkingModal } from './workingModal';

interface LibraryPageProps extends RouteComponentProps<{}> {
  targetName?: string;
}

const Library: React.FC<LibraryPageProps> = (props) => {
  const { state, actions } = useContext(StoreContext);
  const { settings } = state;
  const [items, setItems] = useState<LibraryRef[]>([]);
  const [selectedItem, setSelectedItem] = useState<LibraryRef>();
  const [working, setWorking] = useState(false);
  const [addDialogHidden, setAddDialogHidden] = useState(true);

  useEffect(() => {
    setItems(settings.importedLibraries || []);
  }, [settings.importedLibraries]);

  const toolbarItems: IToolBarItem[] = [
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

  const importFromWeb = async (packageName, version) => {
    console.log('IMPORT FROM WEB', packageName);
    // TODO: check to see if package already exists in this project
    const existing = settings.importedLibraries?.find((l) => l.name === packageName);
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
      await actions.importLibrary(packageName, version);
      setWorking(false);
    }
  };

  const redownload = async () => {
    return importFromWeb(selectedItem?.name, selectedItem?.version);
  };

  const selectItem = (item: LibraryRef | null) => {
    if (item) {
      setSelectedItem(item);
    } else {
      setSelectedItem(undefined);
    }
  };

  return (
    <Fragment>
      <Dialog
        dialogContentProps={{ title: formatMessage('Import a Library'), type: DialogType.normal }}
        hidden={addDialogHidden}
        minWidth={450}
        modalProps={{ isBlocking: true }}
        onDismiss={closeDialog}
      >
        <ImportDialog closeDialog={closeDialog} doImport={importFromWeb} />
      </Dialog>
      <WorkingModal hidden={!working} title={formatMessage('Importing library...')} />
      <ToolBar toolbarItems={toolbarItems} />
      <div css={ContentHeaderStyle}>
        <h1 css={HeaderText}>{formatMessage('External Libraries')}</h1>
      </div>
      <div css={ContentStyle} data-testid="Publish" role="main">
        <div aria-label={formatMessage('List view')} css={contentEditor} role="region">
          <Fragment>
            <LibraryList items={items} redownload={redownload} updateItems={setItems} onItemClick={selectItem} />
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
