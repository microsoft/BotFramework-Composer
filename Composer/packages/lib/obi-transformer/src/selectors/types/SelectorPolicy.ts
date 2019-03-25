import { StringIndexedCollection } from '../../types/StringIndexedCollection';
import { TraceableData } from '../../types/TraceableData';

type BeforeHandler<InputType> = (input: InputType) => boolean;
type AfterHandler<OutputType> = (result: StringIndexedCollection<OutputType[]>) => boolean;

type SelectorUnit<InputType, OutputType> = {
  select: (input: InputType) => OutputType[];
  validate: (x: OutputType) => boolean;
  options?: {
    required: boolean;
  };
};

type SelectorPolicy<InputType, OutputType> = {
  before: BeforeHandler<InputType>[];
  after: AfterHandler<OutputType>[];
  execution: StringIndexedCollection<SelectorUnit<InputType, OutputType>>;
};

/**
 * Traceable selector types definition.
 */
export type TraceableBeforeHandler<InputSchema> = BeforeHandler<InputSchema>;
export type TraceableAfterHandler<PayloadType> = AfterHandler<TraceableData<PayloadType>>;

export type TraceableSelectorPolicy<InputSchema, PayloadType> = SelectorPolicy<InputSchema, TraceableData<PayloadType>>;
