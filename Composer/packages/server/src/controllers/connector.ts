import BotConnectorService from '../services/connector';

async function connect(req: any, res: any) {
  try {
    await BotConnectorService.connect();
    res.send('OK');
  } catch (error) {
    res.status(400).json({
      message: 'cannot connect to a bot runtime, make sure you start the bot runtime',
    });
  }
}

async function sync(req: any, res: any) {
  try {
    await BotConnectorService.sync(req.body);
    res.send('OK');
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : error,
    });
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
