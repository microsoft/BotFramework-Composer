// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useContext, useRef, useEffect, useState } from 'react';
import debounce from 'lodash/debounce';
import isEmpty from 'lodash/isEmpty';
import { DetailsList, DetailsListLayoutMode, SelectionMode } from 'office-ui-fabric-react/lib/DetailsList';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
import { Sticky, StickyPositionType } from 'office-ui-fabric-react/lib/Sticky';
import formatMessage from 'format-message';
import { NeutralColors, FontSizes } from '@uifabric/fluent-theme';
import { DialogInfo, LgFile } from '@bfc/shared';
import { LGTemplate } from 'botbuilder-lg';

import { StoreContext } from '../../store';
import * as lgUtil from '../../utils/lgUtil';
import { navigateTo } from '../../utils';
import { actionButton, formCell } from '../language-understanding/styles';

interface TableViewProps {
  file: LgFile;
  activeDialog?: DialogInfo;
  onClickEdit: (template: LGTemplate) => void;
}

const TableView: React.FC<TableViewProps> = props => {
  const { state, actions } = useContext(StoreContext);
  const { dialogs } = state;
  const { file: lgFile, activeDialog, onClickEdit } = props;
  const createLgTemplate = useRef(debounce(actions.createLgTemplate, 500)).current;
  const copyLgTemplate = useRef(debounce(actions.copyLgTemplate, 500)).current;
  const removeLgTemplate = useRef(debounce(actions.removeLgTemplate, 500)).current;
  const [templates, setTemplates] = useState<LGTemplate[]>([]);
  const listRef = useRef(null);

  useEffect(() => {
    if (isEmpty(lgFile)) return;
    let allTemplates: LGTemplate[] = [];
    try {
      allTemplates = lgUtil.parse(lgFile.content);
      // mute lg file invalid cause page crash, setState is async, this component may render at first
    } catch (error) {
      console.error(error);
    }

    if (!activeDialog) {
      setTemplates(allTemplates);
    } else {
      const dialogsTemplates: LGTemplate[] = [];
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
        templateUsedInDialogMap[template.Name] = dialogs.reduce<string[]>((result, dialog) => {
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
    const newName = lgUtil.increaseNameUtilNotExist(templates, 'TemplateName');
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
    const Name = templates[index].Name;
    const resolvedName = lgUtil.increaseNameUtilNotExist(templates, `${Name}_Copy`);
    const payload = {
      file: lgFile,
      fromTemplateName: Name,
      toTemplateName: resolvedName,
    };
    copyLgTemplate(payload);
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
};

export default TableView;
