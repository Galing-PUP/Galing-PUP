/**
 * Citation Service - Hybrid Approach with Rate Limiting
 * 
 * Uses manual string formatting for human-readable citations (APA, MLA, IEEE, ACM, Chicago)
 * Uses citation-js only for BibTeX generation
 * Includes rate limiting based on subscription tier
 */

import { Cite } from '@citation-js/core';
import '@citation-js/plugin-csl';
import '@citation-js/plugin-bibtex';
import { prisma } from '@/lib/db';
import { ResourceTypes } from '@/lib/generated/prisma/enums';
import type { CSLData, CSLPerson, CitationFormats } from '@/types/citation';

/**
 * Author information for citation formatting
 */
interface AuthorInfo {
  firstName: string;
  middleName?: string | null;
  lastName: string;
}

/**
 * Citation data extracted from document
 */
interface CitationData {
  authors: AuthorInfo[];
  year: number;
  title: string;
  genre: string;
  containerTitle: string;
  publisher: string;
}

/**
 * Formats authors for APA style
 * Format: "Last, F., Last, F., & Last, F."
 */
function formatAuthorsAPA(authors: AuthorInfo[]): string {
  if (authors.length === 0) return 'Unknown Author';
  
  const formatted = authors.map((author) => {
    const firstInitial = author.firstName.charAt(0);
    const middleInitial = author.middleName ? ` ${author.middleName.charAt(0)}.` : '';
    return `${author.lastName}, ${firstInitial}.${middleInitial}`;
  });
  
  if (formatted.length === 1) return formatted[0];
  if (formatted.length === 2) return `${formatted[0]}, & ${formatted[1]}`;
  
  const lastAuthor = formatted[formatted.length - 1];
  const otherAuthors = formatted.slice(0, -1).join(', ');
  return `${otherAuthors}, & ${lastAuthor}`;
}

/**
 * Formats authors for MLA style
 * Format: "Last, First, and First Last"
 */
function formatAuthorsMLA(authors: AuthorInfo[]): string {
  if (authors.length === 0) return 'Unknown Author';
  
  const formatted = authors.map((author, index) => {
    const middleName = author.middleName ? ` ${author.middleName}` : '';
    if (index === 0) {
      // First author: Last, First Middle
      return `${author.lastName}, ${author.firstName}${middleName}`;
    } else {
      // Other authors: First Middle Last
      return `${author.firstName}${middleName} ${author.lastName}`;
    }
  });
  
  if (formatted.length === 1) return formatted[0];
  if (formatted.length === 2) return `${formatted[0]}, and ${formatted[1]}`;
  
  const lastAuthor = formatted[formatted.length - 1];
  const otherAuthors = formatted.slice(0, -1).join(', ');
  return `${otherAuthors}, and ${lastAuthor}`;
}

/**
 * Formats authors for IEEE style
 * Format: "F. Last, F. Last, and F. Last"
 */
function formatAuthorsIEEE(authors: AuthorInfo[]): string {
  if (authors.length === 0) return 'Unknown Author';
  
  const formatted = authors.map((author) => {
    const firstInitial = author.firstName.charAt(0);
    const middleInitial = author.middleName ? ` ${author.middleName.charAt(0)}.` : '';
    return `${firstInitial}.${middleInitial} ${author.lastName}`;
  });
  
  if (formatted.length === 1) return formatted[0];
  if (formatted.length === 2) return `${formatted[0]} and ${formatted[1]}`;
  
  const lastAuthor = formatted[formatted.length - 1];
  const otherAuthors = formatted.slice(0, -1).join(', ');
  return `${otherAuthors}, and ${lastAuthor}`;
}

/**
 * Formats authors for ACM style
 * Format: "First Last, First Last, and First Last"
 */
function formatAuthorsACM(authors: AuthorInfo[]): string {
  if (authors.length === 0) return 'Unknown Author';
  
  const formatted = authors.map((author) => {
    const middleName = author.middleName ? ` ${author.middleName}` : '';
    return `${author.firstName}${middleName} ${author.lastName}`;
  });
  
  if (formatted.length === 1) return formatted[0];
  if (formatted.length === 2) return `${formatted[0]} and ${formatted[1]}`;
  
  const lastAuthor = formatted[formatted.length - 1];
  const otherAuthors = formatted.slice(0, -1).join(', ');
  return `${otherAuthors}, and ${lastAuthor}`;
}

