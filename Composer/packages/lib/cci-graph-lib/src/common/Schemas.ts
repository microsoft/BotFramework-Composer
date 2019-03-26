// NOTE(lin): The immutability types are adapted from a tutorial by Anders Hejlsberg, the architect of TypeScript:
// https://github.com/Microsoft/TypeScript/pull/21316

// NOTE(lin): The R<T> type is a recursively read-only version of T.
//
// Example:
// const person: R<Person> = getPerson();
// person.name = "Peter";             /* Compiler error */
// person.address.city = "Seattle";   /* Compiler error */
// person.parents[0].name = "John";   /* Compiler error */
// person.parents.push(p);            /* Compiler error */
//
// If you need to make changes to a R<T> variable, make a copy of it with mutable() or mutableArray().
export type R<T> = T extends any[] ? ImmutableArray<T[number]> : T extends object ? ImmutableObject<T> : T;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ImmutableArray<T> extends ReadonlyArray<R<T>> {}

export type ImmutableObject<T> = {
  readonly // tslint:disable-next-line: ban-types
  [P in keyof T]: T[P] extends Function ? T[P] : R<T[P]>
};
