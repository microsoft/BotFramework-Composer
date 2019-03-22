export type SelectorUnit<InputSchema, IntermediaSchema> = {
  select: (input: InputSchema) => IntermediaSchema[];
  validate: (x: IntermediaSchema) => boolean;
  options?: {
    required: boolean;
  };
};

export type SelectorUnitCollection<InputSchema, IntermediaSchema> = {
  [feature: string]: SelectorUnit<InputSchema, IntermediaSchema>;
};

export type SelectorPolicy<InputSchema, IntermediaSchema, ResultSchema> = {
  before: ((input: InputSchema) => boolean)[];
  after: ((result: ResultSchema) => boolean)[];
  execution: SelectorUnitCollection<InputSchema, IntermediaSchema>;
};
