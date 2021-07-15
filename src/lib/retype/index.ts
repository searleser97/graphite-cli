/**
 * This library reifies typescript types so that we can validate them at runtime.
 *
 * The idea was heavily inspired by https://gcanti.github.io/io-ts/
 */

export abstract class Schema<TInner> {
  readonly _TInner!: TInner;

  abstract is(value: unknown): value is TInner;

  public validate(value: unknown): TInner | undefined {
    if (this.is(value)) {
      return value;
    }

    return undefined;
  }
}

export type TypeOf<A extends Schema<unknown>> = A["_TInner"];

export type UnwrapSchemaMap<TSchemaMap> = keyof TSchemaMap extends never
  ? {
      [K in any]: undefined;
    }
  : {
      [SchemaMapIndex in keyof TSchemaMap]: TSchemaMap[SchemaMapIndex] extends Schema<unknown>
        ? TypeOf<TSchemaMap[SchemaMapIndex]>
        : never;
    };

export class UndefinedType extends Schema<undefined> {
  public is(value: unknown): value is undefined {
    return typeof value === "undefined";
  }
}

export const undefinedtype = new UndefinedType();

// Have to cloth the type so that boolean isn't distrubuted
// I.e. type Extends<A, B> = A extends B ? true : false;
// results in:
// Extends<boolean, true> = Extends<true, true> | Extends<false, true> = true | false
type Extends<A, B> = [A] extends [B] ? true : false;
type NonGenericExceptBooleans<A> = true extends
  | Extends<string, A>
  | Extends<number, A>
  ? never
  : A;
type NonGeneric<A> = true extends Extends<boolean, A>
  ? never
  : NonGenericExceptBooleans<A>;

export class LiteralType<TInner> extends Schema<TInner> {
  _inner: TInner;

  constructor(inner: TInner) {
    super();
    this._inner = inner;
  }

  is(value: unknown): value is TInner {
    // Not entirely correct, b/c you could have a literal dict, but should work for strings, numbers (might be weird around floats), and booleans
    return JSON.stringify(this._inner) === JSON.stringify(value);
  }
}

export function literal<TInner>(inner: NonGeneric<TInner>) {
  return new LiteralType(inner);
}

// JSON Types

export class NumberType extends Schema<number> {
  public is(value: unknown): value is number {
    return typeof value === "number";
  }
}

export const number = new NumberType();

export class StringType extends Schema<string> {
  public is(value: unknown): value is string {
    return typeof value === "string";
  }
}

export const string = new StringType();

export class BooleanType extends Schema<boolean> {
  public is(value: unknown): value is boolean {
    return typeof value === "boolean";
  }
}

export const boolean = new BooleanType();

export class NullType extends Schema<null> {
  public is(value: unknown): value is null {
    return value === null;
  }
}

export const nulltype = new NullType();

/**
 * Note: I'm explicitly excluding dictionaries from this library.
 * I have seen very few legitimate uses of dictionaries in API design
 * and more common than not, the use case is better served by a shape
 * or an array.
 */

export class ShapeType<
  TDefnSchema extends {
    [key: string]: Schema<unknown>;
  },
  TDefn extends {
    [DefnIndex in keyof TDefnSchema]: TypeOf<TDefnSchema[DefnIndex]>;
  }
> extends Schema<TDefn> {
  _schema: TDefnSchema;

  constructor(schema: TDefnSchema) {
    super();
    this._schema = schema;
  }

  is(value: unknown): value is TDefn {
    // This explicitly allows additional keys so that the validated object
    // can be intersected with other shape types (i.e. value is a superset of schema)

    return (
      typeof value === "object" &&
      value !== null && // one of my fave JS-isms: typeof null === "object"
      Object.keys(this._schema).every((key: string) => {
        return (
          (this._schema as any)[key] &&
          (this._schema as any)[key].is((value as any)[key])
        );
      })
    );
  }
}

export function shape<TInner extends { [key: string]: Schema<unknown> }>(
  inner: TInner
) {
  return new ShapeType(inner);
}

export class ArrayType<TMember> extends Schema<TMember[]> {
  _member: Schema<TMember>;

  constructor(member: Schema<TMember>) {
    super();
    this._member = member;
  }

  is(value: unknown): value is TMember[] {
    return (
      Array.isArray(value) &&
      value.every((v) => {
        return this._member.is(v);
      })
    );
  }
}

export function array<TInner>(inner: Schema<TInner>) {
  return new ArrayType(inner);
}

