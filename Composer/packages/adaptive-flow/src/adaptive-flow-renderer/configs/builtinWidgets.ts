// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FlowEditorWidgetMap } from '@bfc/extension-client';
import { ListOverview } from '@bfc/ui-shared';

import {
  ActionCard,
  ActionCardBody,
  DialogRef,
  PromptWidget,
  IfConditionWidget,
  SwitchConditionWidget,
  QuestionWidget,
  QuestionFormWidget,
  QuestionConditionWidget,
  ForeachWidget,
  ActionHeader,
  PropertyDescription,
  ResourceOperation,
} from '../widgets';

const builtinActionWidgets: FlowEditorWidgetMap = {
  ActionCard,
  ActionCardBody,
  DialogRef,
  PromptWidget,
  IfConditionWidget,
  SwitchConditionWidget,
  QuestionWidget,
  QuestionFormWidget,
  QuestionConditionWidget,
  ForeachWidget,
  ActionHeader,
  PropertyDescription,
  ResourceOperation,
  ListOverview,
};

export default builtinActionWidgets;
