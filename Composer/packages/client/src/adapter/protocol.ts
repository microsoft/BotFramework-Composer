// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DebugProtocol as DP } from 'vscode-debugprotocol';
import { DesignerData } from '@bfc/shared';

const make = <T>() => (null as unknown) as T;

const messageByType = {
  request: make<DP.Request>(),
  response: make<DP.Response>(),
  event: make<DP.Event>(),
};

type MessageByType = typeof messageByType;
export type TypeName = keyof MessageByType;

export const isType = <T extends TypeName>(m: DP.ProtocolMessage, type: T): m is MessageByType[T] => m.type === type;

const eventByType = {
  initialized: make<DP.InitializedEvent>(),
  output: make<DP.OutputEvent>(),
  thread: make<DP.ThreadEvent>(),
  continued: make<DP.ContinuedEvent>(),
  stopped: make<DP.StoppedEvent>(),
};

type TypeByEvent = typeof eventByType;
export type Event = keyof TypeByEvent;

export const isEvent = <E extends Event>(m: DP.ProtocolMessage, event: E): m is TypeByEvent[E] =>
  isType(m, 'event') && m.event === event;

const triple = <Request extends DP.Request, Arguments extends object, Response extends DP.Response>(): [
  Request,
  Arguments,
  Response
] => [make<Request>(), make<Arguments>(), make<Response>()];

const commandByType = {
  initialize: triple<DP.InitializeRequest, DP.InitializeRequestArguments, DP.InitializeResponse>(),
  setExceptionBreakpoints: triple<
    DP.SetExceptionBreakpointsRequest,
    DP.SetExceptionBreakpointsArguments,
    DP.SetExceptionBreakpointsResponse
  >(),
  setFunctionBreakpoints: triple<
    DP.SetFunctionBreakpointsRequest,
    DP.SetFunctionBreakpointsArguments,
    DP.SetFunctionBreakpointsResponse
  >(),
  configurationDone: triple<DP.ConfigurationDoneRequest, DP.ConfigurationDoneArguments, DP.ConfigurationDoneResponse>(),
  attach: triple<DP.AttachRequest, DP.AttachRequestArguments, DP.AttachResponse>(),
  threads: triple<DP.ThreadsRequest, {}, DP.ThreadsResponse>(),
  stackTrace: triple<DP.StackTraceRequest, DP.StackTraceArguments, DP.StackTraceResponse>(),
  scopes: triple<DP.ScopesRequest, DP.ScopesArguments, DP.ScopesResponse>(),
  variables: triple<DP.VariablesRequest, DP.VariablesArguments, DP.VariablesResponse>(),
  pause: triple<DP.PauseRequest, DP.PauseArguments, DP.PauseResponse>(),
  next: triple<DP.NextRequest, DP.NextArguments, DP.NextResponse>(),
  continue: triple<DP.ContinueRequest, DP.ContinueArguments, DP.ContinueResponse>(),
  evaluate: triple<DP.EvaluateRequest, DP.EvaluateArguments, DP.EvaluateResponse>(),
};

type TypeByCommand = typeof commandByType;
export type Command = keyof TypeByCommand;
export type Request<C extends Command = Command> = TypeByCommand[C][0];
export type Arguments<C extends Command = Command> = TypeByCommand[C][1];
export type Response<C extends Command = Command> = TypeByCommand[C][2];

export const isRequest = <C extends Command>(m: DP.ProtocolMessage, command: C): m is Request<C> =>
  isType(m, 'request') && m.command === command;

export const isResponse = <C extends Command>(m: DP.ProtocolMessage, command: C): m is Response<C> =>
  isType(m, 'response') && m.command === command;

export type OpenAction = {
  type: 'open';
};

export type From = 'client' | 'server';

export type MessageAction<T extends TypeName, M extends DP.ProtocolMessage = DP.ProtocolMessage> = {
  type: T;
  from: From;
  message: M;
};

export type EventAction<E extends Event = Event> = MessageAction<'event', TypeByEvent[E]>;

export type RequestAction<C extends Command = Command> = MessageAction<'request', Request<C>>;

export type ResponseAction<C extends Command = Command> = MessageAction<'response', Response<C>> & {
  request: Request<C>;
};

export type Action = OpenAction | EventAction | RequestAction | ResponseAction;

export const isOpenAction = (action: Action): action is OpenAction => action.type === 'open';

export const isEventAction = <E extends Event>(action: Action, from: From, event?: E): action is EventAction<E> => {
  if (action.type !== 'event') {
    return false;
  }

  if (action.from != from) {
    return false;
  }

  if (event === undefined) {
    return true;
  }

  return isEvent(action.message, event);
};

export const isRequestAction = <C extends Command>(
  action: Action,
  from: From,
  command?: C
): action is RequestAction<C> => {
  if (action.type !== 'request') {
    return false;
  }

  if (action.from != from) {
    return false;
  }

  if (command === undefined) {
    return true;
  }

  const { message } = action;
  return isRequest(message, command);
};

export const isResponseAction = <C extends Command>(
  action: Action,
  from: From,
  command?: C
): action is ResponseAction<C> => {
  if (action.type !== 'response') {
    return false;
  }

  if (action.from != from) {
    return false;
  }

  if (command === undefined) {
    return true;
  }

  const { request, message } = action;
  return isRequest(request, command) && isResponse(message, command) && request.seq === message.request_seq;
};

export const isSendAction = (action: Action): action is RequestAction | EventAction => {
  if (action.type !== 'request' && action.type !== 'event') {
    return false;
  }

  if (action.from != 'client') {
    return false;
  }

  return true;
};

export const actionFrom = (from: From, message: DP.ProtocolMessage, requestBySeq: Map<number, DP.Request>): Action => {
  if (isType(message, 'request')) {
    return { type: 'request', from, message };
  } else if (isType(message, 'response')) {
    // eslint-disable-next-line @typescript-eslint/camelcase
    const { request_seq } = message;
    const request = requestBySeq.get(request_seq);
    if (request === undefined) {
      throw new Error();
    }

    requestBySeq.delete(request_seq);

    return { type: 'response', from, message, request };
  } else if (isType(message, 'event')) {
    return { type: 'event', from, message };
  } else {
    throw new Error();
  }
};

type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

interface Extension {
  item: string;
  more: string;
  designer: DesignerData;
}

export const extensionFor = (range: DP.StackFrame | DP.Breakpoint): Nullable<Extension> =>
  (range as unknown) as Nullable<Extension>;
