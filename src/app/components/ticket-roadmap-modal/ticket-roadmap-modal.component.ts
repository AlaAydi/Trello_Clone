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

        <div class="modal-header">
          <div class="header-left">
            <span class="ai-badge-premium">MODERN ARCHITECT ROADMAP</span>
            <h2>{{ ticket.title }}</h2>
          </div>
          <button class="close-btn" (click)="close.emit()">✕</button>
        </div>

        @if (isLoading) {
          <div class="loading-state-premium">
            <div class="spinner"></div>
            <p>Antigravity AI is architecting your solution...</p>
          </div>
        }

        @if (error && !isLoading) {
          <div class="error-state">
            <span class="error-icon">⚠️</span>
            <p>{{ error }}</p>
            <button (click)="loadRoadmap()">Retry</button>
          </div>
        }

        @if (roadmap && !isLoading) {
          <div class="roadmap-content-modern">

            <div class="overview-grid">
              <div class="overview-card">
                <label>Complexity</label>
                <span class="value">{{ roadmap.complexity }}</span>
              </div>
              <div class="overview-card">
                <label>Estimated Time</label>
                <span class="value">{{ roadmap.estimatedTime }}</span>
              </div>
              <div class="overview-card">
                <label>Technical Summary</label>
                <p>{{ roadmap.summary }}</p>
              </div>
            </div>

            <div class="section-glass">
              <h3>Technical Strategy</h3>
              <div class="strategy-grid">
                <div class="strategy-item">
                  <label>Frontend Strategy</label>
                  <p>{{ roadmap.architecture.frontend }}</p>
                </div>
                <div class="strategy-item">
                  <label>Backend Strategy</label>
                  <p>{{ roadmap.architecture.backend }}</p>
                </div>
              </div>
            </div>

            <div class="section">
              <h3>Implementation Phases</h3>
              <div class="phases-container">
                @for (phase of roadmap.phases; track phase.name; let pi = $index) {
                  <div class="phase-card">
                    <div class="phase-header">
                      <span class="phase-number">Phase {{ pi + 1 }}</span>
                      <h4>{{ phase.name }}</h4>
                    </div>
                    <div class="steps-list">
                      @for (step of phase.steps; track step.title) {
                        <div class="step-item">
                          <div class="step-content">
                            <div class="step-title-row">
                              <h5>{{ step.title }}</h5>
                              <span class="step-duration">{{ step.duration }}</span>
                            </div>
                            <p>{{ step.description }}</p>
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>

            <div class="grid-2-col">
              <div class="section-glass">
                <h3>🛡️ Security Checklist</h3>
                <ul class="check-list">
                  @for (item of roadmap.securityChecklist; track item) {
                    <li>{{ item }}</li>
                  }
                </ul>
              </div>
              <div class="section-glass">
                <h3>🧪 Testing Strategy</h3>
                <p>{{ roadmap.testingStrategy }}</p>
              </div>
            </div>

            <div class="section">
              <h3>⚠️ Risks & Mitigations</h3>
              <div class="risks-grid">
                @for (r of roadmap.risks; track r.risk) {
                  <div class="risk-card">
                    <strong>{{ r.risk }}</strong>
                    <div class="mitigation">
                      <label>Mitigation:</label>
                      <span>{{ r.mitigation }}</span>
                    </div>
                  </div>
                }
              </div>
            </div>

            <div class="section">
              <h3>✅ Success Criteria (DoD)</h3>
              <div class="dod-chips">
                @for (criteria of roadmap.successCriteria; track criteria) {
                  <span class="dod-chip">{{ criteria }}</span>
                }
              </div>
            </div>
          </div>
        }

      </div>
    </div>
  `,
  styles: [`
    .roadmap-modal-overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(10, 10, 15, 0.8); backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center; z-index: 2000;
    }
    .roadmap-modal {
      background: #1e293b; color: #f1f5f9; border-radius: 20px;
      width: 95%; max-width: 900px; max-height: 90vh; overflow-y: auto;
      box-shadow: 0 25px 70px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1);
    }
    .modal-header {
      padding: 24px; display: flex; justify-content: space-between; align-items: center;
      background: rgba(30, 41, 59, 0.95); position: sticky; top: 0; z-index: 100;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .ai-badge-premium {
      font-size: 10px; font-weight: 800; letter-spacing: 1px;
      background: rgba(99, 102, 241, 0.2); color: #818cf8;
      padding: 4px 10px; border-radius: 6px; display: inline-block; margin-bottom: 6px;
    }
    .roadmap-content-modern { padding: 24px; }
    .overview-grid { display: grid; grid-template-columns: 1fr 1fr 2fr; gap: 16px; margin-bottom: 24px; }
    .overview-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 16px; border-radius: 12px; }
    .overview-card label { display: block; font-size: 11px; color: #64748b; text-transform: uppercase; margin-bottom: 6px; }
    .overview-card .value { font-size: 16px; font-weight: 700; color: #f1f5f9; }
    .overview-card p { margin: 0; font-size: 13px; color: #94a3b8; line-height: 1.4; }
    .section-glass { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin-bottom: 24px; }
    .section h3, .section-glass h3 { font-size: 15px; font-weight: 700; color: #f8fafc; margin-bottom: 16px; }
    .strategy-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .strategy-item label { font-size: 11px; font-weight: 600; color: #818cf8; display: block; margin-bottom: 4px; }
    .strategy-item p { font-size: 13px; color: #cbd5e1; line-height: 1.5; margin: 0; }
    .phases-container { display: flex; flex-direction: column; gap: 16px; }
    .phase-card { background: rgba(255,255,255,0.02); border-left: 4px solid #6366f1; border-radius: 8px; padding: 16px; }
    .phase-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .phase-number { font-size: 9px; font-weight: 800; background: #6366f1; color: white; padding: 2px 6px; border-radius: 4px; }
    .phase-header h4 { margin: 0; font-size: 14px; font-weight: 700; }
    .steps-list { display: flex; flex-direction: column; gap: 12px; }
    .step-item { display: flex; gap: 12px; }
    .step-content { flex: 1; }
    .step-title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
    .step-title-row h5 { margin: 0; font-size: 13px; font-weight: 600; color: #f1f5f9; }
    .step-duration { font-size: 11px; color: #64748b; }
    .step-content p { margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.4; }
    .grid-2-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .check-list { list-style: none; padding: 0; margin: 0; }
    .check-list li { padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.03); color: #cbd5e1; font-size: 12px; }
    .risks-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .risk-card { background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.1); border-radius: 10px; padding: 12px; font-size: 13px; }
    .risk-card strong { display: block; margin-bottom: 8px; color: #f87171; }
    .mitigation label { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; display: block; margin-bottom: 2px; }
    .mitigation span { font-size: 12px; color: #cbd5e1; }
    .dod-chips { display: flex; flex-wrap: wrap; gap: 8px; }
    .dod-chip { background: rgba(16, 185, 129, 0.1); color: #34d399; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
    .spinner { width: 30px; height: 30px; border: 3px solid rgba(255,255,255,0.1); border-top: 3px solid #6366f1; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 16px; }
    @keyframes spin { 100% { transform: rotate(360deg); } }

    @media (max-width: 768px) {
      .modal-header { padding: 16px; }
      .roadmap-content-modern { padding: 16px; }
      .overview-grid { grid-template-columns: 1fr; gap: 12px; }
      .strategy-grid { grid-template-columns: 1fr; gap: 16px; }
      .grid-2-col { grid-template-columns: 1fr; gap: 16px; }
      .risks-grid { grid-template-columns: 1fr; gap: 12px; }
      .step-title-row { flex-direction: column; align-items: flex-start; gap: 4px; }
    }
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
        console.error('AI Roadmap Error:', err);
        if (err.message?.includes('503')) {
          this.error = "L'IA est actuellement surchargée. Veuillez réessayer dans quelques instants.";
        } else {
          this.error = "Impossible de générer la roadmap technique. Veuillez réessayer plus tard.";
        }
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
