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
import { ActionTypes } from '../../constants';

// Actions that have concrete types that should not be included in the generic type
type ConcreteActions =
  | ActionTypes.CREATE_DIALOG_SUCCESS
  | ActionTypes.SET_ERROR
  | ActionTypes.USER_LOGIN_SUCCESS
  | ActionTypes.USER_LOGIN_FAILURE
  | ActionTypes.USER_SESSION_EXPIRED;

export interface GenericActionType {
  type: Exclude<ActionTypes, ConcreteActions>;
  payload?: any;
  error?: any;
}

interface SetErrorActionType {
  type: ActionTypes.SET_ERROR;
  payload: {
    summary: string;
    message?: string;
  };
}

interface CreateDialogSuccessAction {
  type: ActionTypes.CREATE_DIALOG_SUCCESS;
  payload: { response: any };
}

// User Actions
export interface UserTokenPayload {
  token?: string | null;
  email?: string;
  name?: string;
  expiration?: number;
}

interface UserLoginSuccessAction {
  type: ActionTypes.USER_LOGIN_SUCCESS;
  payload: UserTokenPayload;
}

interface UserLoginFailureAction {
  type: ActionTypes.USER_LOGIN_FAILURE;
}

interface UserSessionExpiredAction {
  type: ActionTypes.USER_SESSION_EXPIRED;
  payload: {
    expired: boolean;
  };
}

export type ActionType =
  | SetErrorActionType
  | CreateDialogSuccessAction
  | UserLoginSuccessAction
  | UserLoginFailureAction
  | UserSessionExpiredAction
  | GenericActionType;
