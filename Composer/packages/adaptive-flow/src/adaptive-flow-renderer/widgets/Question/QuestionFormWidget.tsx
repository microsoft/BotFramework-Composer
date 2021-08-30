// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useEffect, useRef } from 'react';
import { WidgetContainerProps, useShellApi } from '@bfc/extension-client';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { NeutralColors } from '@uifabric/fluent-theme';
import { FontSizes } from 'office-ui-fabric-react/lib/Styling';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import debounce from 'lodash/debounce';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { nanoid } from 'nanoid';

import { QuestionOptions } from './QuestionOptions';
import { QuestionType } from './QuestionType';

interface QuestionFormWidgetProps extends WidgetContainerProps {
  prompt: React.ReactNode;
}

const typeOptions: IDropdownOption[] = [
  {
    key: QuestionType.choice,
    text: 'Multiple choice options',
    data: {
      description: 'Prebuilt, String',
    },
  },
  {
    key: QuestionType.text,
    text: "User's entire response",
    data: {
      description: 'No entity extraction; saved as is',
    },
  },
  {
    key: QuestionType.confirm,
    text: 'User confirmation',
    data: {
      description: 'Prebuilt, User confirmation, extracted as a boolean',
    },
  },
  {
    key: QuestionType.number,
    text: 'Number',
    data: {
      description: 'Prebuilt,Cardinal numbers in numeric or text form, extracted as a number',
    },
  },
];

const typeToType = {
  [QuestionType.choice]: 'string',
  [QuestionType.text]: 'string',
  [QuestionType.number]: 'number',
  [QuestionType.confirm]: 'boolean',
};

const renderTypeOption = (props) => {
  return (
    <div style={{ margin: '10px 0' }}>
      <div style={{}}>{props.text}</div>
      <div style={{ color: NeutralColors.gray100, fontSize: FontSizes.small }}>{props.data?.description}</div>
    </div>
  );
};

const QuestionFormWidget = ({ prompt, data, id }: QuestionFormWidgetProps) => {
  const { shellApi } = useShellApi();
  const [localData, setLocalData] = useState({
    type: data.type,
    choices: data.choices,
    cases: data.cases,
    property: data.property,
  });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const syncData = useRef(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    debounce((lData: any, rData: any, id: string) => {
      shellApi.saveData({ ...rData, ...lData }, id);
    }, 300)
  ).current;

  useEffect(() => {
    syncData(localData, data, id);

    return () => {
      syncData.cancel();
    };
  }, [localData, data]);

  const clickHandler = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleTypeChange = (e, option) => {
    if (option?.key && localData.type !== option.key) {
      const type = option.key;
      // remove cases?
      // handle confirm cases
      let choices: any = undefined;
      let cases: any = undefined;

      if (type !== QuestionType.choice) {
        choices = undefined;
        cases = undefined;
      }

      if (type === QuestionType.confirm) {
        cases = [
          {
            value: true,
            actions: [],
          },
          {
            value: false,
            actions: [],
          },
        ];
      }

      if (type === QuestionType.choice) {
        cases = [
          {
            value: '',
            isDefault: true,
            actions: [],
          },
        ];
      }

      setLocalData((current) => ({ ...current, type, choices, cases }));
    }
  };

  const handlePropertyChange = (e, newValue) => {
    setLocalData((current) => ({ ...current, property: newValue }));
    setErrors((current) => ({
      ...current,
      property: newValue ? undefined : 'Variable name required',
    }));
  };

  const onAddChoice = () => {
    const id = nanoid(6);
    const newChoice = { value: '', id };
    const choices = (localData.choices || []).concat(newChoice);

    const newCase = { value: '', actions: [], choiceId: id };
    const currentCases = [...(localData.cases || [])];
    const defaultIdx = currentCases.findIndex((c) => c.isDefault);
    const newItemIdx = defaultIdx > -1 ? defaultIdx : currentCases.length;
    currentCases.splice(newItemIdx, 0, newCase);

    setLocalData((current) => ({ ...current, choices, cases: currentCases }));
    syncData.flush();
  };

  const onEditChoice = (id: string, value: string) => {
    const choices = (localData.choices || []).map((choice) => {
      if (choice.id === id) {
        return { ...choice, value };
      }

      return choice;
    });

    const cases = (localData.cases || []).map((c) => {
      if (c.choiceId === id) {
        return { ...c, value };
      }

      return c;
    });

    setLocalData((current) => ({ ...current, choices, cases }));
  };

  const onRemoveChoice = (id: string) => {
    const choices = (localData.choices ?? []).filter((choice) => choice.id !== id);
    const cases = (localData.cases ?? []).filter((c) => c.choiceId !== id);

    setLocalData((current) => ({ ...current, choices, cases }));
  };

  const isChoiceExpression =
    localData.choices && localData.choices.length === 1 && localData.choices[0].value.startsWith('=');

  return (
    <React.Fragment>
      <Label>Question</Label>
      {prompt}
      <Dropdown
        label="Identify"
        options={typeOptions}
        selectedKey={localData.type}
        styles={{
          label: { margin: '5px 0' },
          dropdownItem: { height: 'auto' },
          dropdownItemSelected: { height: 'auto' },
        }}
        onChange={handleTypeChange}
        onRenderOption={renderTypeOption}
      />
      {localData.type === QuestionType.choice && (
        <QuestionOptions
          // disable ability to add if choices is an expression
          canAdd={!isChoiceExpression}
          options={localData.choices || []}
          onAdd={onAddChoice}
          onChange={onEditChoice}
          onRemove={onRemoveChoice}
        />
      )}
      <TextField
        errorMessage={errors.property}
        label="Save response as"
        prefix="{x}"
        styles={{ root: { marginTop: '5px' }, fieldGroup: { marginTop: '5px' } }}
        suffix={typeToType[localData.type]}
        value={localData.property}
        onChange={handlePropertyChange}
        onClick={clickHandler}
      />
    </React.Fragment>
  );
};

export { QuestionFormWidget };
