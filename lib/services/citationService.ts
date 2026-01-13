/**
 * Citation Service
 * Generates academic citations in multiple formats using citation-js
 */

import { Cite } from '@citation-js/core';
import '@citation-js/plugin-csl';
import '@citation-js/plugin-bibtex';
import { prisma } from '@/lib/db';
import { ResourceTypes } from '@/lib/generated/prisma/enums';
import type { CSLData, CSLPerson, CitationFormats } from '@/types/citation';

/**
 * Maps Prisma ResourceTypes enum to CSL genre strings
 * @param resourceType - The resource type from Prisma enum
 * @returns CSL-compatible genre string
 */
function mapResourceTypeToCSLGenre(resourceType: ResourceTypes): string {
  const genreMap: Record<ResourceTypes, string> = {
    THESIS: "Master's thesis",
    DISSERTATION: 'PhD dissertation',
    CAPSTONE: 'Capstone project',
    ARTICLE: 'Journal article',
    RESEARCH_PAPER: 'Research paper',
  };

  return genreMap[resourceType] || 'Research paper';
}

/**
 * Maps Prisma ResourceTypes enum to CSL type
 * @param resourceType - The resource type from Prisma enum
 * @returns CSL-compatible type string
 */
function mapResourceTypeToCSLType(
  resourceType: ResourceTypes
): 'thesis' | 'article' | 'paper-conference' | 'report' {
  const typeMap: Record<ResourceTypes, 'thesis' | 'article' | 'paper-conference' | 'report'> = {
    THESIS: 'thesis',
    DISSERTATION: 'thesis',
    CAPSTONE: 'report',
    ARTICLE: 'article',
    RESEARCH_PAPER: 'paper-conference',
  };

  return typeMap[resourceType] || 'report';
}

/**
 * Generates citations for a document in multiple academic formats
 * @param documentId - The ID of the document to generate citations for
 * @returns Object containing citations in all supported formats
 * @throws Error if document is not found or citation generation fails
 */
export async function generateCitations(documentId: number): Promise<CitationFormats> {
  // Fetch document with all necessary relations
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      authors: {
        include: {
          author: true,
        },
        orderBy: {
          authorOrder: 'asc',
        },
      },
      course: {
        include: {
          college: true,
        },
      },
    },
  });

  if (!document) {
    throw new Error(`Document with ID ${documentId} not found`);
  }

  // Extract publication year (fallback to submission date if published date is null)
  const publicationDate = document.datePublished || document.submissionDate;
  const publicationYear = publicationDate ? publicationDate.getFullYear() : new Date().getFullYear();

  // Map authors to CSL format
  const authors: CSLPerson[] = document.authors.map((docAuthor) => {
    const author = docAuthor.author;
    return {
      family: author.lastName,
      given: author.middleName
        ? `${author.firstName} ${author.middleName}`
        : author.firstName,
    };
  });

  // Build CSL-JSON data object
  const cslData: CSLData = {
    id: `document-${documentId}`,
    type: mapResourceTypeToCSLType(document.resourceType),
    title: document.title,
    author: authors,
    issued: {
      'date-parts': [[publicationYear]],
    },
    publisher: document.course.college?.collegeName || 'Polytechnic University of the Philippines',
    'container-title': document.course.courseName,
    genre: mapResourceTypeToCSLGenre(document.resourceType),
    abstract: document.abstract,
  };

  // Initialize citation-js with the CSL data
  const cite = new Cite(cslData);

  // Generate citations in all supported formats
  const citations: CitationFormats = {
    apa: cite.format('bibliography', {
      format: 'text',
      template: 'apa',
      lang: 'en-US',
    }),
    mla: cite.format('bibliography', {
      format: 'text',
      template: 'modern-language-association',
      lang: 'en-US',
    }),
    ieee: cite.format('bibliography', {
      format: 'text',
      template: 'ieee',
      lang: 'en-US',
    }),
    acm: cite.format('bibliography', {
      format: 'text',
      template: 'acm-siggraph',
      lang: 'en-US',
    }),
    chicago: cite.format('bibliography', {
      format: 'text',
      template: 'chicago-author-date',
      lang: 'en-US',
    }),
    bibtex: cite.format('bibtex'),
  };

  return citations;
}
