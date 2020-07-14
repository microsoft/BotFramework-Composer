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

import { ContentHeaderStyle, HeaderText, ContentStyle, contentEditor } from './styles';
import { ImportDialog } from './importDialog';
import { LibraryList, LibraryItem } from './libraryList';

interface LibraryPageProps extends RouteComponentProps<{}> {
  targetName?: string;
}

const Library: React.FC<LibraryPageProps> = (props) => {
  const { state, actions } = useContext(StoreContext);
  const { settings } = state;
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [addDialogHidden, setAddDialogHidden] = useState(true);

  props;

  useEffect(() => {
    setItems([{ name: 'foo-library', lastImported: new Date(), url: 'http://foo.goo' }]);
  }, [settings]);
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
    await actions.importLibrary(packageName, version);
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
      <ToolBar toolbarItems={toolbarItems} />
      <div css={ContentHeaderStyle}>
        <h1 css={HeaderText}>{formatMessage('External Libraries')}</h1>
      </div>
      <div css={ContentStyle} data-testid="Publish" role="main">
        <div aria-label={formatMessage('List view')} css={contentEditor} role="region">
          <Fragment>
            <LibraryList items={items} />
            {!items || items.length === 0 ? (
              <div style={{ marginLeft: '50px', fontSize: 'smaller', marginTop: '20px' }}>No publish history</div>
            ) : null}
          </Fragment>
        </div>
      </div>
    </Fragment>
  );
};

export default Library;
