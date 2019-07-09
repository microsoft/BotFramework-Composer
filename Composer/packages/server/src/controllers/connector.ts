import BotConnectorService from '../services/connector';
import { BotConnectError } from '../models/serverError/serverError';

async function connect(req: any, res: any) {
  try {
    await BotConnectorService.connect();
    res.send('OK');
  } catch (error) {
    res.status(400).json(
      new BotConnectError({
        message: 'cannot connect to a bot runtime, make sure you start the bot runtime',
        statusCode: 400,
        title: 'Connect Error',
      })
    );
  }
}

async function sync(req: any, res: any) {
  try {
    await BotConnectorService.sync(req.body);
    res.send('OK');
  } catch (error) {
    res.status(400).json(
      new BotConnectError({
        message: error instanceof Error ? error.message : error,
        statusCode: 400,
        title: 'Sync Error',
      })
    );
  }
}

function status(req: any, res: any) {
  res.send(BotConnectorService.status());
}

export const BotConnectorController = {
  connect: connect,
  sync: sync,
  status: status,
};
