// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { Fragment, useDebugValue, useEffect, useState } from 'react';
import { ContextualMenu } from 'office-ui-fabric-react/lib/ContextualMenu';
import { DetailsList, CheckboxVisibility, IDetailsListProps } from 'office-ui-fabric-react/lib/DetailsList';
import { Dialog, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import { SelectionMode } from 'office-ui-fabric-react/lib/Selection';
import { Separator } from 'office-ui-fabric-react/lib/Separator';
import { Text } from 'office-ui-fabric-react/lib/Text';
import formatMessage from 'format-message';
import { DesignerData } from '@bfc/shared';

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

interface RowProps extends ActionsProps {
  variable: model.Variable;
}

// https://www.w3schools.com/howto/howto_js_treeview.asp
const Row: React.FC<RowProps> = props => {
  const { variable } = props;

  const [expanded, setExpanded] = useState(false);

  const style: React.CSSProperties = { cursor: 'pointer', userSelect: 'none' };

  const scalar = variable.remote.variablesReference === 0;

  return (
    <li style={style}>
      <span onClick={() => setExpanded(e => !e)}>{scalar ? '.' : expanded ? '-' : '+'}</span>
      {variable.remote.name} = {variable.remote.value}
      {expanded ? <VariablePresenter variable={variable} actions={props.actions} /> : null}
    </li>
  );
};

const VariablesPresenter: React.FC<VariablesProps> = props => {
  const style: React.CSSProperties = { listStyleType: 'none' };

  return (
    <ul style={style}>
      {props.variables.map(variable => (
        <Row key={variable.remote.name} variable={variable} actions={props.actions} />
      ))}
    </ul>
  );
};

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

interface StackFramesProps extends ActionsProps {
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
    const { designer } = protocol.extensionFor(item.remote);
    const x: DesignerData | null = designer;
    x;
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

interface ThreadProps extends ActionsProps {
  thread: model.Thread;
  selectionFrame: presenters.ITypedSelection<model.StackFrame>;
}

const ThreadPresenter: React.FC<ThreadProps> = props => {
  useEffect(() => {
    if (props.thread.lazyStackFrames.local === 'pending') {
      props.actions.stackTrace(props.thread.remote.id);
    }
  }, [props.thread]);

  return presenters.lazyMap(props.thread.lazyStackFrames, stackFrames => (
    <StackFramesPresenter stackFrames={stackFrames} selectionFrame={props.selectionFrame} actions={props.actions} />
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

export interface DebuggerExternalProps {
  onAbort: () => void;
}
interface DebuggerPresenterProps extends DebuggerExternalProps, ActionsProps {
  debuggee: model.Debuggee;
}

export const DebuggerPresenter: React.FC<DebuggerPresenterProps> = props => {
  useDebugValue(props, p => p);

  const [selectedThread, selectionThread] = presenters.useSelection<model.Thread>(t => t.remote.id);
  const [selectedFrame, selectionFrame] = presenters.useSelection<model.StackFrame>(f => f.remote.id);
  const [selectedScope, selectionScope] = presenters.useSelection<model.Scope>(s => s.remote.variablesReference);

  return (
    <Dialog
      hidden={false}
      type={DialogType.normal}
      onDismiss={props.onAbort}
      dialogContentProps={{
        title: formatMessage('Ugly Debugger UI'),
      }}
      modalProps={{
        isBlocking: false,
        dragOptions: {
          moveMenuItemText: formatMessage('Move'),
          closeMenuItemText: formatMessage('Close'),
          menu: ContextualMenu,
        },
      }}
      maxWidth="70%"
    >
      <>
        {presenters.lazyMap(props.debuggee.lazyThreads, threads => (
          <>
            <Separator alignContent="start">Threads</Separator>
            <ThreadsPresenter threads={threads} selectionThread={selectionThread} actions={props.actions} />

            {presenters.bindSelected(model.bindThread, threads, selectedThread, thread => (
              <>
                <Separator alignContent="start">Stack Frames</Separator>
                <ThreadPresenter thread={thread} selectionFrame={selectionFrame} actions={props.actions} />

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
    </Dialog>
  );
};
