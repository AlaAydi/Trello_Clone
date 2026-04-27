import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { environment } from '../../environments/environment';

export type Severity = 'BLOCKER' | 'CRITICAL' | 'MAJOR' | 'MINOR' | 'INFO';
export type IssueType = 'BUG' | 'VULNERABILITY' | 'CODE_SMELL' | 'DUPLICATION' | 'COMPLEXITY' | 'PERFORMANCE' | 'MAINTAINABILITY';

export interface CodeSubmission {
  code: string;
  language: 'java' | 'typescript' | 'javascript' | 'python';
  filename?: string;
  ticketId?: string;
  context?: string;
}

export interface CodeIssue {
  id: string;
  type: IssueType;
  severity: Severity;
  line?: number;
  title: string;
  description: string;
  suggestion?: string;

  codeSnippet?: string;
  effort?: string;
  impact?: string;
}

export interface ScoreBreakdown {
  reliability: number;
  security: number;
  maintainability: number;
  performance: number;
  readability: number;
}

export interface CodeMetrics {
  linesOfCode: number;
  cyclomaticComplexity: number;
  cognitiveComplexity: number;
  duplicatedLines: number;
  duplicatedPercentage: number;
  testCoverage: number;
  maintainabilityIndex: number;
}

export interface RefactoredSnippet {
  title: string;
  original: string;
  improved: string;
  explanation: string;
  benefitExplanation: string;
}

export interface CodeAnalysisResponse {

  overallScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  summary: string;

  scoreBreakdown: ScoreBreakdown;

  metrics: CodeMetrics;

  issues: CodeIssue[];

  strengths: string[];

  improvements: string[];

  refactoredSnippets: RefactoredSnippet[];

  securityVulnerabilities: string[];

  performanceBottlenecks: string[];

  bestPracticesViolations: string[];
}


@Injectable({
  providedIn: 'root'
})
export class AiCodeAnalyzerService {

  private readonly API_URL = `${environment.apiUrl}/ai/analyze-code`;

  constructor() {}

  analyzeCode(submission: CodeSubmission): Observable<CodeAnalysisResponse> {
    return from(this.callAI(submission));
  }

  private async callAI(submission: CodeSubmission): Promise<CodeAnalysisResponse> {

    const prompt = this.buildAnalysisPrompt(submission);

    const body = {
      contents: [
        {
          parts: [
            {
              text: this.getAnalysisSystemPrompt() + "\n\n" + prompt
            }
          ]
        }
      ]
    };

    try {

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`AI API Error ${response.status}: ${errorBody}`);
      }

      const data = await response.json();

      const rawText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

      return this.parseAnalysisResponse(rawText);

    } catch (error) {
      console.error('AI Code Analysis Error:', error);
      throw error;
    }
  }

  private getAnalysisSystemPrompt(): string {

    return `
You are an expert code reviewer similar to SonarQube.

Return ONLY a JSON response with code analysis including:
- score
- metrics
- issues
- improvements
- strengths
`;
  }

  private buildAnalysisPrompt(submission: CodeSubmission): string {

    return `
Language: ${submission.language}

Code:
${submission.code}

Provide a detailed code quality analysis.
`;
  }

  private parseAnalysisResponse(rawText: string): CodeAnalysisResponse {

    try {

      const cleanText = rawText
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      const parsed = JSON.parse(cleanText) as CodeAnalysisResponse;

      return {
        overallScore: parsed.overallScore ?? 0,
        grade: parsed.grade ?? 'F',
        summary: parsed.summary ?? 'AI analysis unavailable',

        scoreBreakdown: parsed.scoreBreakdown ?? {
          reliability: 0,
          security: 0,
          maintainability: 0,
          performance: 0,
          readability: 0
        },

        metrics: parsed.metrics ?? {
          linesOfCode: 0,
          cyclomaticComplexity: 0,
          cognitiveComplexity: 0,
          duplicatedLines: 0,
          duplicatedPercentage: 0,
          testCoverage: 0,
          maintainabilityIndex: 0
        },

        issues: parsed.issues ?? [],
        strengths: parsed.strengths ?? [],
        improvements: parsed.improvements ?? [],
        refactoredSnippets: parsed.refactoredSnippets ?? [],
        securityVulnerabilities: parsed.securityVulnerabilities ?? [],
        performanceBottlenecks: parsed.performanceBottlenecks ?? [],
        bestPracticesViolations: parsed.bestPracticesViolations ?? []
      };

    } catch (error) {

      console.error('Error parsing AI response', error);

      return {
        overallScore: 0,
        grade: 'F',
        summary: 'Failed to parse AI response',

        scoreBreakdown: {
          reliability: 0,
          security: 0,
          maintainability: 0,
          performance: 0,
          readability: 0
        },

        metrics: {
          linesOfCode: 0,
          cyclomaticComplexity: 0,
          cognitiveComplexity: 0,
          duplicatedLines: 0,
          duplicatedPercentage: 0,
          testCoverage: 0,
          maintainabilityIndex: 0
        },

        issues: [],
        strengths: [],
        improvements: [],
        refactoredSnippets: [],
        securityVulnerabilities: [],
        performanceBottlenecks: [],
        bestPracticesViolations: []
      };
    }
  }

  getSeverityColor(severity: Severity): string {

    const colors: Record<Severity, string> = {
      BLOCKER: '#e74c3c',
      CRITICAL: '#c0392b',
      MAJOR: '#e67e22',
      MINOR: '#f39c12',
      INFO: '#3498db'
    };

    return colors[severity];
  }

  getScoreColor(score: number): string {

  if (score >= 90) return '#2ecc71'; // excellent
  if (score >= 75) return '#27ae60'; // good
  if (score >= 60) return '#f39c12'; // medium
  if (score >= 40) return '#e67e22'; // poor
  return '#e74c3c'; // critical

}
}
