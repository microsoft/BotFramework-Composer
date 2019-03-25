import { StringIndexedCollection } from '../../types/StringIndexedCollection';
import { TraceableData } from '../../types/TraceableData';

export type BeforeHandler<InputType> = (input: InputType) => boolean;
export type AfterHandler<OutputType> = (result: StringIndexedCollection<OutputType[]>) => boolean;

export type SelectorUnit<InputType, OutputType> = {
  select: (input: InputType) => OutputType[];
  validate: (x: OutputType) => boolean;
  options?: {
    required: boolean;
  };
};

export type SelectorPolicy<InputType, OutputType> = {
  before: BeforeHandler<InputType>[];
  after: AfterHandler<OutputType>[];
  execution: StringIndexedCollection<SelectorUnit<InputType, OutputType>>;
};

export type TraceableSelectorPolicy<InputSchema, PayloadType> = SelectorPolicy<InputSchema, TraceableData<PayloadType>>;
