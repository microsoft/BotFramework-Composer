// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FlowEditorWidgetMap } from '@bfc/extension-client';

import {
  ActionCard,
  DialogRef,
  PromptWidget,
  IfConditionWidget,
  SwitchConditionWidget,
  ForeachWidget,
  ActionHeader,
} from '../widgets';

const builtinActionWidgets: FlowEditorWidgetMap = {
  ActionCard,
  DialogRef,
  PromptWidget,
  IfConditionWidget,
  SwitchConditionWidget,
  ForeachWidget,
  ActionHeader,
};

export default builtinActionWidgets;
