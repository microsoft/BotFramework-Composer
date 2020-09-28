// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FlowEditorWidgetMap } from '@bfc/extension-client';
import { ListOverview } from '@bfc/ui-shared';

import {
  ActionCard,
  DialogRef,
  PromptWidget,
  IfConditionWidget,
  SwitchConditionWidget,
  ForeachWidget,
  ActionHeader,
  PropertyDescription,
  ResourceOperation,
} from '../widgets';

const builtinActionWidgets: FlowEditorWidgetMap = {
  ActionCard,
  DialogRef,
  PromptWidget,
  IfConditionWidget,
  SwitchConditionWidget,
  ForeachWidget,
  ActionHeader,
  PropertyDescription,
  ResourceOperation,
  ListOverview,
};

export default builtinActionWidgets;
