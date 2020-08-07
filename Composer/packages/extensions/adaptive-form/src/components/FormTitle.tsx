// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useMemo, useRef } from 'react';
import { FontWeights } from '@uifabric/styling';
import { FontSizes } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';
import { UIOptions, JSONSchema7, useShellApi, useRecognizerConfig } from '@bfc/extension';
import { css } from '@emotion/core';
import { SDKKinds } from '@bfc/shared';
import debounce from 'lodash/debounce';

import { EditableField } from './fields/EditableField';
import { Link } from './Link';

export const styles = {
  container: css`
    border-bottom: 1px solid #c8c6c4;
    padding: 0 18px;
    margin-bottom: 0px;
  `,

  subtitle: css`
    height: 15px;
    line-height: 15px;
    font-size: 12px;
    font-weight: 600;
    color: #4f4f4f;
    margin: -7px 0 7px;
  `,

  description: css`
    margin-top: 0;
    margin-bottom: 10px;
    white-space: pre-line;
    font-size: ${FontSizes.size12};
  `,
};

interface FormTitleProps {
  description?: string;
  formData: any;
  id: string;
  onChange: ($designer: object) => void;
  schema: JSONSchema7;
  title?: string;
  uiOptions?: UIOptions;
}

const FormTitle: React.FC<FormTitleProps> = (props) => {
  const { description, schema, formData, uiOptions = {} } = props;
  const { shellApi, ...shellData } = useShellApi();
  const { currentDialog } = shellData;
  const recognizers = useRecognizerConfig();
  const selectedRecognizer = recognizers.find((r) => r.isSelected(currentDialog?.content?.recognizer));
  // use a ref because the syncIntentName is debounced and we need the most current version to invoke the api
  const shell = useRef({
    data: shellData,
    api: shellApi,
  });
  shell.current = {
    data: shellData,
    api: shellApi,
  };
  const syncIntentName = useMemo(
    () =>
      debounce(async (newIntentName?: string, data?: any) => {
        if (newIntentName && selectedRecognizer) {
          const normalizedIntentName = newIntentName?.replace(/[^a-zA-Z0-9-_]+/g, '');
          await selectedRecognizer.renameIntent(
            data?.intent,
            normalizedIntentName,
            shell.current.data,
            shell.current.api
          );
        }
      }, 400),
    []
  );

  const handleTitleChange = (newTitle?: string): void => {
    if (formData.$kind === SDKKinds.OnIntent) {
      syncIntentName(newTitle, formData);
    }

    props.onChange({
      $designer: {
        ...formData.$designer,
        name: newTitle,
      },
    });
  };

  const uiLabel = typeof uiOptions?.label === 'function' ? uiOptions.label(formData) : uiOptions.label;
  const uiSubtitle = typeof uiOptions?.subtitle === 'function' ? uiOptions.subtitle(formData) : uiOptions.subtitle;
  const initialValue = useMemo(() => {
    const designerName = formData.$designer?.name;

    return designerName || uiLabel || schema.title;
  }, [formData.$designer?.name, uiLabel, schema.title]);

  const getHelpLinkLabel = (): string => {
    return (uiLabel || schema.title || '').toLowerCase();
  };

  const getSubTitle = (): string => {
    return uiSubtitle || uiLabel || formData.$kind;
  };

  const getDescription = (): string => {
    const { description: descriptionOverride } = uiOptions;

    if (descriptionOverride) {
      if (typeof descriptionOverride === 'function') {
        const result = descriptionOverride(formData);

        if (result) {
          return result;
        }
      } else {
        return descriptionOverride;
      }
    }

    return description || schema.description || '';
  };

  return uiLabel !== false ? (
    <div css={styles.container} id={props.id}>
      <div>
        <EditableField
          ariaLabel={formatMessage('form title')}
          depth={0}
          fontSize={FontSizes.size20}
          id="form-title"
          name="$designer.name"
          schema={{}}
          styles={{
            field: { fontWeight: FontWeights.semibold },
            root: { margin: '5px 0 7px -9px' },
          }}
          uiOptions={{}}
          value={initialValue}
          onChange={handleTitleChange}
        />
        <p css={styles.subtitle}>{getSubTitle()}</p>
        <p css={styles.description}>
          {getDescription()}
          {uiOptions?.helpLink && (
            <React.Fragment>
              <br />
              <br />
              <Link
                aria-label={formatMessage('Learn more about {title}', { title: getHelpLinkLabel() })}
                href={uiOptions?.helpLink}
                rel="noopener noreferrer"
                target="_blank"
              >
                {formatMessage('Learn more')}
              </Link>
            </React.Fragment>
          )}
        </p>
      </div>
      {props.children}
    </div>
  ) : null;
};

export default FormTitle;
