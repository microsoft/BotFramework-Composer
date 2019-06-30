/** @jsx jsx */
import { jsx } from '@emotion/core';
import formatMessage from 'format-message';
import { DialogFooter, PrimaryButton, DefaultButton, ChoiceGroup } from 'office-ui-fabric-react';
import { useState, useRef } from 'react';

import { DialogWrapper } from './../../components/DialogWrapper';
import { choiceGroup, templateItem } from './styles';
import { DialogInfo } from './../../constants/index';

export function CreateOptionsDialog(props) {
  const [option, setOption] = useState('create');
  const { hidden, onNext, onDismiss, templates } = props;
  const template = useRef(null);

  function TemplateItem(props) {
    const { checked, text, key } = props;
    return (
      <div key={key} css={templateItem(checked)}>
        {text}
      </div>
    );
  }

  function onRenderField(props, render) {
    const { checked } = props;
    return (
      <div>
        {render(props)}
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
    <DialogWrapper
      hidden={hidden}
      onDismiss={onDismiss}
      title={DialogInfo.CREATE_NEW_BOT.title}
      subText={DialogInfo.CREATE_NEW_BOT.subText}
    >
      <ChoiceGroup
        defaultSelectedKey="create"
        options={[
          {
            key: 'create',
            text: formatMessage('Create from scratch'),
          },
          {
            key: 'import',
            text: formatMessage('Import existing bot'),
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
