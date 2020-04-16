// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, Fragment } from 'react';
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

import { detailListContainer, listHeader, rowDetails, rowTitle, optionRoot, optionIcon } from './styles';

export function CreateOptions(props) {
  const [option, setOption] = useState('CreateFromScratch');
  const [disabled, setDisabled] = useState(true);
  const { templates, onDismiss, onNext } = props;
  const emptyBotKey = templates[1].id;
  const [template, setTemplate] = useState(emptyBotKey);
  const selection = new Selection({
    onSelectionChanged: () => {
      const t = selection.getSelection()[0];
      if (t) {
        setTemplate(t.id);
      }
    },
  });

  function SelectOption(props) {
    const { checked, text, key } = props;
    return (
      <div css={optionRoot} key={key}>
        <Icon css={optionIcon(checked)} iconName={checked ? 'CompletedSolid' : 'RadioBtnOff'} />
        <span>{text}</span>
      </div>
    );
  }

  const handleChange = (event, option) => {
    setOption(option.key);
    if (option.key === 'CreateFromTemplate') {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  };

  const handleJumpToNext = () => {
    if (option === 'CreateFromTemplate') {
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
      onRender: (item) => item.name,
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
      onRender: (item) => item.description,
    },
  ];

  const onRenderDetailsHeader = (props, defaultRender) => {
    return (
      <Sticky isScrollSynced stickyPosition={StickyPositionType.Header}>
        {defaultRender({
          ...props,
        })}
      </Sticky>
    );
  };
  const onRenderRow = (props) => {
    if (props) {
      return (
        <DetailsRow {...props} data-testid={props.item.id} styles={rowDetails(disabled)} tabIndex={props.itemIndex} />
      );
    }
    return null;
  };
  return (
    <Fragment>
      <ChoiceGroup
        defaultSelectedKey="CreateFromScratch"
        label={formatMessage('Choose how to create your bot')}
        onChange={handleChange}
        options={[
          {
            ariaLabel: 'Create from scratch',
            key: 'CreateFromScratch',
            'data-testid': 'Create from scratch',
            text: formatMessage('Create from scratch'),
            onRenderField: SelectOption,
          },
          {
            ariaLabel: 'Create from template',
            key: 'CreateFromTemplate',
            'data-testid': 'Create from template',
            text: formatMessage('Create from template'),
            onRenderField: SelectOption,
          },
        ]}
        required
      />
      <h3 css={listHeader}>{formatMessage('Examples')}</h3>
      <div css={detailListContainer} data-is-scrollable="true">
        <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
          <DetailsList
            checkboxVisibility={CheckboxVisibility.hidden}
            columns={tableColums}
            compact={false}
            getKey={(item) => item.name}
            isHeaderVisible
            items={templates}
            layoutMode={DetailsListLayoutMode.justified}
            onRenderDetailsHeader={onRenderDetailsHeader}
            onRenderRow={onRenderRow}
            selection={selection}
            selectionMode={disabled ? SelectionMode.none : SelectionMode.single}
          />
        </ScrollablePane>
      </div>
      <DialogFooter>
        <DefaultButton onClick={onDismiss} text={formatMessage('Cancel')} />
        <PrimaryButton
          data-testid="NextStepButton"
          disabled={option === 'CreateFromTemplate' && (templates.length <= 0 || template === null)}
          onClick={handleJumpToNext}
          text={formatMessage('Next')}
        />
      </DialogFooter>
    </Fragment>
  );
}
