// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DebugProtocol as DP } from 'vscode-debugprotocol';

import * as lazy from './lazy';

export interface Thing<Remote> {
  readonly remote: Remote;
}

export interface Variables {
  readonly lazyVariables: lazy.Lazy<ReadonlyArray<Variable>>;
}

export interface Variable extends Thing<DP.Variable>, Variables {}

export interface Scope extends Thing<DP.Scope>, Variables {}

export interface StackFrame extends Thing<DP.StackFrame> {
  readonly lazyScopes: lazy.Lazy<ReadonlyArray<Scope>>;
}

export interface Thread extends Thing<DP.Thread> {
  readonly stopped: boolean;
  readonly lazyStackFrames: lazy.Lazy<ReadonlyArray<StackFrame>>;
}

export type Output = Thing<DP.OutputEvent>;

export interface Debuggee {
  readonly lazyThreads: lazy.Lazy<ReadonlyArray<Thread>>;
  readonly outputs: ReadonlyArray<Output>;
}

// type Key<T> = (item: T) => string | number;

export type Bind<State extends Thing<Remote>, Remote> = (
  state: ReadonlyArray<State> | undefined,
  remote: Remote
) => State | undefined;

type BindName<State extends Thing<Remote>, Remote extends { name: string }> = Bind<State, Remote>;

type BindId<State extends Thing<Remote>, Remote extends { name: string }> = Bind<State, Remote>;

export const bindVariable: BindName<Variable, DP.Variable> = (variables, remote) =>
  variables !== undefined ? variables.find(t => t.remote.name === remote.name) : undefined;

export const bindStackFrame: BindName<StackFrame, DP.StackFrame> = (stackFrames, remote) =>
  stackFrames !== undefined ? stackFrames.find(t => t.remote.id === remote.id) : undefined;

export const bindScope: BindName<Scope, DP.Scope> = (scopes, remote) =>
  scopes !== undefined ? scopes.find(t => t.remote.name === remote.name) : undefined;

export const bindThread: BindId<Thread, DP.Thread> = (threads, remote) =>
  threads !== undefined ? threads.find(t => t.remote.id === remote.id) : undefined;
