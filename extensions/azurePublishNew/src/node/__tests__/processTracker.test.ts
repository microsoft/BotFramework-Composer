// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { createProcessTracker } from '../processTracker';

describe('processTracker', () => {
  describe('start method', () => {
    it('start initializes with defaults', () => {
      const tracker = createProcessTracker();
      expect(tracker).toBeDefined();

      const actual = tracker.start({
        processName: 'process',
        projectId: 'project',
      });

      expect(actual.config).toBeUndefined();
      expect(actual.comment).toBeUndefined();
      expect(actual.id).toBeDefined();
      expect(actual.log).toBeDefined();
      expect(actual.log.length).toEqual(0);
      expect(actual.message).toEqual('');
      expect(actual.projectId).toEqual('project');
      expect(actual.processName).toEqual('process');
      expect(actual.status).toEqual(202);
      expect(actual.time.valueOf()).toBeLessThanOrEqual(new Date().valueOf());
    });

    it('start initializes with optional values', () => {
      const tracker = createProcessTracker();
      expect(tracker).toBeDefined();

      const now = new Date();
      const config = { name: 'config' };

      const actual = tracker.start({
        processName: 'process',
        projectId: 'project',
        comment: 'comment',
        config: config,
        message: 'message',
        status: 404,
        time: now,
      });

      expect(actual.config).toEqual(config);
      expect(actual.comment).toEqual('comment');
      expect(actual.id).toBeDefined();
      expect(actual.log).toBeDefined();
      expect(actual.log.length).toEqual(1);
      expect(actual.log[0]).toEqual('message');
      expect(actual.message).toEqual('message');
      expect(actual.projectId).toEqual('project');
      expect(actual.processName).toEqual('process');
      expect(actual.status).toEqual(404);
      expect(actual.time.valueOf()).toEqual(now.valueOf());
    });

    it('start tracks multiple processes', () => {
      const tracker = createProcessTracker();
      expect(tracker).toBeDefined();

      const status1 = tracker.start({
        processName: 'process1',
        projectId: 'project1',
      });

      const status2 = tracker.start({
        processName: 'process2',
        projectId: 'project2',
      });

      const status3 = tracker.start({
        processName: 'process3',
        projectId: 'project3',
      });

      const actual1 = tracker.get(status1.id);
      const actual2 = tracker.get(status2.id);
      const actual3 = tracker.get(status3.id);

      expect(actual1).toBeDefined();
      expect(actual1.projectId).toEqual('project1');
      expect(actual2).toBeDefined();
      expect(actual2.projectId).toEqual('project2');
      expect(actual3).toBeDefined();
      expect(actual3.projectId).toEqual('project3');
    });
  });

  describe('getByName method', () => {
    it('getByName finds status', () => {
      const tracker = createProcessTracker();
      expect(tracker).toBeDefined();

      tracker.start({
        processName: 'process1',
        projectId: 'project1',
      });

      tracker.start({
        processName: 'process2',
        projectId: 'project2',
      });

      tracker.start({
        processName: 'process3',
        projectId: 'project3',
      });

      const actual = tracker.getByName('process2');
      expect(actual).toBeDefined();
      expect(actual.projectId).toEqual('project2');
    });

    it('getByName returns undefined when no matching status', () => {
      const tracker = createProcessTracker();
      expect(tracker).toBeDefined();

      tracker.start({
        processName: 'process1',
        projectId: 'project1',
      });

      tracker.start({
        processName: 'process2',
        projectId: 'project2',
      });

      tracker.start({
        processName: 'process3',
        projectId: 'project3',
      });

      const actual = tracker.getByName('does-not-exist');
      expect(actual).toBeUndefined();
    });

    it('getByName finds most recent of same name', () => {
      const tracker = createProcessTracker();
      expect(tracker).toBeDefined();

      const timeA = new Date('1/1/2001');
      const timeB = new Date('2/1/2001');

      tracker.start({
        processName: 'process1',
        projectId: 'project1',
      });

      tracker.start({
        processName: 'process2',
        projectId: 'project2A',
        time: timeA,
      });

      tracker.start({
        processName: 'process3',
        projectId: 'project3',
      });

      tracker.start({
        processName: 'process2',
        projectId: 'project2B',
        time: timeB,
      });

      const actual = tracker.getByName('process2');
      expect(actual).toBeDefined();
      expect(actual.projectId).toEqual('project2B');
    });
  });

  describe('update method', () => {
    it('update modifies status', () => {
      const tracker = createProcessTracker();
      expect(tracker).toBeDefined();

      const status = tracker.start({
        processName: 'process',
        projectId: 'project',
      });

      const config = { name: 'config' };

      tracker.update(status.id, { status: 200, message: 'update message', config });

      const actual = tracker.get(status.id);
      expect(actual).toBeDefined();
      expect(actual.status).toEqual(200);
      expect(actual.log.length).toEqual(1);
      expect(actual.log[0]).toEqual('update message');
      expect(actual.message).toEqual('update message');
      expect(actual.config).toEqual(config);
    });

    it('update overwrites config', () => {
      const tracker = createProcessTracker();
      expect(tracker).toBeDefined();

      const config1 = { name: 'config1' };
      const config2 = { name: 'config2' };
      const config3 = { name: 'config3' };
      const config4 = { name: 'config4' };

      const status = tracker.start({
        processName: 'process',
        projectId: 'project',
        config: config1,
      });

      tracker.update(status.id, { status: 200, message: 'message2', config: config2 });
      tracker.update(status.id, { status: 200, message: 'message3', config: config3 });
      tracker.update(status.id, { status: 200, message: 'message4', config: config4 });

      const actual = tracker.get(status.id);
      expect(actual).toBeDefined();
      expect(actual.config).toEqual(config4);
    });

    it('update overwrites message', () => {
      const tracker = createProcessTracker();
      expect(tracker).toBeDefined();

      const status = tracker.start({
        processName: 'process',
        projectId: 'project',
        message: 'message1',
      });

      tracker.update(status.id, { status: 200, message: 'message2' });
      tracker.update(status.id, { status: 200, message: 'message3' });
      tracker.update(status.id, { status: 200, message: 'message4' });

      const actual = tracker.get(status.id);
      expect(actual).toBeDefined();
      expect(actual.message).toEqual('message4');
    });

    it('update appends to log', () => {
      const tracker = createProcessTracker();
      expect(tracker).toBeDefined();

      const status = tracker.start({
        processName: 'process',
        projectId: 'project',
        message: 'message1',
      });

      tracker.update(status.id, { status: 200, message: 'message2' });
      tracker.update(status.id, { status: 200, message: 'message3' });
      tracker.update(status.id, { status: 200, message: 'message4' });

      const actual = tracker.get(status.id);
      expect(actual).toBeDefined();
      expect(actual.log.length).toEqual(4);
      expect(actual.log[0]).toEqual('message1');
      expect(actual.log[1]).toEqual('message2');
      expect(actual.log[2]).toEqual('message3');
      expect(actual.log[3]).toEqual('message4');
      expect(actual.message).toEqual('message4');
    });

    it('update overwrites status', () => {
      const tracker = createProcessTracker();
      expect(tracker).toBeDefined();

      const status = tracker.start({
        processName: 'process',
        projectId: 'project',
        status: 201,
      });

      tracker.update(status.id, { status: 202, message: 'message' });
      tracker.update(status.id, { status: 203, message: 'message' });
      tracker.update(status.id, { status: 204, message: 'message' });

      const actual = tracker.get(status.id);
      expect(actual).toBeDefined();
      expect(actual.status).toEqual(204);
    });

    it('update no-op for non-existent process', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      try {
        const tracker = createProcessTracker();
        expect(tracker).toBeDefined();

        tracker.start({
          processName: 'process1',
          projectId: 'project1',
        });

        tracker.start({
          processName: 'process2',
          projectId: 'project2',
        });

        tracker.start({
          processName: 'process3',
          projectId: 'project3',
        });

        tracker.update('does-not-exist', { status: 202, message: 'message' });
        const actual = tracker.get('does-not-exist');
        expect(actual).toBeUndefined();
      } finally {
        warnSpy.mockRestore();
      }
    });
  });

  describe('stop method', () => {
    it('stop removes status', () => {
      const tracker = createProcessTracker();
      expect(tracker).toBeDefined();

      tracker.start({
        processName: 'process1',
        projectId: 'project1',
      });

      tracker.start({
        processName: 'process2',
        projectId: 'project2',
      });

      const status3 = tracker.start({
        processName: 'process3',
        projectId: 'project3',
      });

      tracker.start({
        processName: 'process4',
        projectId: 'project4',
      });

      tracker.stop(status3.id);
      const actual = tracker.get(status3.id);
      expect(actual).toBeUndefined();
    });

    it('stop no-op for non-existent process', () => {
      const tracker = createProcessTracker();
      expect(tracker).toBeDefined();

      tracker.start({
        processName: 'process1',
        projectId: 'project1',
      });

      tracker.start({
        processName: 'process2',
        projectId: 'project2',
      });

      tracker.start({
        processName: 'process3',
        projectId: 'project3',
      });

      tracker.stop('does-not-exist');
      const actual = tracker.get('does-not-exist');
      expect(actual).toBeUndefined();
    });
  });
});
