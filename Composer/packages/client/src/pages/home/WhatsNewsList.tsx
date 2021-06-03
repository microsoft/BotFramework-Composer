// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Link } from 'office-ui-fabric-react/lib/Link';
import formatMessage from 'format-message';
import { Fragment } from 'react';

import * as home from './styles';

interface WhatsNewsListProps {
  newsList: any[];
}

export function WhatsNewsList({ newsList }: WhatsNewsListProps): JSX.Element {
  return (
    <div aria-label={formatMessage("What's new list")} css={home.whatsNewsContainer} role="region">
      <h3 css={home.subtitle}>{formatMessage("What's new")}</h3>
      <div css={home.whatsNewsList}>
        {newsList.map(({ title, description, url }, index) => {
          return (
            <Fragment key={index}>
              <Link css={home.bluetitle} href={url} target={'_blank'}>
                {title}
              </Link>
              <p css={home.newsDescription}>{description}</p>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
