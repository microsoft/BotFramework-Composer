import BotConnectorService from '../services/connector';

function start(req: any, res: any) {
  try {
    BotConnectorService.start();
    res.send('OK');
  } catch (error) {
    res.status(400).json({ error: 'Start error' });
  }
}

function stop(req: any, res: any) {
  try {
    BotConnectorService.stop();
    res.send('OK');
  } catch (error) {
    res.status(400).json({ error: 'Stop error' });
  }
}

function status(req: any, res: any) {
  res.send(BotConnectorService.status());
}

export const BotConnectorController = {
  start: start,
  stop: stop,
  status: status,
};
