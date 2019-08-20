import { State } from './../../types';
import { RevertibleState } from './types';
import { UNDO_LIMIT } from './../../../constants/index';
import { ClientStorage } from './../../../utils/storage';

const KEY = 'undoHistory';
class UndoHistory {
  static default = {
    past: [],
    future: [],
  };

  private past: Array<RevertibleState[]>;
  private future: Array<RevertibleState[]>;
  private limit: number = 10;
  private storage: ClientStorage;

  constructor(limit: number) {
    this.limit = limit;
    this.storage = new ClientStorage(window.sessionStorage);
    const { past, future } = this.storage.get(KEY, UndoHistory.default);
    this.past = past;
    this.future = future;
  }

  //add presentState to future array
  undo = (presentState: State, pastRevertibleStates: RevertibleState[]) => {
    if (this.canUndo()) {
      const item = pastRevertibleStates.reduce((result: RevertibleState[], pastRevertibleState, index) => {
        if (index === pastRevertibleStates.length - 1) {
          result.push({ action: pastRevertibleState.action, state: presentState });
        } else {
          result.push({ action: pastRevertibleState.action, state: pastRevertibleStates[index + 1].state });
        }
        return result;
      }, []);

      this.future = [item, ...this.future];
      if (this.future.length > this.limit) {
        this.future = this.future.slice(0, this.limit);
      }
      this.past = this.past.slice(0, this.past.length - 1);
      this.set(this.past, this.future);
    }
  };

  //add presentState to past array
  redo = (presentState: State, futureRevertibleStates: RevertibleState[]) => {
    if (this.canRedo()) {
      const item = futureRevertibleStates.reduce((result: RevertibleState[], futureRevertibleState, index) => {
        if (index === 0) {
          result.push({ action: futureRevertibleState.action, state: presentState });
        } else {
          result.push({ action: futureRevertibleState.action, state: futureRevertibleStates[index - 1].state });
        }
        return result;
      }, []);
      this.past = [...this.past, item];
      if (this.past.length > this.limit) {
        this.past = this.past.slice(this.past.length - this.limit);
      }
      this.future = this.future.slice(1, this.future.length);
      this.set(this.past, this.future);
    }
  };

  add = (state, action) => {
    const item = { action, state };
    const last = this.getPastHistoryItem();
    if (this.past.length > 0 && action.guid && action.guid === last[0].action.guid) {
      this.past[this.past.length - 1].push(item);
    } else {
      this.past = [...this.past, [item]];
      if (this.past.length > this.limit) {
        this.past = this.past.slice(this.past.length - this.limit);
      }
    }
    this.future = [];
    this.set(this.past, this.future);
  };

  clear = () => {
    this.past = [];
    this.future = [];
    this.set(this.past, this.future);
  };

  setLimit = limit => {
    this.limit = limit;
  };

  set = (past: Array<RevertibleState[]>, future: Array<RevertibleState[]>) => {
    this.storage.set(KEY, { past, future });
  };

  getPastHistoryItem = () => this.past[this.past.length - 1];
  getFutureHistoryItem = () => this.future[0];
  canUndo = () => this.past.length > 0;
  canRedo = () => this.future.length > 0;
}

const undoHistory = new UndoHistory(UNDO_LIMIT);
export default undoHistory;
