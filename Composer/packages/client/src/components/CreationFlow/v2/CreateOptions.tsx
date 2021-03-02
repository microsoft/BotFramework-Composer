// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useState, Fragment, useEffect, useMemo } from 'react';
import find from 'lodash/find';
import formatMessage from 'format-message';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
import { Selection } from 'office-ui-fabric-react/lib/DetailsList';
import {
  DetailsList,
  DetailsListLayoutMode,
  SelectionMode,
  CheckboxVisibility,
  DetailsRow,
} from 'office-ui-fabric-react/lib/DetailsList';
import { BotTemplate, QnABotTemplateId } from '@bfc/shared';
import { DialogWrapper, DialogTypes } from '@bfc/ui-shared';
import { NeutralColors } from '@uifabric/fluent-theme';
import { RouteComponentProps } from '@reach/router';
import { IPivotItemProps, Pivot, PivotItem } from 'office-ui-fabric-react/lib/Pivot';
import { csharpFeedKey } from '@botframework-composer/types';
import { useRecoilValue } from 'recoil';

import { DialogCreationCopy, EmptyBotTemplateId, feedDictionary } from '../../../constants';
import { selectedTemplateReadMeState } from '../../../recoilModel';
import TelemetryClient from '../../../telemetry/TelemetryClient';

import { TemplateDetailView } from './TemplateDetailView';

// -------------------- Styles -------------------- //

const detailListContainer = css`
  width: 48%;
  padding-right: 2%;
  height: 400px;
  overflow: hidden;
  float: left;
  flex-grow: 1;
`;

const templateDetailContainer = css`
  width: 48%;
  padding-right: 2%;
  height: 400px;
  overflow: auto;
  flex-grow: 1;
  float: left;
`;

const pickerContainer = css`
  position: relative;
  height: 400px;
  border: 1px solid #f3f2f1;
`;

const rowDetails = (disabled) => {
  return {
    root: {
      color: disabled ? NeutralColors.gray80 : NeutralColors.black,
      selectors: {
        '&:hover': {
          background: disabled ? NeutralColors.white : NeutralColors.gray30,
          color: disabled ? NeutralColors.gray80 : NeutralColors.black,
        },
        '&.ms-DetailsRow.is-selected': {
          background: disabled ? NeutralColors.white : NeutralColors.gray30,
          color: disabled ? NeutralColors.gray80 : NeutralColors.black,
        },
      },
    },
  };
};

const rowTitle = (disabled) => {
  return {
    cellTitle: {
      color: disabled ? NeutralColors.gray80 : NeutralColors.black,
      selectors: {
        ':hover': {
          background: disabled ? NeutralColors.white : NeutralColors.gray30,
          color: disabled ? NeutralColors.gray80 : NeutralColors.black,
        },
      },
    },
  };
};

const tableCell = css`
  outline: none;
  :focus {
    outline: rgb(102, 102, 102) solid 1px;
  }
`;

const content = css`
  outline: none;
`;

const optionKeys = {
  createFromScratch: 'createFromScratch',
  createFromQnA: 'createFromQnA',
  createFromTemplate: 'createFromTemplate',
};

// -------------------- CreateOptions -------------------- //
type CreateOptionsProps = {
  templates: BotTemplate[];
  onDismiss: () => void;
  onNext: (data: string) => void;
  fetchTemplates: (feedUrls?: string[]) => Promise<void>;
  fetchReadMe: (moduleName: string) => {};
} & RouteComponentProps<{}>;

