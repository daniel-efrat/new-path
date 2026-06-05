export type RiasecCode = "R" | "I" | "A" | "S" | "E" | "C";

export interface GuidanceInterestArea {
  code: RiasecCode;
  name: string;
  score: number;
  summary: string;
}

export interface GuidanceCareerPriority {
  title: string;
  evidence: string;
}

export interface GuidanceDesignationDomain {
  rank: number;
  title: string;
  selectedStatements: string[];
  summary: string;
}

export interface GuidanceInitialDirection {
  title: string;
  whyItMayFit: string;
  whatToCheckNext: string;
  possibleTension: string;
}

export interface GuidanceReport {
  title: string;
  generatedAt: string;
  disclaimer: string;
  coreSummary: string;
  interestAreas: GuidanceInterestArea[];
  careerPriorities: GuidanceCareerPriority[];
  designationDomains: GuidanceDesignationDomain[];
  initialDirections: GuidanceInitialDirection[];
  nextStep: string;
}

export interface GuidanceApiResponse {
  report: GuidanceReport;
  reportId: string;
  inputHash: string;
  provider: "gemini" | "openrouter";
  model: string;
  cached: boolean;
  staffSubject?: {
    id: string;
    displayName: string;
  };
}

export interface GuidanceApiError {
  error: string;
}
