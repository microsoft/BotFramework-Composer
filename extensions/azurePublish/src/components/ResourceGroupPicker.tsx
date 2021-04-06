// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import formatMessage from 'format-message';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { FluentTheme } from '@uifabric/fluent-theme';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';

import { useDebounce } from './useDebounce';

const stackStyles = { root: { marginBottom: '8px' } };
const dropdownStyles = { root: { marginBottom: '8px' }, dropdown: { width: '100%' } };
const itemIconStyles = { marginRight: '8px' };
const newNameTextFileStyles = { root: { marginTop: '10px' } };

const getInfoIconStyle = (required) => {
  return {
    root: {
      selectors: {
        '&::before': {
          content: required ? " '*'" : '',
          color: FluentTheme.palette.red,
          paddingRight: 3,
        },
      },
    },
  };
};

const CREATE_NEW_KEY = 'CREATE_NEW';

const createNewOption: IDropdownOption = {
  key: CREATE_NEW_KEY,
  data: { iconName: 'Add' },
  text: formatMessage('Create new'),
};

type ResourceGroupItemChoice = {
  name: string;
  isNew: boolean;
  errorMessage?: string;
};

type Props = {
  disabled: boolean;
  /**
   * The resource groups to choose from.
   * Set to undefined to disable this picker.
   */
  resourceGroupNames?: string[];
  /**
   * The selected name of the existing resource.
   * When undefined, the 'Create new' option will be selected.
   */
  selectedResourceGroupName?: string;
  /**
   * The name chosen for a new resource group.
   * Used when the 'Create new' option is selected.
   */
  newResourceGroupName?: string;
  /**
   * Called when the selection or new resource name changes.
   */
  onChange: (choice: ResourceGroupItemChoice) => void;
};

const onRenderLabel = (props) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        marginBottom: '5px',
      }}
    >
      <div
        style={{
          marginRight: '5px',
          fontWeight: 600,
          fontSize: '14px',
        }}
      >
        {` ${props.label} `}
      </div>
      <TooltipHost content={props.ariaLabel}>
        <Icon iconName="Info" styles={getInfoIconStyle(props.required)} />
      </TooltipHost>
    </div>
  );
};

export const ResourceGroupPicker = ({
  disabled,
  resourceGroupNames,
  selectedResourceGroupName: controlledSelectedName,
  newResourceGroupName: controlledNewName,
  onChange,
}: Props) => {
  // ----- Hooks -----//
  const [selectedName, setSelectedName] = React.useState(controlledSelectedName || CREATE_NEW_KEY);
  const [newName, setNewName] = React.useState(controlledNewName);
  const debouncedNewName = useDebounce<string>(newName, 300);
  const [newNameErrorMessage, setNewNameErrorMessage] = React.useState('');

  React.useEffect(() => {
    setSelectedName(controlledSelectedName || CREATE_NEW_KEY);
  }, [controlledSelectedName]);

  React.useEffect(() => {
    setNewName(controlledNewName || '');
  }, [controlledNewName]);

  React.useEffect(() => {
    const alreadyExists = resourceGroupNames?.some((name) => name === debouncedNewName);

    if (debouncedNewName && !debouncedNewName.match(/^[-\w._()]+$/)) {
      setNewNameErrorMessage(
        formatMessage(
          'Resource group names only allow alphanumeric characters, periods, underscores, hyphens and parenthesis and cannot end in a period.'
        )
      );
    } else if (alreadyExists) {
      setNewNameErrorMessage(formatMessage('A resource with this name already exists.'));
    } else {
      setNewNameErrorMessage(undefined);
    }
  }, [debouncedNewName, resourceGroupNames]);

  React.useEffect(() => {
    const isNew = selectedName === CREATE_NEW_KEY;
    onChange({
      isNew,
      name: isNew ? debouncedNewName : selectedName,
      errorMessage: isNew ? newNameErrorMessage : undefined,
    });
  }, [selectedName, debouncedNewName, newNameErrorMessage]);

  const options = React.useMemo(() => {
    const optionsList: IDropdownOption[] =
      resourceGroupNames?.map((p) => {
        return { key: p, text: p };
      }) || [];

    optionsList.unshift(createNewOption);
    return optionsList;
  }, [resourceGroupNames]);

  // ----- Render -----//

  const loading = resourceGroupNames === undefined;

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
        required
        ariaLabel={formatMessage(
          'A resource group is a collection of resources that share the same lifecycle, permissions, and policies'
        )}
        disabled={loading || disabled}
        label={formatMessage('Resource group')}
        options={options}
        placeholder={formatMessage('Select one')}
        selectedKey={selectedName}
        styles={dropdownStyles}
        onChange={(_, opt) => {
          setSelectedName(opt.key as string);
        }}
        onRenderLabel={onRenderLabel}
        onRenderOption={onRenderOption}
      />
      {selectedName === CREATE_NEW_KEY && (
        <TextField
          required
          ariaLabel={formatMessage('Enter a name for the new resource group')}
          data-testid={'newResourceGroupName'}
          disabled={loading}
          errorMessage={newNameErrorMessage}
          id={'newResourceGroupName'}
          label={formatMessage('Resource group name')}
          placeholder={formatMessage('New resource group')}
          styles={newNameTextFileStyles}
          value={newName}
          onChange={(e, val) => {
            setNewName(val || '');
          }}
          onRenderLabel={onRenderLabel}
        />
      )}
    </Stack>
  );
};