export function CreateOptionsV2(props: CreateOptionsProps) {
  const [option] = useState(optionKeys.createFromTemplate);
  const [disabled] = useState(false);
  const { templates, onDismiss, onNext } = props;
  const [currentTemplate, setCurrentTemplate] = useState('');
  const [emptyBotKey, setEmptyBotKey] = useState('');
  const [selectedFeed, setSelectedFeed] = useState<{ props: IPivotItemProps }>({ props: { itemKey: csharpFeedKey } });
  const readMe = useRecoilValue(selectedTemplateReadMeState);

  const selectedTemplate = useMemo(() => {
    return new Selection({
      onSelectionChanged: () => {
        const t = selectedTemplate.getSelection()[0] as BotTemplate;
        if (t) {
          setCurrentTemplate(t.id);
        }
      },
    });
  }, []);

  const handleJumpToNext = () => {
    let routeToTemplate = emptyBotKey;
    if (option === optionKeys.createFromTemplate) {
      routeToTemplate = currentTemplate;
    }

    if (option === optionKeys.createFromQnA) {
      routeToTemplate = QnABotTemplateId;
    }

    // if (props.location && props.location.search) {
    //   routeToTemplate += props.location.search;
    // }

    TelemetryClient.track('CreateNewBotProjectNextButton', { template: routeToTemplate });

    onNext(routeToTemplate + props?.location?.search);
  };

  const tableColumns = [
    {
      key: 'name',
      name: formatMessage('Name'),
      fieldName: 'name',
      minWidth: 150,
      maxWidth: 200,
      isResizable: !disabled,
      data: 'string',
      styles: rowTitle(disabled),
      onRender: (item) => (
        <div data-is-focusable css={tableCell}>
          <div css={content} tabIndex={-1}>
            {item.name}
          </div>
        </div>
      ),
    },
  ];

  const onRenderRow = (props) => {
    if (!props) return null;
    return (
      <DetailsRow {...props} data-testid={props.item.id} styles={rowDetails(disabled)} tabIndex={props.itemIndex} />
    );
  };

  useEffect(() => {
    if (templates.length > 1) {
      const emptyBotTemplate = find(templates, ['id', EmptyBotTemplateId]);
      if (emptyBotTemplate) {
        setCurrentTemplate(emptyBotTemplate.id);
        setEmptyBotKey(emptyBotTemplate.id);
      }
    }
  }, [templates]);

  useEffect(() => {
    if (selectedFeed?.props?.itemKey) {
      props.fetchTemplates([feedDictionary[selectedFeed.props.itemKey]]);
    }
  }, [selectedFeed]);

  useEffect(() => {
    if (currentTemplate) {
      props.fetchReadMe(currentTemplate);
    }
  }, [currentTemplate]);

  return (
    <Fragment>
      <DialogWrapper
        isOpen
        {...DialogCreationCopy.CREATE_NEW_BOT_V2}
        dialogType={DialogTypes.CreateFlow}
        onDismiss={onDismiss}
      >
        <Pivot
          defaultSelectedKey={csharpFeedKey}
          onLinkClick={(item) => {
            if (item) {
              setSelectedFeed(item);
            }
          }}
        >
          <PivotItem headerText="C#" itemKey={csharpFeedKey}></PivotItem>
        </Pivot>
        <div css={pickerContainer}>
          <div css={detailListContainer} data-is-scrollable="true" id="templatePickerContainer">
            <ScrollablePane
              scrollbarVisibility={ScrollbarVisibility.auto}
              styles={{ root: { width: '100%', height: 'inherit', position: 'relative' } }}
            >
              <DetailsList
                checkboxVisibility={CheckboxVisibility.hidden}
                columns={tableColumns}
                compact={false}
                getKey={(item) => item.name}
                isHeaderVisible={false}
                items={templates}
                layoutMode={DetailsListLayoutMode.justified}
                selection={selectedTemplate}
                selectionMode={disabled ? SelectionMode.none : SelectionMode.single}
                onRenderRow={onRenderRow}
              />
            </ScrollablePane>
          </div>
          <div css={templateDetailContainer} data-is-scrollable="true">
            <TemplateDetailView readMe={readMe} templateId={currentTemplate} />
          </div>
        </div>
        <DialogFooter>
          <DefaultButton text={formatMessage('Cancel')} onClick={onDismiss} />
          <PrimaryButton
            data-testid="NextStepButton"
            disabled={option === optionKeys.createFromTemplate && (templates.length <= 0 || currentTemplate === null)}
            text={formatMessage('Next')}
            onClick={handleJumpToNext}
          />
        </DialogFooter>
      </DialogWrapper>
    </Fragment>
  );
}
