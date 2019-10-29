/**
    Copyright (c) Microsoft. All rights reserved.
    Licensed under the MIT license.

    Microsoft Bot Framework: http://botframework.com

    Bot Framework Composer Github:
    https://github.com/Microsoft/BotFramwork-Composer

    Copyright (c) Microsoft Corporation
    All rights reserved.

    MIT License:
    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/
import React, { useState } from 'react';
import { Link } from '@reach/router';
import { PropTypes } from 'prop-types';
import { CommandBarButton, FocusZone } from 'office-ui-fabric-react';

import { link, outer, commandBarButton } from './styles';

export const NavItem = props => {
  const { to, exact, iconName, labelName, targetUrl, underTest } = props;
  const [active, setActive] = useState(false);

  const isPartial = (targetUrl, currentUrl) => {
    const urlPaths = currentUrl.split('/');
    return urlPaths.indexOf(targetUrl) !== -1;
  };

  return (
    <FocusZone allowFocusRoot={true} disabled={underTest}>
      <Link
        to={to}
        css={link(active, underTest)}
        getProps={({ isCurrent, location }) => {
          const isActive = exact ? isCurrent : isPartial(targetUrl, location.pathname);
          setActive(isActive);
        }}
        data-testid={'LeftNav-CommandBarButton' + labelName}
        disabled={underTest}
        aria-disabled={underTest}
        aria-label={labelName}
      >
        <div css={outer} aria-hidden="true">
          <CommandBarButton
            iconProps={{
              iconName,
            }}
            text={labelName}
            styles={commandBarButton(active)}
            disabled={underTest}
            ariaHidden
          />
        </div>
      </Link>
    </FocusZone>
  );
};
NavItem.propTypes = {
  to: PropTypes.string,
  iconName: PropTypes.string,
  labelName: PropTypes.string,
  exact: PropTypes.bool,
  labelHide: PropTypes.bool,
  index: PropTypes.number,
  targetUrl: PropTypes.string,
};
