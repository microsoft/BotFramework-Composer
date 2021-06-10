// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useId } from '@uifabric/react-hooks';
import formatMessage from 'format-message';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import * as React from 'react';
import { useRecoilValue } from 'recoil';

import { formDialogTemplatesAtom } from '../../atoms/appState';
import { FieldLabel } from '../common/FieldLabel';

type Props = {
  selectedPropertyType: string;
  onChange: (propertyType: string) => void;
};

export const PropertyTypeSelector = React.memo((props: Props) => {
  const { selectedPropertyType, onChange } = props;

  const propertyTypeTooltipId = useId('propertyType');

  const templates = useRecoilValue(formDialogTemplatesAtom);
  const options = React.useMemo(
    () =>
      templates.map<IDropdownOption>((template) => ({
        key: template.id,
        text: template.$generator.title,
        title: template.$generator.description,
        selected: selectedPropertyType === template.id,
        data: {
          template,
        },
      })),
    [templates, selectedPropertyType]
  );

  const selectedKey = React.useMemo(() => options.find((o) => o.selected).key, [options]);

  const change = React.useCallback(
    (_: React.FormEvent<HTMLDivElement>, option: IDropdownOption) => {
      const newPropertyType = option.key as string;
      onChange(newPropertyType);
    },
    [onChange]
  );

  const onRenderLabel = React.useCallback(
    (helpText: string, tooltipId: string) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (props: any, defaultRender?: (props: any) => JSX.Element | null) => (
        <FieldLabel defaultRender={defaultRender(props)} helpText={helpText} tooltipId={tooltipId} />
      ),
    []
  );

  return (
    <Dropdown
      aria-describedby={propertyTypeTooltipId}
      calloutProps={{ calloutMaxHeight: 400 }}
      label={formatMessage('Property Type')}
      options={options}
      selectedKey={selectedKey}
      styles={{ root: { minWidth: 200 } }}
      onChange={change}
      onRenderLabel={onRenderLabel(
        formatMessage(
          `The property type defines the expected input. The type can be a list (or enum) of defined values or a data format, such as a date, email, number, or string.`
        ),
        propertyTypeTooltipId
      )}
    />
  );
});
