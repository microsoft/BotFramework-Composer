// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React from 'react';
import { NeutralColors } from '@uifabric/fluent-theme';

const styles = {
  container: css`
    padding: 10px 18px;
    margin: -10px -18px;
    border-bottom: 1px solid ${NeutralColors.gray60};

    label: Section;
  `,
  title: css`
    font-size: 16px;
    font-weight: 600;
    margin: 0;
    margin-bottom: 11px;

    label: SectionTitle;
  `,
  description: css`
    font-size: 12px;
    margin: 0;
    margin-bottom: 20px;
    white-space: pre-line;

    label: SectionDescription;

    & a {
      color: ${NeutralColors.black};
    }
  `,
};

interface SectionProps {
  title?: string;
  description?: () => JSX.Element | string;
}

const Section: React.FC<SectionProps> = props => {
  const { title, description, children } = props;

  const descriptionContents = typeof description === 'function' ? description() : description;

  return (
    <div css={styles.container}>
      {title && <h3 css={styles.title}>{title}</h3>}
      {descriptionContents && <p css={styles.description}>{descriptionContents}</p>}
      {children}
    </div>
  );
};

export { Section };
