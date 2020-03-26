// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { Fragment, useDebugValue, useEffect, useState } from 'react';
import { DetailsList, CheckboxVisibility, IDetailsListProps } from 'office-ui-fabric-react/lib/DetailsList';
import { SelectionMode } from 'office-ui-fabric-react/lib/Selection';
import { Separator } from 'office-ui-fabric-react/lib/Separator';
import { Text } from 'office-ui-fabric-react/lib/Text';
import formatMessage from 'format-message';
import { BaseSchema, DesignerData, MicrosoftAdaptiveDialog, ShellData, ShellApi } from '@bfc/shared';

import * as model from './model';
import * as protocol from './protocol';
import * as presenters from './presenters';
import * as actions from './actions';

export type ActionsProps = {
  actions: typeof actions;
};

interface OutputsProps extends ActionsProps {
  outputs: ReadonlyArray<model.Output>;
}

const detailsListAttributes: Partial<IDetailsListProps> = {
  setKey: 'never',
  selectionMode: SelectionMode.single,
  selectionPreservedOnEmptyClick: true,
  checkboxVisibility: CheckboxVisibility.hidden,
  compact: true,
};

const OutputsPresenter: React.FC<OutputsProps> = props => {
  const { outputs } = props;

  type Item = typeof outputs[0];
  const columns = [
    presenters.buildColumn<Item>('seq', ({ remote }) => remote.seq),
    presenters.buildColumn<Item>('output', ({ remote }) => remote.body.output),
    presenters.buildColumn<Item>('variablesReference', ({ remote }) => remote.body.variablesReference),
  ];

  return (
    <DetailsList
      items={outputs as Array<unknown>}
      columns={columns}
      getKey={columns[0].getKey}
      {...detailsListAttributes}
      selectionMode={SelectionMode.none}
    />
  );
};

interface VariablesProps extends ActionsProps {
  variables: ReadonlyArray<model.Variable>;
}

const VariablesPresenter: React.FC<VariablesProps> = props => (
  <presenters.TreeView>
    {props.variables.map(variable => (
      <presenters.TreeItem key={variable.remote.name} leaf={variable.remote.variablesReference === 0}>
        <>
          {variable.remote.name} = {variable.remote.value}
        </>
        <VariablePresenter variable={variable} actions={props.actions} />
      </presenters.TreeItem>
    ))}
  </presenters.TreeView>
);

interface VariableProps extends ActionsProps {
  variable: model.Variable | model.Scope;
}

const VariablePresenter: React.FC<VariableProps> = props => {
  useEffect(() => {
    if (props.variable.lazyVariables.local === 'pending') {
      props.actions.variables(props.variable.remote.variablesReference);
    }
  }, [props.variable]);

  return presenters.lazyMap(props.variable.lazyVariables, variables => (
    <VariablesPresenter variables={variables} actions={props.actions} />
  ));
};

interface ScopesProps extends ActionsProps {
  scopes: ReadonlyArray<model.Scope>;
  selectionScope: presenters.ITypedSelection<model.Scope>;
}

const ScopesPresenter: React.FC<ScopesProps> = props => {
  const { scopes } = props;
  type Item = typeof scopes[0];
  const columns = [presenters.buildColumn<Item>('name', ({ remote }) => remote.name)];

  return (
    <DetailsList
      items={scopes as Array<unknown>}
      columns={columns}
      getKey={columns[0].getKey}
      selection={props.selectionScope}
      {...detailsListAttributes}
    />
  );
};

interface StackFrameProps extends ActionsProps {
  stackFrame: model.StackFrame;
  selectionScope: presenters.ITypedSelection<model.Scope>;
}

const StackFramePresenter: React.FC<StackFrameProps> = props => {
  useEffect(() => {
    if (props.stackFrame.lazyScopes.local === 'pending') {
      props.actions.scopes(props.stackFrame.remote.id);
    }
  }, [props.stackFrame]);

  return presenters.lazyMap(props.stackFrame.lazyScopes, scopes => (
    <ScopesPresenter scopes={scopes} selectionScope={props.selectionScope} actions={props.actions} />
  ));
};

