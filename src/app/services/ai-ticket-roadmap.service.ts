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
  title: string;
  description: string;
  duration: string;
}

export interface RoadmapPhase {
  name: string;
  steps: RoadmapStep[];
}

export interface RoadmapRisk {
  risk: string;
  mitigation: string;
}

export interface RoadmapResponse {
  taskTitle: string;
  summary: string;
  complexity: string;
  estimatedTime: string;
  architecture: {
    frontend: string;
    backend: string;
  };
  phases: RoadmapPhase[];
  securityChecklist: string[];
  testingStrategy: string;
  risks: RoadmapRisk[];
  successCriteria: string[];
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
    // We send a simple TaskRequest to the backend
    const taskDescription = `Title: ${ticket.title}\nDescription: ${ticket.description}\nPriority: ${ticket.priority}`;
    
    const body = {
      task: taskDescription
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


      const rawJson = await response.text();
      
      return this.parseRoadmapResponse(rawJson);

    } catch (error) {
      console.error('AI Roadmap Error:', error);
      throw error;
    }
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
      throw new Error("Impossible de parser la réponse de l'IA. Veuillez réessayer.");
    }
  }
}