/**
 * Formats authors for Chicago style
 * Format: "Last, First, and First Last"
 */
function formatAuthorsChicago(authors: AuthorInfo[]): string {
  // Chicago author-date style is similar to MLA
  return formatAuthorsMLA(authors);
}

/**
 * Generates APA citation
 */
function generateAPACitation(data: CitationData): string {
  const authors = formatAuthorsAPA(data.authors);
  return `${authors} (${data.year}). ${data.title} [${data.genre}]. ${data.publisher}.`;
}

/**
 * Generates MLA citation
 */
function generateMLACitation(data: CitationData): string {
  const authors = formatAuthorsMLA(data.authors);
  return `${authors}. "${data.title}." ${data.year}. ${data.genre}. ${data.publisher}.`;
}

/**
 * Generates IEEE citation
 */
function generateIEEECitation(data: CitationData): string {
  const authors = formatAuthorsIEEE(data.authors);
  return `${authors}, "${data.title}," ${data.genre}, ${data.publisher}, ${data.year}.`;
}

/**
 * Generates ACM citation
 */
function generateACMCitation(data: CitationData): string {
  const authors = formatAuthorsACM(data.authors);
  return `${authors}. ${data.year}. ${data.title}. ${data.genre}. ${data.publisher}.`;
}

/**
 * Generates Chicago citation (author-date style)
 */
function generateChicagoCitation(data: CitationData): string {
  const authors = formatAuthorsChicago(data.authors);
  return `${authors}. ${data.year}. "${data.title}." ${data.genre}. ${data.publisher}.`;
}

/**
 * Maps Prisma ResourceTypes enum to human-readable genre strings
 */
function mapResourceTypeToGenre(resourceType: ResourceTypes): string {
  const genreMap: Record<ResourceTypes, string> = {
    THESIS: 'Thesis',
    DISSERTATION: 'Dissertation',
    CAPSTONE: 'Capstone project',
    ARTICLE: 'Journal article',
    RESEARCH_PAPER: 'Research paper',
  };
  return genreMap[resourceType] || 'Research paper';
}

/**
 * Maps Prisma ResourceTypes enum to CSL type for BibTeX
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
 * Checks if user has reached their daily citation limit
 * Only counts unique documents - re-citing the same document doesn't count against quota
 * @param userId - The user's ID
 * @param documentId - The document ID being cited (to check if it's a re-citation)
 * @returns Object with limit check result and usage stats
 * @throws Error if user not found or limit reached
 */
export async function checkCitationLimit(
  userId: number,
  documentId: number
): Promise<{
  allowed: boolean;
  limit: number;
  used: number;
  isRecitation: boolean;
}> {
  // Fetch user with subscription tier
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscriptionTier: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Get start of today (UTC)
  const startOfToday = new Date();
  startOfToday.setUTCHours(0, 0, 0, 0);

  // Get all unique document IDs cited by this user today
  const citedDocuments = await prisma.activityLog.findMany({
    where: {
      userId: userId,
      activityType: 'CITATION_GENERATED',
      createdAt: {
        gte: startOfToday,
      },
    },
    select: {
      documentId: true,
    },
    distinct: ['documentId'],
  });

  // Extract unique document IDs (filter out nulls)
  const uniqueDocumentIds = citedDocuments
    .map((log) => log.documentId)
    .filter((id): id is number => id !== null);

  const uniqueCount = uniqueDocumentIds.length;
  const limit = user.subscriptionTier.dailyCitationLimit;

  // Check if current document was already cited today (re-citation)
  const isRecitation = uniqueDocumentIds.includes(documentId);

  // If it's a re-citation, always allow
  if (isRecitation) {
    return {
      allowed: true,
      limit,
      used: uniqueCount,
      isRecitation: true,
    };
  }

  // If it's a new document, check if limit reached
  const allowed = uniqueCount < limit;

  if (!allowed) {
    throw new Error(
      `Daily citation limit reached. You can generate ${limit} unique citations per day with your current tier.`
    );
  }

  return {
    allowed,
    limit,
    used: uniqueCount,
    isRecitation: false,
  };
}

/**
 * Logs citation generation activity
 * @param userId - The user's ID
 * @param documentId - The document ID
 */
export async function logCitationActivity(
  userId: number,
  documentId: number
): Promise<void> {
  await prisma.activityLog.create({
    data: {
      userId,
      documentId,
      activityType: 'CITATION_GENERATED',
    },
  });
}

