export  type Constructor<T> = new (...args: any[]) => T

export  type DefineReturn<T> = ConstructorParameters<Constructor<T>> extends [any, ...any[]]
    ? (...args: ConstructorParameters<Constructor<T>>) => T
    : [] extends ConstructorParameters<Constructor<T>>
    ? () => T
    : never
