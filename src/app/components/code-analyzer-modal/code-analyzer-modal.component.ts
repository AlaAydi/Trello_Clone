import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AiCodeAnalyzerService,
  CodeSubmission,
  CodeAnalysisResponse,
  CodeIssue,
  Severity
} from '../../services/ai-code-analyzer.service';

@Component({
  selector: 'app-code-analyzer-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="analyzer-overlay" (click)="onOverlayClick($event)">
      <div class="analyzer-modal">

        <!-- HEADER -->
        <div class="modal-header">
          <div class="header-info">
            <span class="ai-badge">🔍 AI Code Review</span>
            <h2>Code Quality Analysis</h2>
            @if (ticketId) {
              <span class="ticket-ref">Ticket: {{ ticketId }}</span>
            }
          </div>
          <button class="close-btn" (click)="close.emit()">✕</button>
        </div>

        <!-- CODE INPUT (si pas encore soumis) -->
        @if (!analysis && !isLoading) {
          <div class="code-input-panel">
            <div class="language-selector">
              <label>Language:</label>
              <select [(ngModel)]="submission.language">
                <option value="java">Java (Spring Boot)</option>
                <option value="typescript">TypeScript (Angular)</option>
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="kotlin">Kotlin</option>
              </select>
            </div>

            <div class="context-input">
              <label>What should this code do? (optional)</label>
              <input type="text" [(ngModel)]="submission.context" placeholder="e.g., REST API endpoint for user authentication">
            </div>

            <div class="code-editor">
              <label>Paste your code here:</label>
              <textarea
                [(ngModel)]="submission.code"
                placeholder="// Paste your code here..."
                rows="20"
                spellcheck="false">
              </textarea>
            </div>

            <button class="analyze-btn" (click)="analyzeCode()" [disabled]="!submission.code">
              🔍 Analyze Code
            </button>
          </div>
        }

        <!-- LOADING -->
        @if (isLoading) {
          <div class="loading-panel">
            <div class="analyzing-animation">
              @for (b of [1,2,3,4,5]; track b) {
                <div class="bar" [style.animation-delay]="(b * 0.15) + 's'"></div>
              }
            </div>
            <p>Analyzing code quality...</p>
            <small>Checking for bugs, vulnerabilities, and code smells</small>
          </div>
        }

        <!-- ANALYSIS RESULTS -->
        @if (analysis && !isLoading) {
          <div class="analysis-results">

            <!-- SCORE HEADER -->
            <div class="score-header">
              <div class="overall-score" [style.color]="analyzerService.getScoreColor(analysis.overallScore)">
                <div class="score-number">{{ analysis.overallScore }}<span class="score-max">/20</span></div>
                <div class="grade-badge" [class]="'grade-' + analysis.grade">{{ analysis.grade }}</div>
              </div>
              <div class="score-breakdown">
                @for (item of getScoreItems(); track item.label) {
                  <div class="breakdown-item">
                    <span class="label">{{ item.label }}</span>
                    <div class="progress-bar">
                      <div class="progress-fill" [style.width]="(item.value / 20 * 100) + '%'"
                           [style.background]="analyzerService.getScoreColor(item.value)"></div>
                    </div>
                    <span class="value" [style.color]="analyzerService.getScoreColor(item.value)">
                      {{ item.value }}/20
                    </span>
                  </div>
                }
              </div>
            </div>

            <!-- SUMMARY -->
            <div class="section summary-section">
              <p>{{ analysis.summary }}</p>
            </div>

            <!-- METRICS ROW -->
            <div class="metrics-row">
              @for (m of getMetricsItems(); track m.label) {
                <div class="metric">
                  <div class="metric-value" [class]="m.badClass">{{ m.value }}</div>
                  <div class="metric-label">{{ m.label }}</div>
                </div>
              }
            </div>

            <!-- ISSUES SECTION -->
            @if (analysis.issues?.length) {
              <div class="section">
                <div class="section-header">
                  <h3>🐛 Issues Found</h3>
                  <div class="issue-filters">
                    @for (sev of severities; track sev) {
                      <button [class.active]="activeSeverity === sev"
                              (click)="filterBySeverity(sev)"
                              [class]="'filter-btn severity-' + sev.toLowerCase()">
                        {{ sev }} ({{ countBySeverity(sev) }})
                      </button>
                    }
                  </div>
                </div>

                <div class="issues-list">
                  @for (issue of filteredIssues; track issue.id) {
                    <div class="issue-card" [class]="'severity-' + issue.severity.toLowerCase()">
                      <div class="issue-header">
                        <div class="left">
                          <span class="severity-dot" [style.background]="analyzerService.getSeverityColor(issue.severity)"></span>
                          <span class="issue-type">{{ issue.type }}</span>
                          @if (issue.line) {
                            <span class="issue-line">Line {{ issue.line }}</span>
                          }
                        </div>
                        <span class="severity-label" [style.color]="analyzerService.getSeverityColor(issue.severity)">
                          {{ issue.severity }}
                        </span>
                      </div>
                      <h4 class="issue-title">{{ issue.title }}</h4>
                      <p class="issue-desc">{{ issue.description }}</p>

                      @if (issue.codeSnippet) {
                        <div class="code-snippet">
                          <pre><code>{{ issue.codeSnippet }}</code></pre>
                        </div>
                      }

                      <div class="issue-suggestion">
                        <strong>✅ Fix:</strong> {{ issue.suggestion }}
                      </div>

                      <div class="issue-meta">
                        <span>⏱ Effort: {{ issue.effort }}</span>
                        <span>⚡ Impact: {{ issue.impact }}</span>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- STRENGTHS -->
            <div class="strengths-improvements">
              @if (analysis.strengths?.length) {
                <div class="section">
                  <h3>✅ Strengths</h3>
                  <ul class="green-list">
                    @for (s of analysis.strengths; track s) {
                      <li>{{ s }}</li>
                    }
                  </ul>
                </div>
              }
              @if (analysis.improvements?.length) {
                <div class="section">
                  <h3>🔧 Priority Improvements</h3>
                  <ul class="orange-list">
                    @for (i of analysis.improvements; track i) {
                      <li>{{ i }}</li>
                    }
                  </ul>
                </div>
              }
            </div>

            <!-- REFACTORED EXAMPLES -->
            @if (analysis.refactoredSnippets?.length) {
              <div class="section">
                <h3>💡 Refactoring Examples</h3>
                @for (snippet of analysis.refactoredSnippets; track snippet.title) {
                  <div class="refactor-card">
                    <h4>{{ snippet.title }}</h4>
                    <div class="code-compare">
                      <div class="code-before">
                        <label>❌ Before</label>
                        <pre><code>{{ snippet.original }}</code></pre>
                      </div>
                      <div class="code-after">
                        <label>✅ After</label>
                        <pre><code>{{ snippet.improved }}</code></pre>
                      </div>
                    </div>
                    <p class="refactor-explanation">{{ snippet.explanation }}</p>
                    <p class="refactor-benefit">🎯 {{ snippet.benefitExplanation }}</p>
                  </div>
                }
              </div>
            }

            <!-- ACTION BUTTONS -->
            <div class="action-buttons">
              <button class="btn-secondary" (click)="resetAnalysis()">Analyze another code</button>
              <button class="btn-primary" (click)="exportReport()">📄 Export Report</button>
            </div>
          </div>
        }

      </div>
    </div>
  `,
  styles: [`
    .analyzer-overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.7); display: flex; align-items: center;
      justify-content: center; z-index: 1000;
    }
    .analyzer-modal {
      background: #fff; border-radius: 12px; width: 95%; max-width: 1100px;
      max-height: 95vh; overflow-y: auto; color: #333;
    }
    .modal-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      padding: 20px 24px; border-bottom: 1px solid #eee;
      position: sticky; top: 0; background: #fff; z-index: 10;
    }
    .ai-badge { background: #2d3436; color: #fff; padding: 3px 10px; border-radius: 20px; font-size: 11px; }
    .modal-header h2 { margin: 6px 0 2px; font-size: 18px; }
    .ticket-ref { font-size: 12px; color: #888; }
    .close-btn { background: none; border: none; font-size: 20px; cursor: pointer; }

    /* Code Input */
    .code-input-panel { padding: 24px; }
    .language-selector, .context-input { margin-bottom: 16px; display: flex; align-items: center; gap: 12px; }
    .language-selector label, .context-input label { font-size: 13px; color: #666; white-space: nowrap; }
    .language-selector select { border: 1px solid #ddd; border-radius: 6px; padding: 6px 12px; }
    .context-input input { flex: 1; border: 1px solid #ddd; border-radius: 6px; padding: 8px 12px; }
    .code-editor label { display: block; font-size: 13px; color: #666; margin-bottom: 8px; }
    .code-editor textarea {
      width: 100%; font-family: 'Courier New', monospace; font-size: 13px;
      border: 1px solid #ddd; border-radius: 8px; padding: 12px;
      background: #1e1e1e; color: #d4d4d4; box-sizing: border-box;
    }
    .analyze-btn {
      margin-top: 16px; padding: 12px 32px; background: #6c5ce7; color: white;
      border: none; border-radius: 8px; font-size: 15px; cursor: pointer; width: 100%;
    }
    .analyze-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    /* Loading */
    .loading-panel { text-align: center; padding: 60px; }
    .analyzing-animation { display: flex; align-items: flex-end; justify-content: center; gap: 6px; margin-bottom: 24px; height: 40px; }
    .bar {
      width: 8px; background: #6c5ce7; border-radius: 4px;
      animation: equalizer 1s ease-in-out infinite alternate;
    }
    @keyframes equalizer { 0% { height: 8px; } 100% { height: 40px; } }

    /* Score Header */
    .analysis-results { padding: 24px; }
    .score-header {
      display: flex; align-items: center; gap: 40px;
      background: #f8f9fa; border-radius: 12px; padding: 24px; margin-bottom: 24px;
    }
    .overall-score { text-align: center; min-width: 100px; }
    .score-number { font-size: 56px; font-weight: 800; line-height: 1; }
    .score-max { font-size: 22px; color: #888; }
    .grade-badge {
      display: inline-block; padding: 4px 16px; border-radius: 20px;
      font-size: 18px; font-weight: 700; margin-top: 6px;
    }
    .grade-A { background: #d5f5e3; color: #1a7a4a; }
    .grade-B { background: #d5f5e3; color: #27ae60; }
    .grade-C { background: #fef9e7; color: #d4ac0d; }
    .grade-D { background: #fdebd0; color: #ca6f1e; }
    .grade-E, .grade-F { background: #fdedec; color: #c0392b; }
    .score-breakdown { flex: 1; display: flex; flex-direction: column; gap: 10px; }
    .breakdown-item { display: flex; align-items: center; gap: 12px; font-size: 13px; }
    .breakdown-item .label { width: 120px; color: #555; }
    .progress-bar { flex: 1; height: 8px; background: #e8e8e8; border-radius: 4px; overflow: hidden; }
    .progress-fill { height: 100%; border-radius: 4px; transition: width 0.8s ease; }
    .breakdown-item .value { width: 50px; text-align: right; font-weight: 600; }

    /* Metrics */
    .metrics-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
    .metric { text-align: center; padding: 16px; background: #f8f9fa; border-radius: 8px; }
    .metric-value { font-size: 24px; font-weight: 700; }
    .metric-label { font-size: 11px; color: #888; margin-top: 4px; text-transform: uppercase; }
    .metric-value.bad { color: #e74c3c; }
    .metric-value.warn { color: #e67e22; }
    .metric-value.good { color: #2ecc71; }

    /* Issues */
    .section { margin-bottom: 32px; }
    .section h3 { font-size: 15px; font-weight: 600; margin-bottom: 16px; }
    .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
    .issue-filters { display: flex; gap: 8px; }
    .filter-btn { padding: 4px 10px; border: 1px solid #ddd; border-radius: 4px; background: none; cursor: pointer; font-size: 12px; }
    .filter-btn.active { background: #333; color: white; border-color: #333; }
    .issues-list { display: flex; flex-direction: column; gap: 12px; }
    .issue-card { border: 1px solid #eee; border-radius: 10px; padding: 16px; }
    .issue-card.severity-blocker { border-left: 4px solid #c0392b; }
    .issue-card.severity-critical { border-left: 4px solid #e74c3c; }
    .issue-card.severity-major { border-left: 4px solid #e67e22; }
    .issue-card.severity-minor { border-left: 4px solid #f39c12; }
    .issue-card.severity-info { border-left: 4px solid #3498db; }
    .issue-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .left { display: flex; align-items: center; gap: 8px; }
    .severity-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
    .issue-type { font-size: 11px; font-weight: 600; background: #f0f0f0; padding: 2px 8px; border-radius: 4px; }
    .issue-line { font-size: 12px; color: #888; }
    .severity-label { font-size: 12px; font-weight: 600; }
    .issue-title { margin: 0 0 6px; font-size: 14px; }
    .issue-desc { color: #555; font-size: 13px; margin-bottom: 10px; }
    .code-snippet { background: #1e1e1e; border-radius: 6px; padding: 10px; margin-bottom: 10px; }
    .code-snippet pre { margin: 0; color: #d4d4d4; font-size: 12px; font-family: monospace; white-space: pre-wrap; }
    .issue-suggestion { background: #f0fdf4; border-radius: 6px; padding: 10px; font-size: 13px; margin-bottom: 8px; }
    .issue-meta { display: flex; gap: 20px; font-size: 12px; color: #888; }

    /* Strengths */
    .strengths-improvements { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .green-list li { color: #27ae60; margin-bottom: 6px; font-size: 14px; }
    .orange-list li { color: #e67e22; margin-bottom: 6px; font-size: 14px; }

    /* Refactor */
    .refactor-card { border: 1px solid #eee; border-radius: 10px; padding: 16px; margin-bottom: 16px; }
    .refactor-card h4 { margin: 0 0 12px; }
    .code-compare { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
    .code-before label, .code-after label { display: block; font-size: 12px; font-weight: 600; margin-bottom: 6px; }
    .code-before label { color: #e74c3c; }
    .code-after label { color: #27ae60; }
    .code-before pre, .code-after pre { background: #1e1e1e; border-radius: 6px; padding: 10px; margin: 0; }
    .code-before pre code, .code-after pre code { color: #d4d4d4; font-size: 12px; font-family: monospace; }
    .refactor-explanation { color: #555; font-size: 13px; margin: 0 0 6px; }
    .refactor-benefit { color: #6c5ce7; font-size: 13px; font-weight: 500; }

    /* Summary */
    .summary-section { background: #f8f9fa; border-radius: 8px; padding: 16px; }
    .summary-section p { margin: 0; color: #444; line-height: 1.6; }

    /* Buttons */
    .action-buttons { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; }
    .btn-primary { padding: 10px 24px; background: #6c5ce7; color: white; border: none; border-radius: 8px; cursor: pointer; }
    .btn-secondary { padding: 10px 24px; background: #f0f0f0; color: #333; border: none; border-radius: 8px; cursor: pointer; }
  `]
})
export class CodeAnalyzerModalComponent implements OnInit {

  @Input() ticketId?: string;
  @Output() close = new EventEmitter<void>();

  analysis: CodeAnalysisResponse | null = null;
  isLoading = false;
  activeSeverity: string = 'ALL';
  severities: Severity[] = ['BLOCKER', 'CRITICAL', 'MAJOR', 'MINOR', 'INFO'];

  submission: CodeSubmission = {
    code: '',
    language: 'java',
    context: ''
  };

  constructor(public analyzerService: AiCodeAnalyzerService) {}

  ngOnInit(): void {
    if (this.ticketId) {
      this.submission.ticketId = this.ticketId;
    }
  }

  analyzeCode(): void {
    if (!this.submission.code.trim()) return;
    this.isLoading = true;

    this.analyzerService.analyzeCode(this.submission).subscribe({
      next: (result) => {
        this.analysis = result;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Analysis error:', err);
        this.isLoading = false;
      }
    });
  }

  filterBySeverity(severity: string): void {
    this.activeSeverity = this.activeSeverity === severity ? 'ALL' : severity;
  }

  get filteredIssues(): CodeIssue[] {
    if (!this.analysis) return [];
    if (this.activeSeverity === 'ALL') return this.analysis.issues;
    return this.analysis.issues.filter(i => i.severity === this.activeSeverity);
  }

  countBySeverity(severity: Severity): number {
    return this.analysis?.issues.filter(i => i.severity === severity).length || 0;
  }

  getScoreItems(): { label: string; value: number }[] {
    if (!this.analysis) return [];
    const sb = this.analysis.scoreBreakdown;
    return [
      { label: 'Reliability', value: sb.reliability },
      { label: 'Security', value: sb.security },
      { label: 'Maintainability', value: sb.maintainability },
      { label: 'Performance', value: sb.performance },
      { label: 'Readability', value: sb.readability }
    ];
  }

  getMetricsItems(): { label: string; value: string; badClass: string }[] {
    if (!this.analysis) return [];
    const m = this.analysis.metrics;
    return [
      { label: 'Lines of Code', value: String(m.linesOfCode), badClass: '' },
      { label: 'Cyclomatic Complexity', value: String(m.cyclomaticComplexity), badClass: m.cyclomaticComplexity > 10 ? 'bad' : m.cyclomaticComplexity > 5 ? 'warn' : 'good' },
      { label: 'Duplicated Lines', value: m.duplicatedPercentage.toFixed(1) + '%', badClass: m.duplicatedPercentage > 15 ? 'bad' : m.duplicatedPercentage > 5 ? 'warn' : 'good' },
      { label: 'Maintainability', value: m.maintainabilityIndex + '/100', badClass: m.maintainabilityIndex < 40 ? 'bad' : m.maintainabilityIndex < 65 ? 'warn' : 'good' }
    ];
  }

  resetAnalysis(): void {
    this.analysis = null;
    this.submission.code = '';
  }

  exportReport(): void {
    if (!this.analysis) return;
    const report = JSON.stringify(this.analysis, null, 2);
    const blob = new Blob([report], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code-analysis-${this.ticketId || 'report'}-${Date.now()}.json`;
    a.click();
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('analyzer-overlay')) {
      this.close.emit();
    }
  }
}
