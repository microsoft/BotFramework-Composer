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
    res.status(404).send('No such publisher');
  }
}

export const PublisherController = {
  getPublishers,
  status,
};
