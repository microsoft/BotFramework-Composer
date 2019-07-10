interface ErrorInput {
  message: string;
  title?: string;
  statusCode?: number;
}

class ServerError extends Error {
  constructor(args: ErrorInput) {
    super(args.message);
    Object.defineProperty(this, 'name', {
      value: this.constructor.name,
    });
    Object.defineProperty(this, 'type', {
      value: this.constructor.name,
    });
    Object.defineProperty(this, 'title', {
      value: args.title ? args.title : this.constructor.name,
    });
    Object.defineProperty(this, 'statusCode', {
      value: args.statusCode ? args.statusCode : 500,
    });
    this.message = args.message;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class AssertError extends ServerError {
  constructor(args: ErrorInput) {
    super(args);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BotConnectError extends ServerError {
  constructor(args: ErrorInput) {
    super(args);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class StorageError extends ServerError {
  constructor(args: ErrorInput) {
    super(args);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ProjectError extends ServerError {
  constructor(args: ErrorInput) {
    super(args);
    Error.captureStackTrace(this, this.constructor);
  }
}
