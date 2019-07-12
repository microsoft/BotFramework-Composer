interface ErrorInput {
  message: string;
  title?: string;
  statusCode?: number;
}

class ServerError extends Error {
  type: string;
  title: string;
  statusCode: number | undefined;
  error: string;
  constructor(args: ErrorInput) {
    super(args.message);
    this.name = this.constructor.name;
    this.type = this.constructor.name;
    this.title = args.title ? args.title : this.constructor.name;
    this.statusCode = args.statusCode ? args.statusCode : 500;
    this.message = args.message;
    this.error = args.message;
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
