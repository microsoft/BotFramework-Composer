// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { ProcessStatus } from '@botframework-composer/types';
import { v4 as uuid } from 'uuid';

type ProcessStatusStart = Omit<Partial<ProcessStatus>, 'id' | 'projectId' | 'processName' | 'log'> &
  Pick<ProcessStatus, 'projectId' | 'processName'>;

type ProcessStatusUpdate = Pick<Partial<ProcessStatus>, 'status' | 'message' | 'config'>;

/**
 * Creates a tracker of ProcessStatus.
 */
export const createProcessStatusTracker = () => {
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
   * Gets the first, most recent matching process name.
   */
  const getByProcessName = (processName: string) => {
    const matches = Object.values(statusById)
      .filter((status) => status.processName === processName)
      .sort((a, b) => b.time.valueOf() - a.time.valueOf());
    return matches?.[0];
  };

  /**
   * Gets the first, most recent matching project ID.
   */
  const getByProjectId = (projectId: string) => {
    const matches = Object.values(statusById)
      .filter((status) => status.projectId === projectId)
      .sort((a, b) => b.time.getTime() - a.time.getTime());
    return matches?.[0];
  };

  /**
   * Updates the status of the process with the specified ID.
   */
  const update = (id: string, statusUpdate: ProcessStatusUpdate) => {
    if (statusById[id]) {
      if (statusUpdate.status) {
        statusById[id].status = statusUpdate.status;
      }
      if (statusUpdate.message) {
        statusById[id].message = statusUpdate.message;
        statusById[id].log.push(statusUpdate.message);
      }
      if (statusUpdate.config) {
        statusById[id].config = statusUpdate.config;
      }
    } else {
      throw new Error(`processTracker.update called for process ${id} that does not exist.`);
    }
  };

  /**
   * Stops tracking the status of the process with the specified ID.
   */
  const stop = (id: string) => {
    if (statusById[id]) {
      delete statusById[id];
    } else {
      throw new Error(`processTracker.stop called for process ${id} that does not exist.`);
    }
  };

  return {
    start,
    get,
    getByProcessName,
    getByProjectId,
    update,
    stop,
  };
};
