// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useContext, useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { DetailsList, DetailsListLayoutMode, SelectionMode } from 'office-ui-fabric-react/lib/DetailsList';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
import { Sticky, StickyPositionType } from 'office-ui-fabric-react/lib/Sticky';
import formatMessage from 'format-message';
import { RouteComponentProps } from '@reach/router';
import { NeutralColors, FontSizes } from '@uifabric/fluent-theme';
import get from 'lodash/get';
import { StoreContext } from '../../store';
import { navigateTo } from '../../utils/navigation';
import { addQuestion, updateQuestion } from '../../utils/qnaUtil';
import { formCell, content, textField } from './styles';
interface TableViewProps extends RouteComponentProps<{}> {
  dialogId: string;
}

enum EditMode {
  None,
  Creating,
  Updating,
}

const TableView: React.FC<TableViewProps> = (props) => {
  const { state, actions } = useContext(StoreContext);
  const { dialogs, qnaFiles, projectId, locale } = state;
  const { dialogId } = props;
  const file = qnaFiles.find(({ id }) => id === `${dialogId}.${locale}`);
  const limitedNumber = useRef(5).current;
  const generateQnASections = (file) => {
    return get(file, 'qnaSections', []).map((qnaSection, index) => {
      const qnaDialog = dialogs.find((dialog) => file.id === `${dialog.id}.${locale}`);
      return {
        fileId: file.fileId,
        dialogId: qnaDialog?.id || '',
        used: !!qnaDialog && qnaDialog,
        indexId: index,
        ...qnaSection,
      };
    });
  };
  const allQnASections = qnaFiles.reduce((result: any[], qnaFile) => {
    const res = generateQnASections(qnaFile);
    return result.concat(res);
  }, []);

  const singleFileQnASections = generateQnASections(file);
  const qnaSections = useMemo(() => {
    if (dialogId === 'all') {
      return allQnASections;
    } else {
      return singleFileQnASections;
    }
  }, [dialogId, qnaFiles]);
  const [showAllAlternatives, setShowAllAlternatives] = useState(Array(qnaSections.length).fill(false));
  const [qnaSectionIndex, setQnASectionIndex] = useState(-1);
  const [questionIndex, setQuestionIndex] = useState(-1); //used in QnASection.Questions array
  const [question, setQuestion] = useState('');
  const [editMode, setEditMode] = useState(EditMode.None);
  const createOrUpdateQuestion = () => {
    if (question) {
      if (editMode === EditMode.Creating) {
        const updatedQnAFileContent = addQuestion(question, qnaSections, qnaSectionIndex);
        actions.updateQnaFile({ id: `${dialogId}.${locale}`, projectId, content: updatedQnAFileContent });
      }
      if (editMode === EditMode.Updating) {
        const updatedQnAFileContent = updateQuestion(question, questionIndex + 1, qnaSections, qnaSectionIndex);
        actions.updateQnaFile({ id: `${dialogId}.${locale}`, projectId, content: updatedQnAFileContent });
      }
      setEditMode(EditMode.None);
      setQnASectionIndex(-1);
      setQuestion('');
    }

    if (!question) {
      // an empty name means to cancel the operation
      cancelEditOperation();
    }
  };

  const cancelEditOperation = () => {
    setEditMode(EditMode.None);
    setQuestion('');
    setQnASectionIndex(-1);
  };

  useEffect(() => {
    setShowAllAlternatives(Array(qnaSections.length).fill(false));
  }, [dialogId, projectId]);

  const getTemplatesMoreButtons = (item, index): IContextualMenuItem[] => {
    const buttons = [
      {
        key: 'edit',
        name: 'Edit',
        onClick: () => {
          const { dialogId, indexId } = qnaSections[index];
          navigateTo(`/bot/${projectId}/qna/${dialogId}/edit?t=${indexId}`);
        },
      },
    ];
    return buttons;
  };

  const toggleShowAllAlternatives = (index) => {
    const newArray = showAllAlternatives.map((element, i) => {
      if (i === index) {
        return !element;
      } else {
        return element;
      }
    });
    setShowAllAlternatives(newArray);
  };

  const handleKeydown = (e) => {
    if (e.key === 'Enter') {
      createOrUpdateQuestion();
      setEditMode(EditMode.None);
      setQnASectionIndex(-1);
      setQuestionIndex(-1);
      e.preventDefault();
    }
    if (e.key === 'Escape') {
      setEditMode(EditMode.None);
      setQnASectionIndex(-1);
      setQuestionIndex(-1);
      e.preventDefault();
    }
  };

  const handleOnBlur = (e) => {
    createOrUpdateQuestion();
    setEditMode(EditMode.None);
    setQnASectionIndex(-1);
    setQuestionIndex(-1);
    e.preventDefault();
  };

  const handleAddingAlternatives = (index) => {
    setEditMode(EditMode.Creating);
    setQnASectionIndex(index);
    setQuestionIndex(-1);
  };

  const handleUpdateingAlternatives = (qnaSectionIndex, questionIndex, alternative) => {
    setEditMode(EditMode.Updating);
    setQuestion(alternative);
    setQnASectionIndex(qnaSectionIndex);
    setQuestionIndex(questionIndex);
  };

  const handleOnChange = (newValue, index) => {
    if (index !== qnaSectionIndex) return;
    setQuestion(newValue);
  };

  const getTableColums = () => {
    const tableColums = [
      {
        key: 'Question',
        name: formatMessage('Question'),
        fieldName: 'question',
        minWidth: 150,
        maxWidth: 250,
        isResizable: true,
        data: 'string',
        onRender: (item) => {
          return (
            <div data-is-focusable css={formCell}>
              <div
                aria-label={formatMessage(`Question is {question}`, { question: get(item, 'Questions[0]', '') })}
                css={content}
                tabIndex={-1}
              >
                {get(item, 'Questions[0]', '')}
              </div>
            </div>
          );
        },
      },
      {
        key: 'Alternatives',
        name: formatMessage('alternatives'),
        fieldName: 'alternatives',
        minWidth: 150,
        maxWidth: 250,
        isResizable: true,
        data: 'string',
        isPadded: true,
        onRender: (item, qnaIndex) => {
          const alternatives = get(item, 'Questions', []).slice(1);
          const showingAlternatives = showAllAlternatives[qnaIndex]
            ? alternatives
            : alternatives.slice(0, limitedNumber);
          return (
            <div data-is-focusable css={formCell}>
              {showingAlternatives.map((alternative, qIndex) => {
                if (qnaIndex !== qnaSectionIndex || questionIndex !== qIndex || editMode !== EditMode.Updating) {
                  return (
                    <div
                      css={content}
                      role={''}
                      tabIndex={-1}
                      onClick={(e) =>
                        dialogId !== 'all' ? handleUpdateingAlternatives(qnaIndex, qIndex, alternative) : () => { }
                      }
                      onKeyDown={(e) => {
                        e.preventDefault();
                        if (e.key === 'Enter') {
                          handleUpdateingAlternatives(qnaIndex, qIndex, alternative);
                        }
                      }}
                    >
                      {alternative}
                    </div>
                  );
                } else if (qnaIndex === qnaSectionIndex && questionIndex === qIndex && editMode === EditMode.Updating) {
                  return (
                    <TextField
                      autoFocus
                      styles={textField}
                      value={question}
                      onBlur={(e) => {
                        handleOnBlur(e);
                      }}
                      onChange={(e, newValue) => {
                        handleOnChange(newValue, qnaIndex);
                      }}
                      onKeyDown={(e) => handleKeydown(e)}
                    />
                  );
                }
              })}

              {editMode === EditMode.Creating && qnaSectionIndex === qnaIndex && dialogId !== 'all' && (
                <TextField
                  autoFocus
                  onBlur={(e) => {
                    handleOnBlur(e);
                  }}
                  onChange={(e, newValue) => {
                    e.preventDefault();
                    handleOnChange(newValue, qnaIndex);
                  }}
                  onKeyDown={(e) => handleKeydown(e)}
                />
              )}
              {!(editMode === EditMode.Creating && qnaSectionIndex === qnaIndex) && dialogId !== 'all' && (
                <Link onClick={() => handleAddingAlternatives(qnaIndex)}>
                  {formatMessage('add alternative phrasing')}
                </Link>
              )}
              <Link onClick={() => toggleShowAllAlternatives(qnaIndex)}>
                {formatMessage('showing {current} of {all}', {
                  current: showingAlternatives.length,
                  all: alternatives.length,
                })}
              </Link>
            </div>
          );
        },
      },
      {
        key: 'Answer',
        name: formatMessage('answer'),
        fieldName: 'answer',
        minWidth: 150,
        maxWidth: 350,
        isResizable: true,
        data: 'string',
        isPadded: true,
        onRender: (item) => {
          return (
            <div data-is-focusable css={formCell}>
              <div
                aria-label={formatMessage(`Answer is {answer}`, { answer: item.Answer })}
                css={content}
                tabIndex={-1}
              >
                {item.Answer}
              </div>
            </div>
          );
        },
      },
      {
        key: 'buttons',
        name: '',
        minWidth: 50,
        maxWidth: 50,
        isResizable: false,
        fieldName: 'buttons',
        data: 'string',
        onRender: (item, index) => {
          return (
            <IconButton
              ariaLabel={formatMessage('Open inline editor')}
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
    if (!dialogId) {
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
              <div aria-label={formatMessage(`id is {id}`, { id: item.id })} css={content} tabIndex={-1}>
                {item.id}
              </div>
            </div>
          );
        },
      };
      tableColums.splice(3, 0, beenUsedColumn);
    }

    return tableColums;
  };

  const onRenderDetailsHeader = useCallback((props, defaultRender) => {
    return (
      <div data-testid="tableHeader">
        <Sticky isScrollSynced stickyPosition={StickyPositionType.Header}>
          {defaultRender({
            ...props,
            onRenderColumnHeaderTooltip: (tooltipHostProps) => <TooltipHost {...tooltipHostProps} />,
          })}
        </Sticky>
      </div>
    );
  }, []);

  const getKeyCallback = useCallback((item) => item.name, []);
  return (
    <div className={'table-view'} data-testid={'table-view'}>
      <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
        <DetailsList
          className="table-view-list"
          columns={getTableColums()}
          getKey={getKeyCallback}
          //initialFocusedIndex={0}
          items={qnaSections}
          // getKey={item => item.name}
          layoutMode={DetailsListLayoutMode.justified}
          selectionMode={SelectionMode.none}
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
          onRenderDetailsHeader={onRenderDetailsHeader}
        />
      </ScrollablePane>
    </div>
  );
};

export default TableView;
