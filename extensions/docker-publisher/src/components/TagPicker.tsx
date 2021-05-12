// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import formatMessage from 'format-message';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { TextField } from 'office-ui-fabric-react/lib/TextField';

import { useDebounce } from './useDebounce';

const stackStyles = { root: { marginBottom: '6px' } };
const dropdownStyles = { root: { marginBottom: '6px' }, dropdown: { width: '300px' } };
const itemIconStyles = { marginRight: '8px' };
const newNameTextFileStyles = { root: { marginTop: '10px', width: '300px' } };

const CREATE_NEW_KEY = 'CREATE_NEW';

const createNewOption: IDropdownOption = {
  key: CREATE_NEW_KEY,
  data: { iconName: 'Add' },
  text: formatMessage('Create new'),
};

type TagItemChoice = {
  name: string;
  isNew: boolean;
  errorMessage?: string;
};

type Props = {
  /**
   * If this picker should be disabled.
   */
  disabled?: boolean;
  /**
   * The resource groups to choose from.
   */
  tagNames?: string[];
  /**
   * The selected name of the existing resource.
   * When undefined, the 'Create new' option will be selected.
   */
  selectedTagName?: string;
  /**
   * The name chosen for a new resource group.
   * Used when the 'Create new' option is selected.
   */
  newTagName?: string;
  /**
   * Called when the selection or new resource name changes.
   */
  onChange: (choice: TagItemChoice) => void;
};

export const TagPicker = ({
  disabled,
  tagNames,
  selectedTagName: controlledSelectedName,
  newTagName: controlledNewName,
  onChange,
}: Props) => {
  // ----- Hooks -----//
  const [selectedName, setSelectedName] = React.useState(controlledSelectedName || CREATE_NEW_KEY);
  const [isNew, setIsNew] = React.useState((controlledSelectedName || CREATE_NEW_KEY) === CREATE_NEW_KEY);
  const [newName, setNewName] = React.useState(controlledNewName);
  const debouncedNewName = useDebounce<string>(newName, 300);
  const [newNameErrorMessage, setNewNameErrorMessage] = React.useState('');

  React.useEffect(() => {
    setSelectedName(controlledSelectedName || CREATE_NEW_KEY);
    setIsNew((controlledSelectedName || CREATE_NEW_KEY) === CREATE_NEW_KEY);
  }, [controlledSelectedName]);

  React.useEffect(() => {
    setNewName(controlledNewName || '');
  }, [controlledNewName]);

  React.useEffect(() => {
    const alreadyExists = tagNames?.some((name) => name === debouncedNewName);

    if (debouncedNewName && !debouncedNewName.match(/^[-\w._()]+$/)) {
      setNewNameErrorMessage(
        formatMessage(
          'Tag names only allow alphanumeric lower case characters, underscores, and cannot end in a period.'
        )
      );
    } else if (alreadyExists) {
      setNewNameErrorMessage(formatMessage('A tag with this name already exists.'));
    } else {
      setNewNameErrorMessage(undefined);
    }
  }, [debouncedNewName, tagNames]);

  React.useEffect(() => {
    if (!disabled) {
      onChange({
        isNew,
        name: isNew ? debouncedNewName : selectedName,
        errorMessage: isNew ? newNameErrorMessage : undefined,
      });
    }
  }, [disabled, selectedName, isNew, debouncedNewName, newNameErrorMessage]);

  const options = React.useMemo(() => {
    const optionsList: IDropdownOption[] =
      tagNames?.map((p) => {
        return { key: p, text: p };
      }) || [];

    optionsList.unshift(createNewOption);
    return optionsList;
  }, [tagNames]);

  React.useEffect(() => {
    setSelectedName(options[options.length > 1 ? 1 : 0].text);
    setIsNew(options.length == 1);
  }, [options]);
  // ----- Render -----//

  const onRenderOption = (option) => {
    return (
      <div>
        {option.data?.iconName && (
          <Icon aria-hidden="true" iconName={option.data.iconName} style={itemIconStyles} title={option.text} />
        )}
        <span>{option.text}</span>
      </div>
    );
  };

  return (
    <Stack styles={stackStyles}>
      <Dropdown
        disabled={disabled}
        options={options}
        placeholder={formatMessage('Select one')}
        selectedKey={selectedName}
        styles={dropdownStyles}
        onChange={(_, opt) => {
          setIsNew(opt.key === CREATE_NEW_KEY);
          setSelectedName(opt.key as string);
        }}
        onRenderOption={onRenderOption}
      />
      {isNew && (
        <TextField
          data-testid={'newTagName'}
          disabled={disabled}
          errorMessage={newNameErrorMessage}
          id={'newTagName'}
          placeholder={formatMessage('New tag name')}
          styles={newNameTextFileStyles}
          value={newName}
          onChange={(e, val) => {
            setNewName(val || '');
          }}
        />
      )}
    </Stack>
  );
};
