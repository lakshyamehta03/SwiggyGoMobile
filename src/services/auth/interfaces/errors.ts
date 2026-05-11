export class PollingTimeoutError extends Error {
  constructor() {
    super('Authentication timed out. Please try again.');
    this.name = 'PollingTimeoutError';
  }
}

export class PollingAbortedError extends Error {
  constructor() {
    super('Authentication was cancelled.');
    this.name = 'PollingAbortedError';
  }
}

export class PollingFailedError extends Error {
  constructor(reason: string) {
    super(reason);
    this.name = 'PollingFailedError';
  }
}