interface EditorProps {
  editor: {
    tryNavigate: (range: protocol.Range) => Promise<boolean>;
  };
}

interface StackFramesProps extends ActionsProps, EditorProps {
  stackFrames: ReadonlyArray<model.StackFrame>;
  selectionFrame: presenters.ITypedSelection<model.StackFrame>;
}

const StackFramesPresenter: React.FC<StackFramesProps> = props => {
  const { stackFrames } = props;
  type Item = typeof stackFrames[0];
  const columns = [
    presenters.buildColumn<Item>('id', ({ remote }) => remote.id),
    presenters.buildColumn<Item>('name', ({ remote }) => remote.name),
    presenters.buildColumn<Item>('item', ({ remote }) => protocol.extensionFor(remote).item),
    presenters.buildColumn<Item>('more', ({ remote }) => protocol.extensionFor(remote).more),
    presenters.buildColumn<Item>('designer', ({ remote }) => protocol.extensionFor(remote).designer?.id),
  ];

  const onItemInvoked = (item: Item) => {
    props.editor.tryNavigate(item.remote);
  };

  return (
    <DetailsList
      items={stackFrames as Array<unknown>}
      columns={columns}
      getKey={columns[0].getKey}
      selection={props.selectionFrame}
      onItemInvoked={onItemInvoked}
      {...detailsListAttributes}
    />
  );
};

interface ThreadProps extends ActionsProps, EditorProps {
  thread: model.Thread;
  selectionFrame: presenters.ITypedSelection<model.StackFrame>;
}

const ThreadPresenter: React.FC<ThreadProps> = props => {
  useEffect(() => {
    const { thread } = props;
    const { lazyStackFrames } = thread;
    if (lazyStackFrames.local === 'pending') {
      props.actions.stackTrace(thread.remote.id);
    } else if (lazyStackFrames.local === 'success') {
      const { item } = lazyStackFrames;
      if (item.length > 0) {
        const _ = props.editor.tryNavigate(item[0].remote);
      }
    }
  }, [props.thread]);

  return presenters.lazyMap(props.thread.lazyStackFrames, stackFrames => (
    <StackFramesPresenter
      stackFrames={stackFrames}
      selectionFrame={props.selectionFrame}
      actions={props.actions}
      editor={props.editor}
    />
  ));
};

interface ThreadsProps extends ActionsProps {
  threads: ReadonlyArray<model.Thread>;
  selectionThread: presenters.ITypedSelection<model.Thread>;
}

const ThreadsPresenter: React.FC<ThreadsProps> = props => {
  const { threads } = props;
  type Item = typeof threads[0];
  const columns = [
    presenters.buildColumn<Item>(formatMessage('id'), ({ remote }) => remote.id),
    presenters.buildColumn<Item>(formatMessage('name'), ({ remote }) => remote.name),
    presenters.buildColumn<Item>(
      formatMessage('control'),
      t => t.stopped,
      ({ remote, stopped }) =>
        stopped ? (
          <Fragment>
            <presenters.Button
              iconName="Next"
              content={formatMessage('Step')}
              onClick={() => props.actions.next(remote.id)}
            />
            <presenters.Button
              iconName="PlayResume"
              content={formatMessage('Resume')}
              onClick={() => props.actions.resume(remote.id)}
            />
          </Fragment>
        ) : (
          <Fragment>
            <presenters.Button
              iconName="Pause"
              content={formatMessage('Pause')}
              onClick={() => props.actions.pause(remote.id)}
            />
          </Fragment>
        )
    ),
  ];

  return (
    <DetailsList
      items={threads as Array<unknown>}
      columns={columns}
      getKey={columns[0].getKey}
      selection={props.selectionThread}
      {...detailsListAttributes}
    />
  );
};

export interface ExtensionProps extends ShellData {
  onChange: (newData: object, updatePath?: string) => void;
  shellApi: ShellApi;
}

interface DebuggerPresenterProps extends ActionsProps, ExtensionProps {
  debuggee: model.Debuggee;
}

type HasDesignerData = Required<Pick<BaseSchema, '$designer'>>;

const hasDesignerData = (item: unknown): item is HasDesignerData =>
  typeof item === 'object' && item !== null && '$designer' in item;

