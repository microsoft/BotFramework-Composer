import httpClient from './httpUtil';

enum CircuitBreakerStateEnum {
  Closed,
  Open,
}

export class PublishStatusPollingUpdater {
  private status;
  private timerId = 0;
  private targetName;
  private botId;
  private pollingInterval = 10000;

  constructor(targetName, botId) {
    this.targetName = targetName;
    this.botId = botId;
  }

  async start(onData) {
    if (this.status === CircuitBreakerStateEnum.Open) return;
    this.status = CircuitBreakerStateEnum.Open;
    this.timerId = window.setInterval(async () => {
      try {
        const response = await httpClient.get(`/publish/${this.botId}/status/${this.targetName}`);
        onData && onData({ botId: this.botId, targetName: this.targetName, apiResponse: response });
      } catch (err) {
        onData && onData({ botId: this.botId, targetName: this.targetName, apiResponse: err.response });
      }
    }, this.pollingInterval);
  }
  stop() {
    window.clearInterval(this.timerId);
    this.timerId = 0;
    this.status = CircuitBreakerStateEnum.Closed;
  }
  getProperty() {
    return { botId: this.botId, targetName: this.targetName };
  }
}
