/**
 * Type declarations for citation-js packages
 * These packages don't have official TypeScript definitions
 */

declare module '@citation-js/core' {
  export class Cite {
    constructor(data: any);
    format(format: string, options?: any): string;
  }
}

declare module '@citation-js/plugin-csl' {}
declare module '@citation-js/plugin-bibtex' {}
