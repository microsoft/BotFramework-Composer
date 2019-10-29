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
import { WidgetProps, FieldProps, ObjectFieldTemplateProps } from '@bfcomposer/react-jsonschema-form';
import { ShellData, EditorSchema, ShellApi, OBISchema } from 'shared';

export interface FormContext
  extends Pick<ShellData, 'luFiles' | 'lgFiles' | 'currentDialog' | 'focusedEvent' | 'focusedSteps' | 'focusedTab'> {
  editorSchema: EditorSchema;
  shellApi: ShellApi;
  rootId: string;
  dialogOptions: { value: string; label: string }[];
  dialogId?: string;
  isRoot: boolean;
}

interface EnumOption {
  label: string;
  value: string;
}

export interface BFDObjectFieldTemplateProps extends ObjectFieldTemplateProps {
  id: string;
  onChange: (any) => void;
}

export interface BFDFieldProps<T = any> extends FieldProps<T> {
  formContext: FormContext;
}

export interface BFDWidgetProps extends Partial<WidgetProps> {
  id: string;
  schema: OBISchema;
  onChange: (data: any) => void;
  formContext: FormContext;
  options?: {
    label?: string | false;
    enumOptions?: EnumOption[];
  };
}

export interface SelectWidgetProps extends BFDWidgetProps {
  options: {
    enumOptions: EnumOption[];
  };
}

export interface RadioWidgetProps extends BFDWidgetProps {
  options: {
    enumOptions: EnumOption[];
  };
}
