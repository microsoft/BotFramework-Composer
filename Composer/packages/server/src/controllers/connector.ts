import { BotEnvironments } from '../models/connector';
import BotConnectorService from '../services/connector';

async function connect(req: any, res: any) {
  try {
    const hostName = req.hostname;
    const env: BotEnvironments = req.query && req.query.botEnvironment ? req.query.botEnvironment : 'production';
    const botEndpoint = await BotConnectorService.connect(env, hostName);
    res.send({ botEndpoint });
  } catch (error) {
    res.status(400).json({
      message: 'cannot connect to a bot runtime, make sure you start the bot runtime',
    });
  }
}

async function getPublishHistory(req: any, res: any) {
  try {
    const history = await BotConnectorService.getPublishHistory();
    res.send(history);
  } catch (error) {
    res.status(400).json({
      message: 'Unable to get publish versions: ' + (error instanceof Error ? error.message : error),
    });
  }
}

async function sync(req: any, res: any) {
  try {
    await BotConnectorService.sync({ ...req.body, user: req.user });
    res.send('OK');
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : error,
    });
  }
}

async function publish(req: any, res: any) {
  try {
    const label = req.params ? req.params.label : undefined;
    await BotConnectorService.publish({ ...req.body, user: req.user }, label);
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
  publish: publish,
  getPublishHistory: getPublishHistory,
};
