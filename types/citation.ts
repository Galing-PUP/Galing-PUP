/**
 * Citation type definitions for academic citation generation
 */

/**
 * Supported citation formats
 */
export type CitationFormat = 'apa' | 'mla' | 'ieee' | 'acm' | 'chicago' | 'bibtex';

/**
 * Response object containing all citation formats
 */
export interface CitationFormats {
  apa: string;
  mla: string;
  ieee: string;
  acm: string;
  chicago: string;
  bibtex: string;
}

/**
 * CSL-JSON Person object for authors
 */
export interface CSLPerson {
  family: string;
  given: string;
}

/**
 * CSL-JSON Date object
 */
export interface CSLDate {
  'date-parts': [[number]];
}

/**
 * CSL-JSON data structure for citation-js
 * Based on Citation Style Language specification
 */
export interface CSLData {
  id: string;
  type: 'thesis' | 'article' | 'paper-conference' | 'report';
  title: string;
  author: CSLPerson[];
  issued: CSLDate;
  publisher?: string;
  'container-title'?: string;
  genre?: string;
  abstract?: string;
  URL?: string;
}

/**
 * Service response type for citation generation
 */
export interface CitationServiceResponse {
  success: boolean;
  data?: CitationFormats;
  citationCount?: number;
  error?: string;
}

