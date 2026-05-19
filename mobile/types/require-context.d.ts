interface RequireContext {
  keys(): string[];
  <T = unknown>(id: string): T;
}

declare namespace NodeJS {
  interface Require {
    context(
      path: string,
      deep?: boolean,
      filter?: RegExp,
      mode?: 'sync' | 'eager' | 'weak' | 'lazy' | 'lazy-once',
    ): RequireContext;
  }
}
