import { Request, Response } from 'express';

import PublisherService from '../services/publisher';

async function getPublishers(req: Request, res: Response) {
  res.status(200).json(PublisherService.getPublishers());
}

async function status(req: Request, res: Response) {
  const pid = req.params && req.params.pid;
  try {
    const status = await PublisherService.status(pid);
    res.status(200).send({
      online: status,
    });
  } catch (e) {
    res.status(404).send(e.message);
  }
}

async function publish(req: Request, res: Response) {
  const pid = req.params && req.params.pid;
  const version = req.query && req.query.version;
  try {
    const result = await PublisherService.publish(pid, version);
    res.status(200).send(result);
  } catch (e) {
    res.status(404).send(e.message);
  }
}

async function history(req: Request, res: Response) {
  const pid = req.params && req.params.pid;
  try {
    const result = await PublisherService.history(pid);
    res.status(200).send(result);
  } catch (e) {
    res.status(404).send(e.message);
  }
}

async function rollback(req: Request, res: Response) {
  const pid = req.params && req.params.pid;
  const version = req.query && req.query.version;
  try {
    const result = await PublisherService.rollback(pid, version);
    res.status(200).send(result);
  } catch (e) {
    res.status(404).send(e.message);
  }
}

export const PublisherController = {
  getPublishers,
  status,
  publish,
  history,
  rollback,
};
