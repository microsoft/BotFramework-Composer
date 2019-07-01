/** @jsx jsx */
import { jsx } from '@emotion/core';
import formatMessage from 'format-message';
import { DialogFooter, PrimaryButton, DefaultButton, ChoiceGroup, Icon } from 'office-ui-fabric-react';
import { useState, useRef } from 'react';

import { DialogWrapper } from './../../components/DialogWrapper';
import { choiceGroup, templateItem, optionRoot, optionIcon } from './styles';

export function CreateOptionsDialog(props) {
  const [option, setOption] = useState('create');
  const { hidden, onNext, onDismiss, templates, title, subText } = props;
  const template = useRef(null);

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
    const { checked, text, key } = props;
    return (
      <div key={key} css={templateItem(checked)}>
        {text}
      </div>
    );
  }

  function onRenderField(props) {
    const { checked } = props;
    return (
      <div>
        <SelectOption {...props} />
        {checked && (
          <ChoiceGroup
            defaultSelectedKey={templates.length > 0 && templates[0].id}
            styles={choiceGroup}
            options={templates.map(item => ({
              ariaLabel: item.id,
              key: item.id,
              text: item.name,
              onRenderField: TemplateItem,
            }))}
            onChange={handleItemChange}
            required={true}
          />
        )}
      </div>
    );
  }

  const handleChange = (event, option) => {
    setOption(option.key);
  };

  const handleItemChange = (event, option) => {
    template.current = option;
  };

  const handleJumpToNext = () => {
    if (option === 'import') {
      if (template.current === null) onNext(templates[0]);
      else onNext(template.current.key);
    } else {
      onNext(null);
    }
  };

  return (
    <DialogWrapper hidden={hidden} onDismiss={onDismiss} title={title} subText={subText}>
      <ChoiceGroup
        defaultSelectedKey="create"
        options={[
          {
            key: 'create',
            text: formatMessage('Create from scratch'),
            onRenderField: SelectOption,
          },
          {
            key: 'import',
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
          disabled={option === 'import' && templates.length <= 0}
          onClick={handleJumpToNext}
          text={formatMessage('Next')}
          data-testid="NextStepButton"
        />
      </DialogFooter>
    </DialogWrapper>
  );
}
