/** @jsx jsx */
import { jsx } from '@emotion/core';
import { IconButton, Link } from 'office-ui-fabric-react/lib';

import * as about from './styles';

export const About = () => {
  return (
    <div css={about.outline}>
      <div css={about.content}>
        <div css={about.title}> About </div>
        <div css={about.part1}>
          <div css={about.part1Text}>
            Version 1.1
            <br />
            <br />
            sssssssssssssssssssss sssssssssssssssssssss sssssssssssssssssssss sssssssssssssssssssss
            sssssssssssssssssssssssssssssssssssssssss sssssssssssssssssssss sssssssssssssssssssss sssssssssssssssssssss
            sssssssssssssssssssss sssssssssssssssssssss sssssssssssssssssssss sssssssssssssssssssss
            sssssssssssssssssssss sssssssssssssssssssssssssssss sssssssssssssssssssssssssssssssssssssssssssss
            sssssssssssssss sssssssssssssss sssssssssssssss sssssssssssssss sssssssssssssss
            ssssssssssssssssssssssssssssssssssssssssssssssssss sssssssssssssssssssssssssssssssssssssss
            sssssssssssssssssssss sssssssssssssssssssss sssssssssssssssssssss sssssssssssssssssssss
            sssssssssssssssssssss sssssssssssssssssssss sssssssssssssssssssss sssssssssssssssssssssssssssssssssssssssss
            sssssssssssssssssssss sssssssssssssssssssss sssssssssssssssssssss sssssssssssssssssssss
            sssssssssssssssssssss sssssssssssssssssssss sssssssssssssssssssss sssssssssssssssssssss
            sssssssssssssssssssssssssssss sssssssssssssssssssssssssssssssssssssssssssss sssssssssssssss sssssssssssssss
            sssssssssssssss sssssssssssssss sssssssssssssss ssssssssssssssssssssssssssssssssssssssssssssssssss
          </div>
        </div>
        <div css={about.part2}>
          <div css={about.smallText}>The following session details may be requested by Technical Support </div>
          <div css={about.part2Text}> Diagnostics </div>
        </div>
        <div css={about.part3}>
          <div css={about.part3Text}>
            <div css={about.part3TextAlignLeft}>Session ID </div>
            <div css={about.part3TextAlignLeft}>2039420394820934 </div>
          </div>
          <div css={about.part3Text}>
            <div css={about.part3TextAlignLeft}>Build </div>
            <div css={about.part3TextAlignLeft}>23.4342q35.45 34 </div>
          </div>
        </div>

        <div css={about.linkContainer}>
          <div css={about.linkRow}>
            <IconButton styles={about.icon} iconProps={{ iconName: 'Info' }} />
            <Link href={'/about'} tabIndex={-1}>
              <div css={about.link}>Terms of Use </div>
            </Link>
          </div>
          <div css={about.linkRow}>
            <IconButton styles={about.icon} iconProps={{ iconName: 'BlockedSite' }} />
            <Link href={'/about'} tabIndex={-1}>
              <div css={about.link}>Third-Party Notices </div>
            </Link>
          </div>
          <div css={about.linkRow}>
            <IconButton styles={about.icon} iconProps={{ iconName: 'Lock' }} />
            <Link href={'/about'} tabIndex={-1}>
              <div css={about.link}>Privacy and Cookies</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
