// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/react';
import React, { useMemo, useRef } from 'react';
import { FontWeights } from '@fluentui/style-utilities';
import { FontSizes } from '@fluentui/theme';
import formatMessage from 'format-message';
import { UIOptions, JSONSchema7, useShellApi, useRecognizerConfig } from '@bfc/extension-client';
import { css } from '@emotion/react';
import { SDKKinds } from '@bfc/shared';
import debounce from 'lodash/debounce';

import { EditableField } from './fields/EditableField';
import { Link } from './Link';
import { Comment } from './Comment';

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

  comment: css`
    margin: 18px 0;
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
  const { currentRecognizer: selectedRecognizer } = useRecognizerConfig();
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
          typeof selectedRecognizer.renameIntent === 'function' &&
            (await selectedRecognizer.renameIntent(
              data?.intent,
              normalizedIntentName,
              shell.current.data,
              shell.current.api,
            ));
        }
      }, 400),
    [],
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

  const handleCommentChange = (newComment?: string) => {
    props.onChange({
      $designer: {
        ...formData.$designer,
        comment: newComment,
      },
    });
  };

  const uiLabel = typeof uiOptions?.label === 'function' ? uiOptions.label(formData) : uiOptions.label;
  const uiSubtitle = typeof uiOptions?.subtitle === 'function' ? uiOptions.subtitle(formData) : uiOptions.subtitle;
  const initialValue = useMemo(() => {
    const designerName = formData.$designer?.name;
    const id = formData.id;
    return designerName ?? id ?? uiLabel ?? schema.title;
  }, [formData.$designer?.name, uiLabel, schema.title, formData.id]);

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
                href={uiOptions.helpLink}
                rel="noopener noreferrer"
                target="_blank"
                onClick={() => {
                  shellApi.telemetryClient?.track('HelpLinkClicked', { url: uiOptions.helpLink as string });
                }}
              >
                {formatMessage('Learn more')}
              </Link>
            </React.Fragment>
          )}
        </p>
        <div css={styles.comment}>
          <Comment
            key={formData?.$designer?.id}
            comment={formData?.$designer?.comment}
            onChange={handleCommentChange}
          />
        </div>
      </div>
      {props.children}
    </div>
  ) : null;
};

export default FormTitle;