/**
 * Generates citations for a document in multiple academic formats
 * Also increments the citation counter for the document
 * @param documentId - The ID of the document to generate citations for
 * @param userId - The user's ID (for usage stats)
 * @returns Object containing citations, updated citation count, and usage stats
 * @throws Error if document is not found
 */
export async function generateCitations(
  documentId: number,
  userId: number
): Promise<{
  citations: CitationFormats;
  citationCount: number;
  usage: {
    used: number;
    limit: number;
    reset: string;
  };
}> {
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

  // Extract publication year
  const publicationDate = document.datePublished || document.submissionDate;
  const publicationYear = publicationDate ? publicationDate.getFullYear() : new Date().getFullYear();

  // Extract author information
  const authors: AuthorInfo[] = document.authors.map((docAuthor) => ({
    firstName: docAuthor.author.firstName,
    middleName: docAuthor.author.middleName,
    lastName: docAuthor.author.lastName,
  }));

  // Prepare citation data
  const citationData: CitationData = {
    authors,
    year: publicationYear,
    title: document.title,
    genre: mapResourceTypeToGenre(document.resourceType),
    containerTitle: document.course.courseName,
    publisher: document.course.college?.collegeName || 'Polytechnic University of the Philippines',
  };

  // Generate human-readable citations manually
  const apa = generateAPACitation(citationData);
  const mla = generateMLACitation(citationData);
  const ieee = generateIEEECitation(citationData);
  const acm = generateACMCitation(citationData);
  const chicago = generateChicagoCitation(citationData);

  // Generate BibTeX using citation-js
  const cslAuthors: CSLPerson[] = authors.map((author) => ({
    family: author.lastName,
    given: author.middleName
      ? `${author.firstName} ${author.middleName}`
      : author.firstName,
  }));

  const cslData: CSLData = {
    id: `document-${documentId}`,
    type: mapResourceTypeToCSLType(document.resourceType),
    title: document.title,
    author: cslAuthors,
    issued: {
      'date-parts': [[publicationYear]],
    },
    publisher: citationData.publisher,
    'container-title': citationData.containerTitle,
    genre: citationData.genre,
    abstract: document.abstract,
  };

  const cite = new Cite(cslData);
  const bibtex = cite.format('bibtex');

  // Check if this user has EVER cited this document before (all-time)
  const existingCitation = await prisma.activityLog.findFirst({
    where: {
      userId: userId,
      documentId: documentId,
      activityType: 'CITATION_GENERATED',
    },
  });

  // Only increment citation count if this is the user's first time citing this document
  let updatedDocument;
  if (!existingCitation) {
    // First-time citation: increment the counter
    updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: {
        citationCount: {
          increment: 1,
        },
      },
      select: {
        citationCount: true,
      },
    });
  } else {
    // Re-citation: just fetch the current count without incrementing
    updatedDocument = await prisma.document.findUnique({
      where: { id: documentId },
      select: {
        citationCount: true,
      },
    });
  }

  if (!updatedDocument) {
    throw new Error('Failed to fetch document citation count');
  }


  // Get usage stats for this user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscriptionTier: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Get start of today (UTC)
  const startOfToday = new Date();
  startOfToday.setUTCHours(0, 0, 0, 0);

  // Get unique documents cited today
  const citedDocuments = await prisma.activityLog.findMany({
    where: {
      userId: userId,
      activityType: 'CITATION_GENERATED',
      createdAt: {
        gte: startOfToday,
      },
    },
    select: {
      documentId: true,
    },
    distinct: ['documentId'],
  });

  const uniqueDocumentIds = citedDocuments
    .map((log) => log.documentId)
    .filter((id): id is number => id !== null);

  // Check if current document is already in the list (before logging)
  const wasAlreadyCited = uniqueDocumentIds.includes(documentId);
  const uniqueCount = wasAlreadyCited ? uniqueDocumentIds.length : uniqueDocumentIds.length + 1;

  // Calculate next midnight (reset time)
  const nextMidnight = new Date();
  nextMidnight.setUTCHours(24, 0, 0, 0);

  // Return citations, count, and usage stats
  return {
    citations: {
      apa,
      mla,
      ieee,
      acm,
      chicago,
      bibtex,
    },
    citationCount: updatedDocument.citationCount,
    usage: {
      used: uniqueCount,
      limit: user.subscriptionTier.dailyCitationLimit,
      reset: nextMidnight.toISOString(),
    },
  };
}


