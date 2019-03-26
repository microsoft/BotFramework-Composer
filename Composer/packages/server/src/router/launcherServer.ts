import express, { Router } from 'express';

import { startServer, stopServer, getStatus } from '../handlers/launcherHandler';

const router: Router = express.Router({});

router.get('/start', function(req: any, res: any, next: any) {
  try {
    startServer();
    res.send('OK');
  } catch (error) {
    res.status(400).json({ error: 'Start error' });
  }
});

router.get('/stop', function(req: any, res: any, next: any) {
  try {
    stopServer();
    res.send('OK');
  } catch (error) {
    res.status(400).json({ error: 'Stop error' });
  }
});

router.get('/status', function(req: any, res: any, next: any) {
  res.send(getStatus());
});

export const launcherServerRouter: Router = router;
