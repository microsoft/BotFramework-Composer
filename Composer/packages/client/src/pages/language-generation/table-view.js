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
/* eslint-disable react/display-name */
import React, { useContext, useRef, useEffect, useState } from 'react';
import { PropTypes } from 'prop-types';
import { debounce, isEmpty } from 'lodash';
import { DetailsList, DetailsListLayoutMode, SelectionMode } from 'office-ui-fabric-react/lib/DetailsList';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { IconButton } from 'office-ui-fabric-react';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
import { Sticky, StickyPositionType } from 'office-ui-fabric-react/lib/Sticky';
import formatMessage from 'format-message';
import { NeutralColors, FontSizes } from '@uifabric/fluent-theme';

import { StoreContext } from '../../store';
import * as lgUtil from '../../utils/lgUtil';
import { navigateTo } from '../../utils';
import { actionButton, formCell } from '../language-understanding/styles';

export default function TableView(props) {
  const { state, actions } = useContext(StoreContext);
  const { dialogs } = state;
  const { file: lgFile, activeDialog, onClickEdit } = props;
  const createLgTemplate = useRef(debounce(actions.createLgTemplate, 500)).current;
  const removeLgTemplate = useRef(debounce(actions.removeLgTemplate, 500)).current;
  const [templates, setTemplates] = useState([]);
  const listRef = useRef(null);

  useEffect(() => {
    if (isEmpty(lgFile)) return;

    const allTemplates = lgUtil.parse(lgFile.content).map((template, templateIndex) => {
      return {
        ...template,
        index: templateIndex,
      };
    });

    if (!activeDialog) {
      setTemplates(allTemplates);
    } else {
      const dialogsTemplates = [];
      activeDialog.lgTemplates.forEach(item => {
        const template = allTemplates.find(t => t.Name === item);
        if (template) {
          dialogsTemplates.push(template);
        }
      });
      setTemplates(dialogsTemplates);
    }
  }, [lgFile, activeDialog]);

  const getTemplatesMoreButtons = (item, index) => {
    const buttons = [
      {
        key: 'edit',
        name: formatMessage('Edit'),
        onClick: () => {
          onClickEdit(templates[index]);
        },
      },
      {
        key: 'delete',
        name: formatMessage('Delete'),
        onClick: () => {
          onRemoveTemplate(index);
        },
      },
      {
        key: 'copy',
        name: formatMessage('Make a copy'),
        onClick: () => {
          onCopyTemplate(index);
        },
      },
    ];

    // do not allow delete/copy template in particular dialog
    if (activeDialog) {
      buttons.splice(1, 2);
    }

    return buttons;
  };

  const getTableColums = () => {
    const tableColums = [
      {
        key: 'name',
        name: formatMessage('Name'),
        fieldName: 'name',
        minWidth: 100,
        maxWidth: 150,
        isResizable: true,
        data: 'string',
        onRender: item => {
          return <div css={formCell}>#{item.Name}</div>;
        },
      },
      {
        key: 'responses',
        name: formatMessage('Responses'),
        fieldName: 'responses',
        minWidth: 500,
        isResizable: true,
        data: 'string',
        isPadded: true,
        onRender: item => {
          return <div css={formCell}>{item.Body}</div>;
        },
      },

      {
        key: 'buttons',
        name: '',
        minWidth: 50,
        maxWidth: 50,
        fieldName: 'buttons',
        data: 'string',
        onRender: (item, index) => {
          return (
            <IconButton
              menuIconProps={{ iconName: 'MoreVertical' }}
              menuProps={{
                shouldFocusOnMount: true,
                items: getTemplatesMoreButtons(item, index),
              }}
              styles={{ menuIcon: { color: NeutralColors.black, fontSize: FontSizes.size16 } }}
            />
          );
        },
      },
    ];

    // all view, show used in column
    if (!activeDialog) {
      const templateUsedInDialogMap = {};

      // build usedIn map
      templates.forEach(template => {
        templateUsedInDialogMap[template.Name] = dialogs.reduce((result, dialog) => {
          if (dialog.lgTemplates.includes(template.Name)) {
            result.push(dialog.id);
          }
          return result;
        }, []);
      });

      const usedInColumn = {
        key: 'usedIn',
        name: formatMessage('Used in:'),
        fieldName: 'usedIn',
        minWidth: 100,
        maxWidth: 200,
        data: 'string',
        onRender: item => {
          const usedDialogsLinks = templateUsedInDialogMap[item.Name].map(id => {
            return (
              <div key={id} onClick={() => navigateTo(`/dialogs/${id}`)}>
                <Link>{id}</Link>
              </div>
            );
          });

          return <div>{usedDialogsLinks}</div>;
        },
      };

      tableColums.splice(2, 0, usedInColumn);
    }

    return tableColums;
  };

  function onRenderDetailsHeader(props, defaultRender) {
    return (
      <div data-testid="tableHeader">
        <Sticky stickyPosition={StickyPositionType.Header} isScrollSynced={true}>
          {defaultRender({
            ...props,
            onRenderColumnHeaderTooltip: tooltipHostProps => <TooltipHost {...tooltipHostProps} />,
          })}
        </Sticky>
      </div>
    );
  }
  function onRenderDetailsFooter() {
    // do not allow add template in particular dialog
    // cause new tempalte is not used by this dialog yet.
    if (activeDialog) return <div />;

    return (
      <div data-testid="tableFooter">
        <ActionButton css={actionButton} iconProps={{ iconName: 'CirclePlus' }} onClick={() => onCreateNewTemplate()}>
          {formatMessage('New template')}
        </ActionButton>
      </div>
    );
  }

  function onCreateNewTemplate() {
    const copyName = 'TemplateName';

    // if duplicate, increse name with TemplateName1 TemplateName2 ...
    let repeatIndex = 0;
    let newName = copyName;
    while (templates.findIndex(item => item.Name === newName) !== -1) {
      repeatIndex += 1;
      newName = copyName + repeatIndex.toString();
    }
    const payload = {
      file: lgFile,
      template: {
        Name: newName,
        Body: '-TemplateValue',
      },
    };
    createLgTemplate(payload);
  }

  function onRemoveTemplate(index) {
    const payload = {
      file: lgFile,
      templateName: templates[index].Name,
    };

    removeLgTemplate(payload);
  }

  function onCopyTemplate(index) {
    const newItems = [...templates];
    const copyName = `${newItems[index].Name}.Copy`;

    // if duplicate, increse name with Copy1 Copy2 ...
    let repeatIndex = 0;
    let newName = copyName;

    while (templates.findIndex(item => item.Name === newName) !== -1) {
      repeatIndex += 1;
      newName = copyName + repeatIndex.toString();
    }

    const payload = {
      file: lgFile,
      template: {
        Name: newName,
        Body: newItems[index].Body,
      },
    };
    createLgTemplate(payload);
  }

  return (
    <div className={'table-view'} data-testid={'table-view'}>
      <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
        <DetailsList
          componentRef={listRef}
          items={templates}
          styles={{
            root: {
              overflowX: 'hidden',
              // hack for https://github.com/OfficeDev/office-ui-fabric-react/issues/8783
              selectors: {
                'div[role="row"]:hover': {
                  background: 'none',
                },
              },
            },
          }}
          className="table-view-list"
          columns={getTableColums()}
          getKey={item => item.Name}
          layoutMode={DetailsListLayoutMode.justified}
          onRenderDetailsHeader={onRenderDetailsHeader}
          onRenderDetailsFooter={onRenderDetailsFooter}
          selectionMode={SelectionMode.none}
        />
      </ScrollablePane>
    </div>
  );
}

TableView.propTypes = {
  file: PropTypes.object,
  activeDialog: PropTypes.object,
  onClickEdit: PropTypes.func,
};
