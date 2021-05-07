// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import React, { useMemo, useEffect, Fragment, useState } from 'react';
import AdaptiveForm, { FieldLabel } from '@bfc/adaptive-form';
import { FieldProps, JSONSchema7, UIOptions } from '@bfc/extension-client';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { useRecoilValue } from 'recoil';
import { v4 as uuid } from 'uuid';
import { Label } from 'office-ui-fabric-react/lib/Label';
import formatMessage from 'format-message';
import { Dropdown, IDropdownOption, ResponsiveMode } from 'office-ui-fabric-react/lib/Dropdown';
import { LoadingSpinner } from '@bfc/ui-shared/lib/components/LoadingSpinner';
import mapValues from 'lodash/mapValues';

import { botDisplayNameState } from '../../../../recoilModel';
import { ContentProps, SCHEMA_URIS, VERSION_REGEX } from '../constants';

const styles = {
  row: css`
    display: flex;
    justify-content: space-between;
    width: 75%;
    margin: -7px 0;
  `,
  field: css`
    flex-basis: 350px;
  `,
};

const chooseVersion = css`
  display: flex;
  width: 72%;
  margin: 10px 18px;
  justify-content: space-between;
`;
const InlineLabelField: React.FC<FieldProps> = (props) => {
  const { id, placeholder, rawErrors, value = '', onChange } = props;

  const handleChange = (e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
    onChange(newValue);
  };

  return (
    <div css={styles.row}>
      <div>
        <FieldLabel {...props} />
      </div>
      <div css={styles.field}>
        <TextField
          errorMessage={rawErrors as string}
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
        />
      </div>
    </div>
  );
};

export const Description: React.FC<ContentProps> = ({
  errors,
  value,
  schema,
  skillManifests,
  onChange,
  projectId,
  setSchema,
  setSkillManifest,
  editJson,
}) => {
  const botName = useRecoilValue(botDisplayNameState(projectId));
  const [isFetchCompleted, setIsFetchCompleted] = useState<boolean>(false);
  const { $id, $schema, ...rest } = value;

  const { hidden, properties } = useMemo(() => {
    if (!schema.properties) return { hidden: [], properties: {} } as any;
    return Object.entries(schema.properties as JSONSchema7).reduce(
      ({ hidden, properties }, [key, property]) => {
        if (property.type === 'object' || (property.type === 'array' && property?.items?.type !== 'string')) {
          return { hidden: [...hidden, key], properties };
        }

        const itemSchema = property?.items as JSONSchema7;
        const serializer =
          itemSchema?.type === 'string'
            ? {
                get: (value) => (Array.isArray(value) ? value.join(',') : value),
                set: (value) => (typeof value === 'string' ? value.split(/\s*,\s*/) : value),
              }
            : null;

        return {
          hidden,
          properties: {
            ...properties,
            [key]: {
              field: InlineLabelField,
              hideError: true,
              serializer,
              placeholder: schema.properties?.[key]?.placeholder,
            },
          },
        };
      },
      { hidden: [], properties: {} } as any
    );
  }, [schema]);

  const options: IDropdownOption[] = useMemo(
    () =>
      SCHEMA_URIS.map((key, index) => {
        const [version] = VERSION_REGEX.exec(key) || [];
        let selected = false;
        if ($schema) {
          selected = $schema && key === $schema;
        } else {
          selected = !index;
        }
        return {
          text: formatMessage('Version {version}', { version }),
          key,
          selected,
        };
      }),
    [$schema]
  );

  useEffect(() => {
    (async function () {
      try {
        if ($schema) {
          const res = await fetch($schema);
          const schema = await res.json();
          setSchema(schema);
          setIsFetchCompleted(true);
        } else {
          editJson();
        }
      } catch (error) {
        editJson();
      }
    })();
    const skillManifest = skillManifests.find(
      (manifest) => manifest.content.$schema === ($schema || SCHEMA_URIS[0])
    ) || {
      content: {
        $schema: $schema || SCHEMA_URIS[0],
        $id: `${botName}-${uuid()}`,
        endpoints: [{}],
        skillName: botName,
        ...rest,
      },
    };
    setSkillManifest(skillManifest);
  }, [$schema, isFetchCompleted]);

  const required = schema?.required || [];

  const uiOptions: UIOptions = {
    hidden,
    label: false,
    order: [...required, '*'],
    properties,
  };

  const handleChange = (_e: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) => {
    if (option) {
      const skillManifest = skillManifests.find((manifest) => manifest.content.$schema === option.key) || {
        content: { $schema: option.key as string },
      };
      setIsFetchCompleted(false);
      setSkillManifest(skillManifest);
    }
  };

  return (
    <Fragment>
      <div css={chooseVersion}>
        <Label
          required
          styles={{
            root: { fontWeight: 400 },
          }}
        >
          {formatMessage('Manifest Version')}
        </Label>
        <Dropdown
          disabled={!isFetchCompleted}
          errorMessage={errors?.version}
          options={options}
          responsiveMode={ResponsiveMode.large}
          styles={{
            root: {
              width: '350px',
            },
          }}
          onChange={handleChange}
        />
      </div>
      {isFetchCompleted ? (
        <AdaptiveForm errors={errors} formData={value} schema={schema} uiOptions={uiOptions} onChange={onChange} />
      ) : (
        <LoadingSpinner />
      )}
    </Fragment>
  );
};
