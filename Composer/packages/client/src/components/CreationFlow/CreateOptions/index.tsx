// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, Fragment, useEffect, useMemo } from 'react';
import formatMessage from 'format-message';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { ChoiceGroup } from 'office-ui-fabric-react/lib/ChoiceGroup';
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
import { Sticky, StickyPositionType } from 'office-ui-fabric-react/lib/Sticky';
import { ProjectTemplate } from '@bfc/shared';

import { styles as wizardStyles } from '../StepWizard/styles';
import { DialogCreationCopy } from '../../../constants';
import { DialogWrapper } from '../../DialogWrapper';

import {
  detailListContainer,
  listHeader,
  rowDetails,
  rowTitle,
  optionRoot,
  optionIcon,
  tableCell,
  content,
} from './styles';

const optionKeys = {
  createFromScratch: 'createFromScratch',
  createFromTemplate: 'createFromTemplate',
};

export function CreateOptions(props) {
  const [option, setOption] = useState(optionKeys.createFromScratch);
  const [disabled, setDisabled] = useState(true);
  const { templates, onDismiss, onNext } = props;
  const [template, setTemplate] = useState('');
  const [emptyBotKey, setEmptyBotKey] = useState('');

  const selection = useMemo(() => {
    return new Selection({
      onSelectionChanged: () => {
        const t = selection.getSelection()[0] as ProjectTemplate;
        if (t) {
          setTemplate(t.id);
        }
      },
    });
  }, [templates]);

  function SelectOption(props) {
    const { checked, text, key } = props;
    return (
      <div key={key} css={optionRoot}>
        <Icon iconName={checked ? 'CompletedSolid' : 'RadioBtnOff'} css={optionIcon(checked)} />
        <span>{text}</span>
      </div>
    );
  }

  const handleChange = (event, option) => {
    setOption(option.key);
    if (option.key === optionKeys.createFromTemplate) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  };

  const handleJumpToNext = () => {
    if (option === optionKeys.createFromTemplate) {
      onNext(template);
    } else {
      onNext(emptyBotKey);
    }
  };

  const tableColums = [
    {
      key: 'name',
      name: formatMessage('Name'),
      fieldName: 'name',
      minWidth: 150,
      maxWidth: 200,
      isResizable: !disabled,
      data: 'string',
      styles: rowTitle(disabled),
      onRender: item => (
        <div css={tableCell} data-is-focusable={true}>
          <div css={content} tabIndex={-1}>
            {item.name}
          </div>
        </div>
      ),
    },
    {
      key: 'description',
      name: formatMessage('Description'),
      fieldName: 'dateModifiedValue',
      minWidth: 200,
      maxWidth: 450,
      isResizable: !disabled,
      data: 'string',
      styles: rowTitle(disabled),
      onRender: item => (
        <div css={tableCell} data-is-focusable={true}>
          <div css={content} tabIndex={-1}>
            {item.description}
          </div>
        </div>
      ),
    },
  ];

  const onRenderDetailsHeader = (props, defaultRender) => {
    return (
      <Sticky stickyPosition={StickyPositionType.Header} isScrollSynced={true}>
        {defaultRender({
          ...props,
        })}
      </Sticky>
    );
  };
  const onRenderRow = props => {
    if (props) {
      return (
        <DetailsRow {...props} styles={rowDetails(disabled)} data-testid={props.item.id} tabIndex={props.itemIndex} />
      );
    }
    return null;
  };

  useEffect(() => {
    if (templates.length > 1) {
      const emptyBotKey = templates[1] && templates[1].id;
      setTemplate(emptyBotKey);
      setEmptyBotKey(emptyBotKey);
    }
  }, [templates]);

  const choiceOptions = [
    {
      ariaLabel: 'Create from scratch' + (option === optionKeys.createFromScratch ? ' selected' : ''),
      key: optionKeys.createFromScratch,
      'data-testid': 'Create from scratch',
      text: formatMessage('Create from scratch'),
      onRenderField: SelectOption,
    },
    {
      ariaLabel: 'Create from template' + (option === optionKeys.createFromTemplate ? ' selected' : ''),
      key: optionKeys.createFromTemplate,
      'data-testid': 'Create from template',
      text: formatMessage('Create from template'),
      onRenderField: SelectOption,
    },
  ];

  return (
    <Fragment>
      <DialogWrapper
        isOpen={true}
        {...DialogCreationCopy.CREATE_NEW_BOT}
        onDismiss={onDismiss}
        overrideStyles={wizardStyles}
      >
        <ChoiceGroup
          label={formatMessage('Choose how to create your bot')}
          selectedKey={option}
          options={choiceOptions}
          onChange={handleChange}
        />
        <h3 css={listHeader}>{formatMessage('Examples')}</h3>
        <div data-is-scrollable="true" css={detailListContainer}>
          <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
            <DetailsList
              items={templates}
              compact={false}
              columns={tableColums}
              getKey={item => item.name}
              layoutMode={DetailsListLayoutMode.justified}
              isHeaderVisible={true}
              selectionMode={disabled ? SelectionMode.none : SelectionMode.single}
              checkboxVisibility={CheckboxVisibility.hidden}
              onRenderDetailsHeader={onRenderDetailsHeader}
              onRenderRow={onRenderRow}
              selection={selection}
            />
          </ScrollablePane>
        </div>
        <DialogFooter>
          <DefaultButton onClick={onDismiss} text={formatMessage('Cancel')} />
          <PrimaryButton
            disabled={option === optionKeys.createFromTemplate && (templates.length <= 0 || template === null)}
            onClick={handleJumpToNext}
            text={formatMessage('Next')}
            data-testid="NextStepButton"
          />
        </DialogFooter>
      </DialogWrapper>
    </Fragment>
  );
}
