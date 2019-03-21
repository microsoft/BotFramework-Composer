export type Analyzer<InputSchema, IntermediaSchema, ResultSchema> = {
  before: ((input: InputSchema) => boolean)[];
  after: ((result: ResultSchema) => boolean)[];
  transform: {
    [feature: string]: {
      select: (input: InputSchema) => IntermediaSchema[];
      validate: (x: IntermediaSchema) => boolean;
      transform: (x: IntermediaSchema) => any;
    };
  };
};
