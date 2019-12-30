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

import { choiceGroup, templateItem, optionRoot, optionIcon, placeholder } from './styles';

export function CreateOptions(props) {
  const [option, setOption] = useState('create');
  const { templates, onDismiss, onNext } = props;
  const emptyBotKey = templates[1].id;
  const [template, setTemplate] = useState(emptyBotKey);
  function SelectOption(props) {
    const { checked, text, key } = props;
    return (
      <div key={key} css={optionRoot}>
        <Icon iconName={checked ? 'CompletedSolid' : 'RadioBtnOff'} css={optionIcon(checked)} />
        <span>{text}</span>
      </div>
    );
  }

  function TemplateItem(props) {
    const { checked, text, key, disabled } = props;
    return (
      <div key={key} css={templateItem(checked, disabled)}>
        <div style={{ marginLeft: '5px' }}>{text}</div>
      </div>
    );
  }

  function onRenderField(props) {
    const { checked } = props;
    return (
      <Fragment>
        <SelectOption {...props} />
        <ChoiceGroup
          styles={choiceGroup}
          options={templates.map(item => ({
            ariaLabel: item.id,
            'data-testid': item.id,
            key: item.id,
            text: item.name,
            description: item.description,
            onRenderField: TemplateItem,
            disabled: !checked,
          }))}
          onChange={handleItemChange}
          required={true}
        />
        <div css={placeholder}>
          {checked && template ? template.description : formatMessage("Select a template to see it's description.")}
        </div>
      </Fragment>
    );
  }

  const handleChange = (event, option) => {
    setOption(option.key);
  };

  const handleItemChange = (event, option) => {
    setTemplate(option.key);
  };

  const handleJumpToNext = () => {
    if (option === 'Create from template') {
      onNext(template);
    } else {
      onNext(emptyBotKey);
    }
  };

  return (
    <Fragment>
      <ChoiceGroup
        defaultSelectedKey="Create from scratch"
        options={[
          {
            key: 'Create from scratch',
            'data-testid': 'Create from scratch',
            text: formatMessage('Create from scratch'),
            onRenderField: SelectOption,
          },
          {
            key: 'Create from template',
            'data-testid': 'Create from template',
            text: formatMessage('Create from template'),
            onRenderField,
          },
        ]}
        onChange={handleChange}
        required={true}
      />
      <DialogFooter>
        <DefaultButton onClick={onDismiss} text={formatMessage('Cancel')} />
        <PrimaryButton
          disabled={option === 'import' && (templates.length <= 0 || template === null)}
          onClick={handleJumpToNext}
          text={formatMessage('Next')}
          data-testid="NextStepButton"
        />
      </DialogFooter>
    </Fragment>
  );
}
