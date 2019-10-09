import { BotEnvironments } from '../models/connector';
import { EnvironmentProvider } from '../models/environment';

async function connect(req: any, res: any) {
  try {
    const hostName = req.hostname;
    const env: BotEnvironments = req.query && req.query.botEnvironment ? req.query.botEnvironment : 'production';
    const environment = EnvironmentProvider.getCurrent();
    const botEndpoint = await environment.getBotConnector().connect(env || 'production', hostName);
    res.send({ botEndpoint });
  } catch (error) {
    res.status(400).json({
      message: 'cannot connect to a bot runtime, make sure you start the bot runtime',
    });
  }
}

async function sync(req: any, res: any) {
  try {
    const environment = EnvironmentProvider.getCurrent();
    await environment.getBotConnector().sync({ ...req.body, user: req.user });
    res.send('OK');
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : error,
    });
  }
}

function status(req: any, res: any) {
  const environment = EnvironmentProvider.getCurrent();
  res.send(environment.getBotConnector().status);
}

export const BotConnectorController = {
  connect: connect,
  sync: sync,
  status: status,
};