const same = (base: HasDesignerData, data: DesignerData) => base.$designer.id === data.id;

const bindAction = (path: string, item: unknown, query: DesignerData): string | null => {
  if (typeof item === 'object' && item !== null) {
    for (const key in item) {
      const actions = item[key];
      if (Array.isArray(actions)) {
        let index = 0;
        for (const action of actions) {
          const pathAction = `${path}.${key}[${index}]`;
          if (hasDesignerData(action)) {
            if (same(action, query)) {
              return pathAction;
            }
          }

          const pathRecurse = bindAction(pathAction, action, query);
          if (pathRecurse !== null) {
            return pathRecurse;
          }

          ++index;
        }
      }
    }
  }

  return null;
};

const bind = (shellData: ShellData, query: DesignerData): string | null => {
  const { dialogId } = shellData;

  const pathDialog = dialogId;

  const dialog = (shellData.data as unknown) as MicrosoftAdaptiveDialog;

  if (hasDesignerData(dialog)) {
    if (same(dialog, query)) {
      return pathDialog;
    }
  }

  const { triggers } = dialog;
  let triggerIndex = 0;
  for (const trigger of triggers) {
    const pathTrigger = `${pathDialog}?selected=triggers[${triggerIndex}]`;

    if (hasDesignerData(trigger)) {
      if (same(trigger, query)) {
        return pathTrigger;
      }
    }

    const pathAction = `${pathTrigger}&focused=triggers[${triggerIndex}]`;
    const pathRecurse = bindAction(pathAction, trigger, query);
    if (pathRecurse !== null) {
      return pathRecurse;
    }

    ++triggerIndex;
  }

  return null;
};

export const DebuggerPresenter: React.FC<DebuggerPresenterProps> = props => {
  useDebugValue(props, p => p);

  const [selectedThread, selectionThread] = presenters.useSelection<model.Thread>(t => t.remote.id);
  const [selectedFrame, selectionFrame] = presenters.useSelection<model.StackFrame>(f => f.remote.id);
  const [selectedScope, selectionScope] = presenters.useSelection<model.Scope>(s => s.remote.variablesReference);

  const editor: EditorProps['editor'] = {
    tryNavigate: async (range: protocol.Range) => {
      const { designer } = protocol.extensionFor(range);
      if (designer !== null) {
        const path = bind(props, designer);
        if (path !== null) {
          await props.shellApi.navTo(path);
          return true;
        }
      }

      return false;
    },
  };

  return (
    <>
      {presenters.lazyMap(props.debuggee.lazyThreads, threads => (
        <>
          <Separator alignContent="start">Threads</Separator>
          <ThreadsPresenter threads={threads} selectionThread={selectionThread} actions={props.actions} />

          {presenters.bindSelected(model.bindThread, threads, selectedThread, thread => (
            <>
              <Separator alignContent="start">Stack Frames</Separator>
              <ThreadPresenter
                thread={thread}
                selectionFrame={selectionFrame}
                actions={props.actions}
                editor={editor}
              />

              {presenters.lazyMap(thread.lazyStackFrames, stackFrames =>
                presenters.bindSelected(model.bindStackFrame, stackFrames, selectedFrame, frame => (
                  <>
                    <Separator alignContent="start">Scopes</Separator>
                    <StackFramePresenter stackFrame={frame} selectionScope={selectionScope} actions={props.actions} />

                    {presenters.lazyMap(frame.lazyScopes, scopes =>
                      presenters.bindSelected(model.bindScope, scopes, selectedScope, scope => (
                        <>
                          <Separator alignContent="start">Selected Scope {scope.remote.name}</Separator>
                          <VariablePresenter variable={scope} actions={props.actions} />
                        </>
                      ))
                    )}
                  </>
                ))
              )}
            </>
          ))}

          <Separator alignContent="start">Debug Output</Separator>
          <OutputsPresenter outputs={props.debuggee.outputs} actions={props.actions} />
        </>
      ))}
      <Separator alignContent="start">Debug Spew</Separator>
      <Text>{JSON.stringify(props, null, 4)}</Text>
    </>
  );
};
