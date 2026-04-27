import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TicketData {
  title: string;
  description: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  labels?: string[];
  assignee?: string;
  estimatedHours?: number;
}

export interface RoadmapStep {
  order: number;
  phase: string;
  title: string;
  description: string;
  estimatedTime: string;
  technicalDetails: string[];
  dependencies: string[];
  tips: string[];
  deliverable: string;
}

export interface RoadmapResponse {
  ticketSummary: string;
  complexity: 'SIMPLE' | 'MEDIUM' | 'COMPLEX' | 'VERY_COMPLEX';
  totalEstimation: string;
  techStack: string[];
  steps: RoadmapStep[];
  potentialRisks: string[];
  suggestions: string[];
  definition_of_done: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AiTicketRoadmapService {

  private readonly API_URL = `${environment.apiUrl}/ai/roadmap`;

  constructor() {}

  generateRoadmap(ticket: TicketData): Observable<RoadmapResponse> {
    return from(this.callAI(ticket));
  }

  private async callAI(ticket: TicketData): Promise<RoadmapResponse> {

    const prompt = this.buildRoadmapPrompt(ticket);

    const body = {
      contents: [
        {
          parts: [
            {
              text: this.getSystemPrompt() + "\n\n" + prompt
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
        const errorText = await response.text();
        throw new Error(`AI API Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      const rawText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

      return this.parseRoadmapResponse(rawText);

    } catch (error) {
      console.error('AI Roadmap Error:', error);
      throw error;
    }
  }

  private getSystemPrompt(): string {
    return `You are an expert software architect specialized in Angular and Spring Boot.
Always return ONLY a valid JSON object describing the roadmap.`;
  }

  private buildRoadmapPrompt(ticket: TicketData): string {
    return `
Ticket title: ${ticket.title}

Description:
${ticket.description}

Priority: ${ticket.priority}

Generate a detailed development roadmap.
`;
  }

  private parseRoadmapResponse(rawText: string): RoadmapResponse {

    try {

      const clean = rawText
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      return JSON.parse(clean);

    } catch (e) {

      console.error("Roadmap parse error", e);

      return {
        ticketSummary: 'Parsing error',
        complexity: 'MEDIUM',
        totalEstimation: '',
        techStack: [],
        steps: [],
        potentialRisks: [],
        suggestions: [],
        definition_of_done: []
      };
    }
  }
}
