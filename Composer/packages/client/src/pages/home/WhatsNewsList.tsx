// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Link } from '@fluentui/react/lib/Link';
import formatMessage from 'format-message';

import * as home from './styles';

interface WhatsNewsListProps {
  newsList: any[];
}

export function WhatsNewsList({ newsList }: WhatsNewsListProps): JSX.Element {
  return (
    <div aria-label={formatMessage("What's new list")} css={home.whatsNewsContainer} role="region">
      <h3 css={home.subtitle}>{formatMessage("What's new")}</h3>
      <ol css={home.whatsNewsList}>
        {newsList.map(({ title, description, url }, index) => {
          return (
            <li key={index} css={home.whatsNewsListItem}>
              <Link css={home.blueTitle} href={url} target={'_blank'}>
                {title}
              </Link>
              <p css={home.newsDescription}>{description}</p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
