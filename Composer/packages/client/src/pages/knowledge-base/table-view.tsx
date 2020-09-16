// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useRecoilValue } from 'recoil';
import inRange from 'lodash/inRange';
import React, { useEffect, useState, useCallback, Fragment } from 'react';
import {
  DetailsList,
  DetailsRow,
  DetailsListLayoutMode,
  SelectionMode,
  CheckboxVisibility,
  IDetailsGroupRenderProps,
  IGroup,
} from 'office-ui-fabric-react/lib/DetailsList';
import { GroupHeader, CollapseAllVisibility } from 'office-ui-fabric-react/lib/GroupedList';
import { IOverflowSetItemProps, OverflowSet } from 'office-ui-fabric-react/lib/OverflowSet';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { IconButton, ActionButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
import { Sticky, StickyPositionType } from 'office-ui-fabric-react/lib/Sticky';
import formatMessage from 'format-message';
import { RouteComponentProps } from '@reach/router';
import isEmpty from 'lodash/isEmpty';
import { QnAFile } from '@bfc/shared/src/types';
import { QnASection } from '@bfc/shared';
import { qnaUtil } from '@bfc/indexers';
import querystring from 'query-string';

import emptyQnAIcon from '../../images/emptyQnAIcon.svg';
import { navigateTo } from '../../utils/navigation';
import {
  dialogsState,
  qnaFilesState,
  projectIdState,
  localeState,
  settingsState,
} from '../../recoilModel/atoms/botState';
import { dispatcherState } from '../../recoilModel';
import { getBaseName } from '../../utils/fileUtil';
import { EditableField } from '../../components/EditableField';
import { classNames, AddTemplateButton } from '../../components/AllupviewComponets/styles';
import { EditQnAFromScratchModal } from '../../components/QnA';

import { formCell, content, addIcon, divider, rowDetails, icon, addAlternative } from './styles';

const noOp = () => undefined;

interface QnASectionItem extends QnASection {
  fileId: string;
  dialogId: string | undefined;
  used: boolean;
  expand: boolean;
}

interface TableViewProps extends RouteComponentProps<{}> {
  dialogId: string;
}

const TableView: React.FC<TableViewProps> = (props) => {
  const actions = useRecoilValue(dispatcherState);
  const dialogs = useRecoilValue(dialogsState);
  const qnaFiles = useRecoilValue(qnaFilesState);
  const projectId = useRecoilValue(projectIdState);
  const locale = useRecoilValue(localeState);
  const settings = useRecoilValue(settingsState);
  const {
    // createQnAImport,
    removeQnAImport,
    removeQnAFile,
    // setMessage,
    createQnAPairs,
    removeQnAPairs,
    createQnAQuestion,
    // removeQnAQuestion,
    updateQnAAnswer,
    updateQnAQuestion,
    // updateQnAFile,
  } = useRecoilValue(dispatcherState);

  // const { languages, defaultLanguage } = settings;
  console.log(settings);

  const { dialogId } = props;
  const search = props.location?.search ?? '';
  const searchContainerId = querystring.parse(search).C;

  const activeDialog = dialogs.find(({ id }) => id === dialogId);
  const targetFileId = dialogId.endsWith('.source') ? dialogId : `${dialogId}.${locale}`;
  const qnaFile = qnaFiles.find(({ id }) => id === targetFileId);
  const limitedNumber = 1;
  const generateQnASections = (file: QnAFile): QnASectionItem[] => {
    return file
      ? file.qnaSections.map((qnaSection) => {
          const qnaDialog = dialogs.find((dialog) => file.id === `${dialog.id}.${locale}`);
          return {
            fileId: file.id,
            dialogId: qnaDialog?.id,
            used: !!qnaDialog,
            expand: false,
            key: qnaSection.sectionId,
            ...qnaSection,
          };
        })
      : [];
  };
  const [editQnAFile, setEditQnAFile] = useState<QnAFile | undefined>(undefined);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [qnaSections, setQnASections] = useState<QnASectionItem[]>([]);

  const importedFileIds = qnaFile?.imports.map(({ id }) => getBaseName(id)) || [];
  const importedFiles = qnaFiles.filter(({ id }) => importedFileIds.includes(id));
  const importedSourceFiles = importedFiles.filter(({ id }) => id.endsWith('.source'));

  useEffect(() => {
    if (isEmpty(qnaFiles)) return;

    const allSections = qnaFiles
      .filter(({ id }) => id.endsWith('.source'))
      .reduce((result: any[], qnaFile) => {
        const res = generateQnASections(qnaFile);
        return result.concat(res);
      }, []);
    if (dialogId === 'all') {
      setQnASections(
        allSections.map((item, index) => {
          return {
            ...item,
            expand: index === focusedIndex,
          };
        })
      );
    } else {
      const dialogSections = allSections.filter((t) => importedFileIds.includes(t.fileId));

      setQnASections(
        dialogSections.map((item, index) => {
          return {
            ...item,
            expand: index === focusedIndex,
          };
        })
      );
    }
  }, [qnaFiles, dialogId, projectId]);

  const toggleExpandRow = (sectionId: string, expand?: boolean) => {
    const newSections = qnaSections.map((item) => {
      if (item.sectionId === sectionId) {
        return {
          ...item,
          expand: expand === undefined ? !item.expand : expand,
        };
      } else {
        return item;
      }
    });
    setQnASections(newSections);
  };

  const onUpdateQnAQuestion = (fileId: string, sectionId: string, questionId: string, content: string) => {
    if (!fileId) return;
    actions.setMessage('item deleted');
    const sectionIndex = qnaSections.findIndex((item) => item.fileId === fileId);
    setFocusedIndex(sectionIndex);

    updateQnAQuestion({
      id: fileId,
      sectionId,
      questionId,
      content,
    });
  };

  const onUpdateQnAAnswer = (fileId: string, sectionId: string, content: string) => {
    if (!fileId) return;
    actions.setMessage('item deleted');
    const sectionIndex = qnaSections.findIndex((item) => item.fileId === fileId);
    setFocusedIndex(sectionIndex);

    updateQnAAnswer({
      id: fileId,
      sectionId,
      content,
    });
  };

  const onRemoveQnAPairs = (fileId: string, sectionId: string) => {
    if (!fileId) return;
    actions.setMessage('item deleted');
    const sectionIndex = qnaSections.findIndex((item) => item.fileId === fileId);
    setFocusedIndex(sectionIndex);

    removeQnAPairs({
      id: fileId,
      sectionId,
    });
  };

  const onCreateNewQnAPairs = (fileId: string | undefined) => {
    if (!fileId) return;
    const newQnAPair = qnaUtil.generateQnAPair();
    const sectionIndex = qnaSections.findIndex((item) => item.fileId === fileId);
    setFocusedIndex(sectionIndex + 1);
    createQnAPairs({ id: fileId, content: newQnAPair });
  };

  const onCreateNewQuestion = (fileId, sectionId) => {
    if (!fileId || !sectionId) return;
    const sectionIndex = qnaSections.findIndex((item) => item.sectionId === sectionId);
    setFocusedIndex(sectionIndex);

    const payload = {
      id: fileId,
      sectionId,
      content: 'Add new question',
    };
    createQnAQuestion(payload);
  };

  const onRenderGroupHeader: IDetailsGroupRenderProps['onRenderHeader'] = (props) => {
    const groupName = props?.group?.name || '';
    const containerId = props?.group?.key || '';
    const containerQnAFile = qnaFiles.find(({ id }) => id === containerId);
    const isImportedSource = containerId.endsWith('.source');

    const onRenderItem = (item: IOverflowSetItemProps): JSX.Element => {
      return <IconButton menuIconProps={{ iconName: 'Edit' }} onClick={item.onClick} />;
    };

    const onRenderOverflowButton = (overflowItems: any[] | undefined): JSX.Element => {
      return (
        <IconButton
          menuIconProps={{ iconName: 'More' }}
          menuProps={{ items: overflowItems || [] }}
          role="menuitem"
          title="More options"
        />
      );
    };

    const onRenderTitle = () => {
      return (
        <div className={classNames.groupHeader}>
          {isImportedSource && (
            <Fragment>
              <span>Source: </span>
              <Link className={classNames.groupHeaderSourceName} onClick={noOp}>
                {groupName}
              </Link>
              <OverflowSet
                aria-label={formatMessage('Edit source')}
                items={[
                  {
                    key: 'edit',
                    name: 'edit',
                    onClick: () => {
                      setEditQnAFile(containerQnAFile);
                    },
                  },
                ]}
                overflowItems={[
                  {
                    key: 'edit',
                    name: formatMessage('Show code'),
                    onClick: () => {
                      navigateTo(`/bot/${projectId}/knowledge-base/${dialogId}/edit?C=${containerId}`);
                    },
                  },
                  {
                    key: 'delete',
                    name: formatMessage('Delete knowledge base'),
                    onClick: async () => {
                      if (!qnaFile) return;
                      await removeQnAImport({ id: qnaFile.id, sourceId: containerId });
                      await removeQnAFile({ id: containerId });
                    },
                  },
                ]}
                role="menubar"
                onRenderItem={onRenderItem}
                onRenderOverflowButton={onRenderOverflowButton}
              />
            </Fragment>
          )}
          {!isImportedSource && <div>{groupName}</div>}
        </div>
      );
    };
    if (props) {
      return (
        <Fragment>
          <GroupHeader {...props} selectionMode={SelectionMode.none} onRenderTitle={onRenderTitle}></GroupHeader>
          <div>
            <ActionButton
              data-testid={'addQnAPairButton'}
              iconProps={{ iconName: 'Add', styles: addIcon }}
              styles={AddTemplateButton}
              onClick={() => {
                onCreateNewQnAPairs(props.group?.key);
                actions.setMessage('item added');
              }}
            >
              {formatMessage('Add QnA Pair')}
            </ActionButton>
          </div>
          <div css={divider}> </div>
        </Fragment>
      );
    }

    return null;
  };

  const getTableColums = () => {
    const tableColums = [
      {
        key: 'ToggleShowAll',
        name: '',
        fieldName: 'Chevron',
        minWidth: 40,
        maxWidth: 40,
        isResizable: true,
        onRender: (item) => {
          return (
            <IconButton
              ariaLabel="ChevronDown"
              iconProps={{ iconName: item.expand ? 'ChevronDown' : 'ChevronRight' }}
              styles={icon}
              title="ChevronDown"
              onClick={() => toggleExpandRow(item.sectionId)}
            />
          );
        },
      },
      {
        key: 'Question',
        name: formatMessage('Question'),
        fieldName: 'question',
        minWidth: 250,
        maxWidth: 450,
        isResizable: true,
        data: 'string',
        onRender: (item: QnASectionItem) => {
          const questions = item.Questions;
          const showingQuestions = item.expand ? questions : questions.slice(0, limitedNumber);
          //This question content of this qna Section is '#?'
          // const isQuestionEmpty = showingQuestions.length === 1 && showingQuestions[0].content === '';
          const isSourceSectionInDialog = item.fileId.endsWith('.source') && !dialogId.endsWith('.source');
          const isAllowEdit = dialogId !== 'all' && !isSourceSectionInDialog;

          const addQuestionButton = (
            <ActionButton
              iconProps={{ iconName: 'Add', styles: addIcon }}
              styles={addAlternative}
              onClick={(e) => onCreateNewQuestion(item.fileId, item.sectionId)}
            >
              {formatMessage('add alternative phrasing')}
            </ActionButton>
          );

          return (
            <div data-is-focusable css={formCell}>
              {showingQuestions.map((question) => {
                return (
                  <EditableField
                    key={question.id}
                    ariaLabel={formatMessage(`Question is {content}`, { content: question.content })}
                    depth={0}
                    disabled={isAllowEdit}
                    id={question.id}
                    name={question.content}
                    value={question.content}
                    onBlur={(_id, value) => {
                      const newValue = value?.trim().replace(/^#/, '');
                      const isChanged = question.content !== newValue;
                      if (newValue && isChanged) {
                        onUpdateQnAQuestion(item.fileId, item.sectionId, question.id, newValue);
                      }
                    }}
                    onChange={() => {}}
                  />
                );
              })}
              {!item.expand && <span> ({questions.length})</span>}
              {addQuestionButton}
            </div>
          );
        },
      },
      {
        key: 'Answer',
        name: formatMessage('Answer'),
        fieldName: 'answer',
        minWidth: 250,
        maxWidth: 450,
        isResizable: true,
        data: 'string',
        onRender: (item) => {
          const isSourceSectionInDialog = item.fileId.endsWith('.source') && !dialogId.endsWith('.source');
          const isAllowEdit = dialogId !== 'all' && !isSourceSectionInDialog;
          return (
            <div data-is-focusable css={formCell}>
              <EditableField
                multiline
                ariaLabel={formatMessage(`Answer is {content}`, { content: item.Answer })}
                depth={0}
                disabled={isAllowEdit}
                id={item.sectionId}
                name={item.Answer}
                value={item.Answer}
                onBlur={(_id, value) => {
                  const newValue = value?.trim().replace(/^#/, '');
                  const isChanged = item.Answer !== newValue;
                  if (newValue && isChanged) {
                    onUpdateQnAAnswer(item.fileId, item.sectionId, newValue);
                  }
                }}
                onChange={() => {}}
              />
            </div>
          );
        },
      },
    ];
    if (dialogId !== 'all') {
      const extraOperations = {
        key: 'buttons',
        name: '',
        minWidth: 50,
        maxWidth: 50,
        isResizable: true,
        fieldName: 'buttons',
        data: 'string',
        onRender: (item) => {
          return (
            <IconButton
              ariaLabel="Delete"
              iconProps={{ iconName: 'Delete' }}
              styles={icon}
              title="Delete"
              onClick={() => {
                onRemoveQnAPairs(item.fileId, item.sectionId);
              }}
            />
          );
        },
      };
      tableColums.splice(3, 0, extraOperations);
    }

    // all view, show used in column
    if (dialogId === 'all') {
      const beenUsedColumn = {
        key: 'usedIn',
        name: formatMessage('Used In'),
        fieldName: 'usedIn',
        minWidth: 100,
        maxWidth: 100,
        isResizable: true,
        isCollapsable: true,
        data: 'string',
        onRender: (item) => {
          return (
            <div data-is-focusable css={formCell}>
              <div aria-label={formatMessage(`id is {id}`, { id: item.dialogId })} css={content} tabIndex={-1}>
                {item.dialogId}
              </div>
            </div>
          );
        },
      };
      tableColums.splice(3, 0, beenUsedColumn);
    }
    return tableColums;
  };

  const getGroups = (): IGroup[] | undefined => {
    if (dialogId === 'all') {
      const groups: IGroup[] = [];
      qnaFiles.forEach((currentFile) => {
        const lastGroup = groups[groups.length - 1];
        const startIndex = lastGroup ? lastGroup.startIndex + lastGroup.count : 0;
        const { id, qnaSections } = currentFile;
        const count = qnaSections.length;
        const shouldExpand = inRange(focusedIndex, startIndex, startIndex + count) || searchContainerId === id;
        groups.push({
          key: id,
          name: getBaseName(id),
          startIndex,
          count,
          level: 0,
          isCollapsed: !shouldExpand,
        });
      });
      return groups;
    } else {
      if (!qnaFile) return undefined;
      const groups: IGroup[] = [
        {
          key: qnaFile.id,
          name: activeDialog?.displayName || dialogId,
          startIndex: 0,
          count: qnaFile.qnaSections.length,
          level: 0,
          isCollapsed: !inRange(focusedIndex, 0, qnaFile.qnaSections.length),
        },
      ];
      importedSourceFiles.forEach((currentFile) => {
        const lastGroup = groups[groups.length - 1];
        const startIndex = lastGroup.startIndex + lastGroup.count;
        const { id, qnaSections } = currentFile;
        const count = qnaSections.length;
        const shouldExpand = inRange(focusedIndex, startIndex, startIndex + count) || searchContainerId === id;
        const name = getBaseName(id);
        groups.push({ key: id, name, startIndex, count, level: 0, isCollapsed: !shouldExpand });
      });

      return groups;
    }
  };

  const onRenderDetailsHeader = useCallback(
    (props, defaultRender) => {
      return (
        <div data-testid="tableHeader">
          <Sticky isScrollSynced stickyPosition={StickyPositionType.Header}>
            {defaultRender({
              ...props,
              isCollapsable: false,

              onRenderColumnHeaderTooltip: (tooltipHostProps) => <TooltipHost {...tooltipHostProps} />,
            })}
          </Sticky>
        </div>
      );
    },
    [dialogId]
  );

  const onRenderRow = useCallback(
    (props) => {
      if (props) {
        return <DetailsRow {...props} styles={rowDetails} tabIndex={props.itemIndex} />;
      }
      return null;
    },
    [dialogId]
  );

  if (qnaFile?.empty) {
    return (
      <div className={classNames.emptyTableList} data-testid={'table-view-empty'}>
        <div className={classNames.emptyTableListCenter}>
          <img
            alt={formatMessage('Empty QnA Icon')}
            aria-label={formatMessage('Empty QnA Icon')}
            src={emptyQnAIcon}
            style={{ marginLeft: '9px' }}
          />
          <p>{formatMessage('Create a knowledge base from scratch or import knowledge from a URL or PDF files')}</p>
          <PrimaryButton
            data-testid={'createKnowledgeBase'}
            text={formatMessage('Create new KB')}
            onClick={() => {
              actions.createQnAFromScratchDialogBegin(() => undefined);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div data-testid={'table-view'}>
      <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
        <DetailsList
          checkboxVisibility={CheckboxVisibility.hidden}
          columns={getTableColums()}
          groupProps={{
            onRenderHeader: onRenderGroupHeader,
            collapseAllVisibility: CollapseAllVisibility.hidden,
          }}
          groups={getGroups()}
          initialFocusedIndex={focusedIndex}
          items={qnaSections}
          layoutMode={DetailsListLayoutMode.justified}
          selectionMode={SelectionMode.none}
          onRenderDetailsHeader={onRenderDetailsHeader}
          onRenderRow={onRenderRow}
        />
      </ScrollablePane>
      {editQnAFile && (
        <EditQnAFromScratchModal
          qnaFile={editQnAFile}
          qnaFiles={qnaFiles}
          onDismiss={() => {
            setEditQnAFile(undefined);
          }}
          onSubmit={async ({ name }) => {
            const newId = `${name}.source`;
            await actions.renameQnAKB({ id: editQnAFile.id, name: newId });
            if (!qnaFile) return;
            await actions.removeQnAImport({ id: qnaFile.id, sourceId: editQnAFile.id });
            await actions.createQnAImport({ id: qnaFile.id, sourceId: newId });
            setEditQnAFile(undefined);
          }}
        ></EditQnAFromScratchModal>
      )}
    </div>
  );
};

export default TableView;
