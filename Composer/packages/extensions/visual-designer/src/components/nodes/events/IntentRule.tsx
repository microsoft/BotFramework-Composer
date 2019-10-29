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
import React, { FunctionComponent } from 'react';
import formatMessage from 'format-message';

import { NodeProps, defaultNodeProps } from '../nodeProps';
import { RuleCard } from '../templates/RuleCard';

// Generate the title displayed in the graph
// If a custom title has been specified, use this
// otherwise, display the name of the intent handled
// if no intent have yet been configured, display a generic title
function renderTitle(data): string {
  if (data.$designer && data.$designer.name) {
    return data.$designer.name;
  } else if (data.intent) {
    return formatMessage('Intent: {intent}', { intent: data.intent });
  } else {
    return formatMessage('Intent...');
  }
}

export const IntentRule: FunctionComponent<NodeProps> = ({ id, data, focused, onEvent }) => {
  return <RuleCard id={id} data={data} label={renderTitle(data)} focused={focused} onEvent={onEvent} />;
};

IntentRule.defaultProps = defaultNodeProps;