// Not technically called out in JSON, but we can use JSON for this
export class TupleType<
  TDefnSchema extends readonly Schema<unknown>[],
  // Mapped tuple logic derived from https://stackoverflow.com/a/51679156/781199
  TDefn extends {
    [DefnIndex in keyof TDefnSchema]: TDefnSchema[DefnIndex] extends Schema<unknown>
      ? TypeOf<TDefnSchema[DefnIndex]>
      : never;
  } & { length: TDefnSchema["length"] }
> extends Schema<TDefn> {
  _schema: TDefnSchema;

  constructor(schema: TDefnSchema) {
    super();
    this._schema = schema;
  }

  is(value: unknown): value is TDefn {
    return (
      Array.isArray(value) &&
      value.length === this._schema.length &&
      value.every((v, idx) => {
        return (this._schema as any)[idx].is(v);
      })
    );
  }
}

export function tuple<TInner extends readonly Schema<unknown>[]>(
  inner: TInner
) {
  return new TupleType(inner);
}

// Typescript Nonsense

export class UnionType<TLeft, TRight> extends Schema<TLeft | TRight> {
  _left: Schema<TLeft>;
  _right: Schema<TRight>;

  constructor(left: Schema<TLeft>, right: Schema<TRight>) {
    super();
    this._left = left;
    this._right = right;
  }

  is(value: unknown): value is TLeft | TRight {
    return this._left.is(value) || this._right.is(value);
  }
}

export function union<TLeft, TRight>(
  left: Schema<TLeft>,
  right: Schema<TRight>
) {
  return new UnionType(left, right);
}

export class IntersectionType<TLeft, TRight> extends Schema<TLeft & TRight> {
  _left: Schema<TLeft>;
  _right: Schema<TRight>;

  constructor(left: Schema<TLeft>, right: Schema<TRight>) {
    super();
    this._left = left;
    this._right = right;
  }

  is(value: unknown): value is TLeft & TRight {
    return this._left.is(value) && this._right.is(value);
  }
}

export function intersection<TLeft, TRight>(
  left: Schema<TLeft>,
  right: Schema<TRight>
) {
  return new IntersectionType(left, right);
}

export class PluralUnionType<
  TSchema extends Schema<unknown>,
  TInnerSchemaType extends TypeOf<TSchema>
> extends Schema<TInnerSchemaType> {
  _inner: TSchema[];

  constructor(inner: TSchema[]) {
    super();
    this._inner = inner;
  }

  is(value: unknown): value is TInnerSchemaType {
    return this._inner.some((schema) => {
      return schema.is(value);
    });
  }
}

export function unionMany<TSchema extends Schema<unknown>>(inner: TSchema[]) {
  return new PluralUnionType(inner);
}

// Check out https://stackoverflow.com/a/50375286/781199 for how we're
// leveraging distributive conditionals and inference from conditionals
type TPluralIntersectionType<T> = (
  T extends Schema<infer U> ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

export class PluralIntersectionType<
  TSchema extends Schema<unknown>,
  TInnerSchemaType extends TPluralIntersectionType<TSchema>
> extends Schema<TInnerSchemaType> {
  _inner: TSchema[];

  constructor(inner: TSchema[]) {
    super();
    this._inner = inner;
  }

  is(value: unknown): value is TInnerSchemaType {
    return this._inner.every((schema) => {
      return schema.is(value);
    });
  }
}

export function intersectMany<TSchema extends Schema<unknown>>(
  inner: TSchema[]
) {
  return new PluralIntersectionType(inner);
}

// Helpers

export function literals<TLiterals>(
  // See below for why we exclude booleans here
  inners: readonly NonGenericExceptBooleans<TLiterals>[]
) {
  return unionMany(
    inners.map((value) => {
      // Note: we intentionally don't use literal(). The reason is that would
      // break literals([true, false] as const)
      //
      // This is because when we call literal() we need to know what type it's being
      // called with (b/c there is only one lambda in the map), and so logically that
      // type is inferred as the union of all members of the array. When we pass this function
      // an array that contains both true and false, the type of literal is infered as
      // literal<true|false>(value: NonGeneric<true|false>), our mistake catching code in
      // NonGeneric detects that boolean extends true|false and flags it (assuming you simply
      // called literal() without as const, e.g. literal(false) errors b/c it gets infered to
      // literal<boolean>(false))
      return new LiteralType(value);
    })
  );
}

export function optional<TInner>(inner: Schema<TInner>) {
  return union(inner, undefinedtype);
}

export function nullable<TInner>(inner: Schema<TInner>) {
  return union(inner, nulltype);
}
