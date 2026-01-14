export interface Publication {
  id: string
  title: string
  abstract: string
  keywords: string
  datePublished: string
  resourceType: string
  visibility: string
  authors: string
  adviser: string
  campus: string
  college: string
  department: string
  library: string
}

export const mockPublications: Publication[] = [
  {
    id: '1',
    title: 'Machine Learning Applications in Healthcare Systems',
    abstract:
      'This research explores the integration of machine learning algorithms in modern healthcare systems, focusing on predictive analytics for patient outcomes and disease diagnosis. The study demonstrates significant improvements in early detection rates and treatment planning through the implementation of neural networks and decision tree models.',
    keywords: 'machine learning, healthcare, predictive analytics, diagnosis',
    datePublished: '2024-01-15',
    resourceType: 'thesis',
    visibility: 'public',
    authors: 'John Doe, Jane Smith',
    adviser: 'Dr. Maria Santos',
    campus: 'main',
    college: 'cics',
    department: 'cs',
    library: 'Main Library',
  },
  {
    id: '2',
    title: 'Sustainable Urban Planning: A Case Study of Metro Manila',
    abstract:
      'An in-depth analysis of sustainable urban planning practices in Metro Manila, examining the challenges and opportunities for creating environmentally responsible infrastructure. This capstone project proposes innovative solutions for traffic management, waste reduction, and green space development in densely populated areas.',
    keywords: 'urban planning, sustainability, Metro Manila, infrastructure',
    datePublished: '2023-11-20',
    resourceType: 'capstone',
    visibility: 'public',
    authors: 'Carlos Reyes, Maria Cruz',
    adviser: 'Engr. Roberto Fernandez',
    campus: 'main',
    college: 'coe',
    department: 'ce',
    library: 'Engineering Library',
  },
  {
    id: '3',
    title: 'The Impact of Social Media on Consumer Behavior',
    abstract:
      'This research investigates how social media platforms influence purchasing decisions and brand loyalty among Filipino millennials and Gen Z consumers. Through surveys and data analytics, the study reveals key patterns in online engagement and their correlation with consumer spending habits.',
    keywords: 'social media, consumer behavior, marketing, digital trends',
    datePublished: '2024-03-10',
    resourceType: 'thesis',
    visibility: 'restricted',
    authors: 'Patricia Lim, Michael Tan',
    adviser: 'Prof. Angela Rodriguez',
    campus: 'main',
    college: 'cba',
    department: 'accounting',
    library: 'Business Library',
  },
  {
    id: '4',
    title: 'Renewable Energy Solutions for Remote Island Communities',
    abstract:
      'This dissertation examines the feasibility and implementation of renewable energy systems in remote Philippine island communities. The research focuses on solar, wind, and hybrid energy solutions, providing cost-benefit analysis and sustainability assessments for off-grid power generation.',
    keywords:
      'renewable energy, solar power, sustainability, island communities',
    datePublished: '2023-08-05',
    resourceType: 'dissertation',
    visibility: 'public',
    authors: 'Rafael Santos',
    adviser: 'Dr. Emmanuel Garcia',
    campus: 'bataan',
    college: 'coe',
    department: 'ee',
    library: 'Bataan Branch Library',
  },
  {
    id: '5',
    title: 'Educational Technology Integration in Rural Schools',
    abstract:
      'An exploratory study on the challenges and benefits of integrating educational technology in rural school settings. This research presents findings from a year-long pilot program implementing tablet-based learning modules and assesses their impact on student engagement and academic performance.',
    keywords:
      'educational technology, rural education, digital learning, pedagogy',
    datePublished: '2024-02-28',
    resourceType: 'capstone',
    visibility: 'public',
    authors: 'Sophia Velasco, Mark Antonio',
    adviser: 'Dr. Teresa Aquino',
    campus: 'lopez',
    college: 'coed',
    department: 'cs',
    library: 'Lopez Branch Library',
  },
]

// Helper function to get publication by ID
export function getPublicationById(id: string): Publication | undefined {
  return mockPublications.find((pub) => pub.id === id)
}

// Helper function to get all publications
export function getAllPublications(): Publication[] {
  return mockPublications
}
