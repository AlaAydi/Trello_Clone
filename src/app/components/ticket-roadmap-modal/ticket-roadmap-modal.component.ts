import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AiTicketRoadmapService, TicketData, RoadmapResponse } from '../../services/ai-ticket-roadmap.service';

@Component({
  selector: 'app-ticket-roadmap-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="roadmap-modal-overlay" (click)="onOverlayClick($event)">
      <div class="roadmap-modal">

        <!-- HEADER -->
        <div class="modal-header">
          <div class="header-left">
            <span class="ai-badge">🤖 AI Roadmap</span>
            <h2>{{ ticket.title }}</h2>
          </div>
          <button class="close-btn" (click)="close.emit()">✕</button>
        </div>

        <!-- LOADING STATE -->
        @if (isLoading) {
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Analyzing ticket and generating roadmap...</p>
          </div>
        }

        <!-- ERROR STATE -->
        @if (error && !isLoading) {
          <div class="error-state">
            <span class="error-icon">⚠️</span>
            <p>{{ error }}</p>
            <button (click)="loadRoadmap()">Retry</button>
          </div>
        }

        <!-- ROADMAP CONTENT -->
        @if (roadmap && !isLoading) {
          <div class="roadmap-content">

            <!-- SUMMARY CARDS -->
            <div class="summary-cards">
              <div class="card complexity" [class]="'complexity-' + roadmap.complexity.toLowerCase()">
                <label>Complexity</label>
                <span>{{ roadmap.complexity }}</span>
              </div>
              <div class="card estimation">
                <label>Estimation</label>
                <span>{{ roadmap.totalEstimation }}</span>
              </div>
              <div class="card tech-stack">
                <label>Tech Stack</label>
                <div class="tags">
                  @for (tech of roadmap.techStack; track tech) {
                    <span class="tag">{{ tech }}</span>
                  }
                </div>
              </div>
            </div>

            <!-- TICKET SUMMARY -->
            <div class="section">
              <h3>📋 Summary</h3>
              <p class="summary-text">{{ roadmap.ticketSummary }}</p>
            </div>

            <!-- ROADMAP STEPS -->
            <div class="section">
              <h3>🗺️ Implementation Roadmap</h3>
              <div class="steps-timeline">
                @for (step of roadmap.steps; track step.order) {
                  <div class="step" [class]="'phase-' + step.phase.toLowerCase()">
                    <div class="step-header">
                      <div class="step-number">{{ step.order }}</div>
                      <div class="step-meta">
                        <span class="phase-badge">{{ step.phase }}</span>
                        <span class="time-estimate">⏱ {{ step.estimatedTime }}</span>
                      </div>
                    </div>
                    <div class="step-body">
                      <h4>{{ step.title }}</h4>
                      <p>{{ step.description }}</p>

                      @if (step.technicalDetails?.length) {
                        <div class="technical-details">
                          <strong>Technical Details:</strong>
                          <ul>
                            @for (detail of step.technicalDetails; track detail) {
                              <li>{{ detail }}</li>
                            }
                          </ul>
                        </div>
                      }

                      @if (step.tips?.length) {
                        <div class="tips">
                          <strong>💡 Tips:</strong>
                          <ul>
                            @for (tip of step.tips; track tip) {
                              <li>{{ tip }}</li>
                            }
                          </ul>
                        </div>
                      }

                      @if (step.deliverable) {
                        <div class="deliverable">
                          <strong>✅ Deliverable:</strong> {{ step.deliverable }}
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- RISKS & SUGGESTIONS -->
            <div class="risks-suggestions">
              @if (roadmap.potentialRisks?.length) {
                 <div class="section half">
                  <h3>⚠️ Potential Risks</h3>
                  <ul class="risk-list">
                    @for (risk of roadmap.potentialRisks; track risk) {
                      <li>{{ risk }}</li>
                    }
                  </ul>
                </div>
              }
              @if (roadmap.suggestions?.length) {
                <div class="section half">
                  <h3>💡 Suggestions</h3>
                  <ul class="suggestion-list">
                    @for (s of roadmap.suggestions; track s) {
                      <li>{{ s }}</li>
                    }
                  </ul>
                </div>
              }
            </div>

            <!-- DEFINITION OF DONE -->
            @if (roadmap.definition_of_done?.length) {
               <div class="section">
                <h3>✅ Definition of Done</h3>
                <div class="dod-list">
                  @for (dod of roadmap.definition_of_done; track dod) {
                    <div class="dod-item">
                      <input type="checkbox"> {{ dod }}
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        }

      </div>
    </div>
  `,
  styles: [`
    .roadmap-modal-overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.6); display: flex; align-items: center;
      justify-content: center; z-index: 1000;
    }
    .roadmap-modal {
      background: #fff; border-radius: 12px; width: 90%; max-width: 900px;
      max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      color: #333;
    }
    .modal-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      padding: 24px; border-bottom: 1px solid #eee; position: sticky; top: 0;
      background: #fff; z-index: 10;
    }
    .ai-badge {
      background: #6c5ce7; color: white; padding: 4px 12px;
      border-radius: 20px; font-size: 12px; margin-bottom: 8px; display: inline-block;
    }
    .modal-header h2 { margin: 4px 0 0; font-size: 18px; }
    .close-btn { background: none; border: none; font-size: 20px; cursor: pointer; color: #666; }
    .loading-state { text-align: center; padding: 60px; }
    .spinner {
      width: 40px; height: 40px; border: 4px solid #f3f3f3;
      border-top: 4px solid #6c5ce7; border-radius: 50%;
      animation: spin 1s linear infinite; margin: 0 auto 16px;
    }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .roadmap-content { padding: 24px; }
    .summary-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
    .card { background: #f8f9fa; border-radius: 8px; padding: 16px; }
    .card label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #888; display: block; margin-bottom: 6px; }
    .card span { font-size: 16px; font-weight: 600; }
    .complexity-simple { border-left: 4px solid #2ecc71; }
    .complexity-medium { border-left: 4px solid #f39c12; }
    .complexity-complex { border-left: 4px solid #e67e22; }
    .complexity-very_complex { border-left: 4px solid #e74c3c; }
    .tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
    .tag { background: #e8f0fe; color: #3367d6; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
    .section { margin-bottom: 32px; }
    .section h3 { font-size: 15px; font-weight: 600; margin-bottom: 16px; color: #333; }
    .summary-text { color: #555; line-height: 1.6; }
    .steps-timeline { display: flex; flex-direction: column; gap: 16px; }
    .step { border: 1px solid #eee; border-radius: 10px; overflow: hidden; }
    .step-header { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: #f8f9fa; }
    .step-number {
      width: 32px; height: 32px; border-radius: 50%; background: #6c5ce7;
      color: white; display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 14px; flex-shrink: 0;
    }
    .step-meta { display: flex; align-items: center; gap: 12px; flex: 1; }
    .phase-badge {
      background: #6c5ce7; color: white; padding: 2px 10px;
      border-radius: 4px; font-size: 11px; font-weight: 600; letter-spacing: 0.5px;
    }
    .time-estimate { color: #666; font-size: 13px; }
    .step-body { padding: 16px; }
    .step-body h4 { margin: 0 0 8px; font-size: 15px; }
    .step-body p { color: #555; margin: 0 0 12px; line-height: 1.5; }
    .technical-details, .tips { margin-top: 12px; font-size: 13px; }
    .technical-details ul, .tips ul { margin: 6px 0 0; padding-left: 20px; }
    .technical-details li, .tips li { margin-bottom: 4px; color: #555; }
    .deliverable { margin-top: 12px; padding: 8px 12px; background: #f0fdf4; border-radius: 6px; font-size: 13px; color: #333; }
    .risks-suggestions { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .half { margin-bottom: 0 !important; }
    .risk-list li { color: #e74c3c; margin-bottom: 6px; font-size: 14px; }
    .suggestion-list li { color: #27ae60; margin-bottom: 6px; font-size: 14px; }
    .dod-list { display: flex; flex-direction: column; gap: 8px; }
    .dod-item { display: flex; align-items: flex-start; gap: 8px; font-size: 14px; color: #444; }
    .error-state { text-align: center; padding: 40px; color: #e74c3c; }
    .error-state button { margin-top: 12px; padding: 8px 20px; background: #6c5ce7; color: white; border: none; border-radius: 6px; cursor: pointer; }
  `]
})
export class TicketRoadmapModalComponent implements OnInit {

  @Input() ticket!: TicketData;
  @Output() close = new EventEmitter<void>();

  roadmap: RoadmapResponse | null = null;
  isLoading = true;
  error: string | null = null;

  constructor(private roadmapService: AiTicketRoadmapService) {}

  ngOnInit(): void {
    this.loadRoadmap();
  }

  loadRoadmap(): void {
    this.isLoading = true;
    this.error = null;

    this.roadmapService.generateRoadmap(this.ticket).subscribe({
      next: (roadmap) => {
        this.roadmap = roadmap;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = `Failed to generate roadmap: ${err.message}`;
        this.isLoading = false;
      }
    });
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('roadmap-modal-overlay')) {
      this.close.emit();
    }
  }
}
