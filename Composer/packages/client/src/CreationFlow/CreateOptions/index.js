/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, Fragment } from 'react';
import formatMessage from 'format-message';
import { DialogFooter, PrimaryButton, DefaultButton, ChoiceGroup, Icon } from 'office-ui-fabric-react';

import { choiceGroup, templateItem, optionRoot, optionIcon, placeholder } from './styles';

export function CreateOptions(props) {
  const [option, setOption] = useState('create');
  const [template, setTemplate] = useState(null);
  const { templates, onDismiss, onNext } = props;

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
        {text}
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
          {checked &&
            formatMessage(template ? `${template.description}` : "Select a template to see it's description.")}
        </div>
      </Fragment>
    );
  }

  const handleChange = (event, option) => {
    setOption(option.key);
  };

  const handleItemChange = (event, option) => {
    setTemplate(option);
  };

  const handleJumpToNext = () => {
    if (option === 'Create from template') {
      if (template === null) onNext(templates[0]);
      else onNext(template.key);
    } else {
      onNext(null);
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
