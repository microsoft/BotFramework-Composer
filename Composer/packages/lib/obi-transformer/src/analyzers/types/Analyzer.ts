export type AnalyzerTransformationProcess<InputSchema, IntermediaSchema> = {
  select: (input: InputSchema) => IntermediaSchema[];
  validate: (x: IntermediaSchema) => boolean;
  transform: (x: IntermediaSchema) => any;
  options?: {
    required: boolean;
  };
};

export type AnalyzerTransformationCollection<InputSchema, IntermediaSchema> = {
  [feature: string]: AnalyzerTransformationProcess<InputSchema, IntermediaSchema>;
};

export type AnalyzerDefinition<InputSchema, IntermediaSchema, ResultSchema> = {
  before: ((input: InputSchema) => boolean)[];
  after: ((result: ResultSchema) => boolean)[];
  execution: AnalyzerTransformationCollection<InputSchema, IntermediaSchema>;
};
