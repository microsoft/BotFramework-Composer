// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { ProcessStatus } from '@botframework-composer/types';
import { v4 as uuid } from 'uuid';

type ProcessStatusStart = Omit<Partial<ProcessStatus>, 'id' | 'projectId' | 'processName' | 'log'> & {
  projectId: string;
  processName: string;
};

type ProcessStatusUpdate = Pick<Partial<ProcessStatus>, 'status' | 'message' | 'config'>;

/**
 * Creates a tracker of ProcessStatus.
 * The tracker avoids throwing errors to prevent status tracking from halting the process itself.
 */
export const createProcessTracker = () => {
  const statusById: Record<string, ProcessStatus> = {};

  /**
   * Starts tracking a new process
   */
  const start = (startStatus: ProcessStatusStart): ProcessStatus => {
    const id = uuid();
    statusById[id] = {
      message: '',
      status: 202,
      time: new Date(),
      ...startStatus,
      id: id,
      log: startStatus.message ? [startStatus.message] : [],
    };
    return statusById[id];
  };

  /**
   * Gets the latest status of the process with the specified ID.
   */
  const get = (id: string) => {
    return statusById[id];
  };

  /**
   * Gets the first, most recent matching process by name.
   */
  const getByName = (name: string) => {
    const matches = Object.values(statusById)
      .filter((status) => status.processName === name)
      .sort((a, b) => b.time.valueOf() - a.time.valueOf());
    return matches?.[0];
  };

  /**
   * Updates the status of the process with the specified ID.
   */
  const update = (id: string, update: ProcessStatusUpdate) => {
    if (statusById[id]) {
      statusById[id].status = update.status;
      statusById[id].message = update.message;
      statusById[id].log.push(update.message);
      statusById[id].config = update.config || statusById[id].config;
    } else {
      console.warn(`processTracker.update called for process ${id} that does not exist.`);
    }
  };

  /**
   * Stops tracking the status of the process with the specified ID.
   */
  const stop = (id: string) => {
    delete statusById[id];
  };

  return {
    start,
    get,
    getByName,
    update,
    stop,
  };
};
