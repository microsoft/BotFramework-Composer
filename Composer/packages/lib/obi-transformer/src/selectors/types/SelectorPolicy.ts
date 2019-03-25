import { StringIndexedCollection } from '../../types/StringIndexedCollection';
import { TraceableData } from '../../types/TraceableData';

type BeforeHandler<InputType> = (input: InputType) => boolean;
type AfterHandler<OutputType> = (result: StringIndexedCollection<OutputType[]>) => boolean;
type SelectionHandler<InputType, OutputType> = (input: InputType) => OutputType[];
type ValidationHandler<OutputType> = (output: OutputType) => boolean;

type SelectorUnit<InputType, OutputType> = {
  select: SelectionHandler<InputType, OutputType>;
  validate: ValidationHandler<OutputType>;
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
export type TraceableSelectionHandler<InputSchema, PayloadType> = SelectionHandler<
  InputSchema,
  TraceableData<PayloadType>
>;
export type TraceableValidationHandler<PayloadType> = ValidationHandler<TraceableData<PayloadType>>;

export type TraceableSelectorPolicy<InputSchema, PayloadType> = SelectorPolicy<InputSchema, TraceableData<PayloadType>>;
