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
export const InitNodeSize = {
  width: 200,
  height: 48,
};

export const DiamondSize = {
  width: 30,
  height: 17,
};

export const LoopIconSize = {
  width: 16,
  height: 16,
};

export const IconBrickSize = {
  width: 16,
  height: 16,
};

export const LoopEdgeMarginLeft = 20;

export const BoxMargin = 5;
export const TriggerSize = InitNodeSize;

export const TerminatorSize = { width: 14, height: 14 };

export const ChoiceInputSize = {
  width: 145,
  height: 22,
};

export const ChoiceInputMarginTop = 5;

export const EventNodeSize = {
  width: 240,
  height: 125,
};

export const CollapsedEventNodeSize = {
  width: 180,
  height: 4,
};

export const ElementInterval = {
  x: 50,
  y: 60,
};

export const BranchIntervalMinX = 150;

export const EdgeAddButtonSize = {
  width: 16,
  height: 16,
};

export const EventNodeLayout = {
  marginX: 12,
  marginY: 12,
};

export const PanelSize = {
  minWidth: (EventNodeSize.width + EventNodeLayout.marginX) * 2 + 24 * 2,
  maxWidth: (EventNodeSize.width + EventNodeLayout.marginX) * 4 + 24 * 2,
  defaultWidth: (EventNodeSize.width + EventNodeLayout.marginX) * 3 + 24 * 2,
  maxHeight: (EventNodeSize.height + EventNodeLayout.marginY) * 3 + 44 + 24 + 12 + 2, // title: 44, padding: 24 + 12, border: 2
};
