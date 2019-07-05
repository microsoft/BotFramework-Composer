/** @jsx jsx */
import { jsx } from '@emotion/core';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { Link } from 'office-ui-fabric-react/lib/Link';
import formatMessage from 'format-message';

import * as about from './styles';

export const About = () => {
  return (
    <div css={about.outline}>
      <div css={about.content}>
        <div css={about.title}> {formatMessage(`About`)} </div>
        <div css={about.part1}>
          <div css={about.part1Text}>
            {formatMessage(`Version 1.1`)}
            <br />
            <br />
            {formatMessage(` sssssssssss ssssssssss ssssssssssss sssssssss ssssssssssss sssssssss sssssssssss ssssssssss
            ssssssss sssssss ssssssssssss ssssssssssssss sssssssssss ssssssssss ssssssssss sssssssssss sssssssssss ssssssssss
            ssssss sssssssssssssss ssssssssssss sssssssss sssssssss ssssssssssss sssssssss ssssssssssss
            sssssss ssssssssss ssss sssssssss ssssssssss ssssssssss ssssss sssssssss sssssssss ssssssss sssssssssssss
            sssssssssssssss sssssssssssssss sssssss ssssssss sssssssssssssss sssssssssssssss
            ssssssss sssss ssssssssss sssssssssss ssssssssssssssss ssssss sssssssssss ssssssss ssssssssssssss
            sssssssssssssssssssss sssssssssss ssssssssss sssssssssss ssssssssss sssssssssssssssssssss
            ssssssss sssssssssssss sssssssss ssssssssssss sssssssssss ssssssssss ssssssssssss ssssssss ssssssssss sssssssssss
            sssssssss ssssssssssss ssss sssssssss ssssssss sssssss ssssssssssssss sssssssssssssssssssss
            ssssssssssss sssssssss sssssssssssssssssssss ssssssssss sssssssssss ssss ssssssss sssssssss
            sssssssss ssssssssssss ssssssss ssssssssssss ssssss ssssssssssssssss sssssssssss ssssssssss sssss ssssss sssssssss
            ssssssssss sssss sssssssssssssss sssssssssssssss ssss ssssssssssssss ssssssssss sssssssss sssssssssssss`)}
          </div>
        </div>
        <div css={about.part2}>
          <div css={about.smallText}>
            {formatMessage(`The following session details may be requested by Technical Support`)}{' '}
          </div>
          <div css={about.part2Text}> {formatMessage(`Diagnostics`)} </div>
        </div>
        <div css={about.part3}>
          <div css={about.part3Text}>
            <div css={about.part3TextAlignLeft}>{formatMessage(`Session ID`)} </div>
            <div css={about.part3TextAlignLeft}>{formatMessage(`2039420394820934`)} </div>
          </div>
          <div css={about.part3Text}>
            <div css={about.part3TextAlignLeft}>{formatMessage(`Build `)}</div>
            <div css={about.part3TextAlignLeft}>{formatMessage(`23.4342q35.45 34`)} </div>
          </div>
        </div>

        <div css={about.linkContainer}>
          <div css={about.linkRow}>
            <IconButton styles={about.icon} iconProps={{ iconName: 'Info' }} />
            <Link href={'/about'} tabIndex={-1} target={'_blank'}>
              <div css={about.link}>{formatMessage(`Terms of Use`)} </div>
            </Link>
          </div>
          <div css={about.linkRow}>
            <IconButton styles={about.icon} iconProps={{ iconName: 'BlockedSite' }} />
            <Link href={'/about'} tabIndex={-1} target={'_blank'}>
              <div css={about.link}>{formatMessage(`Third-Party Notices`)} </div>
            </Link>
          </div>
          <div css={about.linkRow}>
            <IconButton styles={about.icon} iconProps={{ iconName: 'Lock' }} />
            <Link href={'/about'} tabIndex={-1} target={'_blank'}>
              <div css={about.link}>{formatMessage(`Privacy and Cookies`)}</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
