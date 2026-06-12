import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from '@angular/core';

/**
 * A read-only source listing with a copy button — the "code example" half of
 * every docs demo. Dependency-free: the markup is HTML-escaped and rendered
 * with a light, regex-based token pass into themed `<span>`s (no Prism/Shiki),
 * so it stays small and re-themes with the M3 tokens like everything else.
 *
 * The highlighter is deliberately approximate: it colours tags, attributes,
 * strings, Angular template bindings and comments well enough to read, and is
 * applied to escaped text so it can never inject markup.
 */
@Component({
  selector: 'app-code',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="code-bar">
      <span class="code-lang">{{ language() }}</span>
      <button
        type="button"
        class="code-copy"
        (click)="copy()"
        [attr.aria-label]="copied() ? 'Copied' : 'Copy code'"
      >
        {{ copied() ? 'Copied' : 'Copy' }}
      </button>
    </div>
    <pre class="code-pre"><code [innerHTML]="highlighted()"></code></pre>
  `,
  styles: `
    :host {
      display: block;
      border-radius: var(--md-sys-shape-corner-medium, 12px);
      overflow: hidden;
      background: var(--md-sys-color-surface-container-highest, #e6e0e9);
      border: 1px solid var(--md-sys-color-outline-variant, #c8c5d0);
    }
    .code-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.25rem 0.5rem 0.25rem 0.75rem;
      border-bottom: 1px solid var(--md-sys-color-outline-variant, #c8c5d0);
    }
    .code-lang {
      font-family: 'Roboto Mono', ui-monospace, monospace;
      font-size: 0.6875rem;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--md-sys-color-on-surface-variant, #49454e);
    }
    .code-copy {
      appearance: none;
      border: none;
      cursor: pointer;
      font-family: inherit;
      font-size: 0.75rem;
      padding: 0.25rem 0.625rem;
      border-radius: var(--md-sys-shape-corner-full, 9999px);
      color: var(--md-sys-color-primary, #6750a4);
      background: transparent;
    }
    .code-copy:hover {
      background: color-mix(
        in srgb,
        var(--md-sys-color-primary, #6750a4) 8%,
        transparent
      );
    }
    .code-pre {
      margin: 0;
      padding: 0.875rem 1rem;
      overflow-x: auto;
      font-family: 'Roboto Mono', ui-monospace, monospace;
      font-size: 0.8125rem;
      line-height: 1.55;
      color: var(--md-sys-color-on-surface, #1c1b1f);
      tab-size: 2;
    }
    /* Token spans are injected via [innerHTML], so they carry no view-
       encapsulation attribute — ::ng-deep is required for these to match
       (the rules stay scoped under :host, so nothing leaks globally). */
    :host ::ng-deep .tok-tag {
      color: var(--md-sys-color-primary, #6750a4);
    }
    :host ::ng-deep .tok-attr {
      color: var(--md-sys-color-tertiary, #7d5260);
    }
    :host ::ng-deep .tok-str {
      color: var(--md-sys-color-secondary, #625b71);
    }
    :host ::ng-deep .tok-bind {
      color: var(--md-sys-color-tertiary, #7d5260);
      font-style: italic;
    }
    :host ::ng-deep .tok-comment {
      color: var(--md-sys-color-outline, #79747e);
      font-style: italic;
    }
    :host ::ng-deep .tok-kw {
      color: var(--md-sys-color-primary, #6750a4);
    }
  `,
})
export class CodePanelComponent {
  /** Raw source to display. Leading/trailing blank lines are trimmed. */
  readonly code = input.required<string>();
  /** Language label shown in the bar; also selects the highlighter. */
  readonly language = input<'html' | 'ts' | 'bash' | 'css'>('html');

  protected readonly copied = signal(false);

  private readonly normalized = computed(() => dedent(this.code()));

  protected readonly highlighted = computed(() => {
    const escaped = escapeHtml(this.normalized());
    return this.language() === 'ts'
      ? highlightTs(escaped)
      : highlightHtml(escaped);
  });

  protected async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.normalized());
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1600);
    } catch {
      // Clipboard may be unavailable (insecure context); fail silently.
    }
  }
}

/** Strip a common leading indent and surrounding blank lines. */
function dedent(input: string): string {
  const lines = input.replace(/\t/g, '  ').split('\n');
  while (lines.length && lines[0].trim() === '') lines.shift();
  while (lines.length && lines[lines.length - 1].trim() === '') lines.pop();
  const indent = Math.min(
    ...lines
      .filter((l) => l.trim().length)
      .map((l) => l.match(/^ */)?.[0].length ?? 0),
  );
  return lines.map((l) => l.slice(indent)).join('\n');
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Light HTML/Angular-template highlighter. Runs over already-escaped text in a
 * SINGLE pass: a combined alternation consumes each token once, so the spans it
 * injects can never be re-scanned (the bug a sequence of `.replace()` calls hits,
 * where a later pass matches `class="tok-tag"` inside markup an earlier one added).
 */
function highlightHtml(escaped: string): string {
  // 1: comment · 2/3: `<`(+`/`) and tag name · 4: quoted string ·
  // 5: attribute / binding name (followed by `=`).
  const token =
    /(&lt;!--[\s\S]*?--&gt;)|(&lt;\/?)([a-zA-Z][\w-]*)|("[^"]*"|'[^']*')|([[\]()*@:#\w.-]+)(?==)/g;
  return escaped.replace(
    token,
    (match, comment, open, tag, str, attr) => {
      if (comment) return span('tok-comment', comment);
      if (tag) return open + span('tok-tag', tag);
      if (str) return span('tok-str', str);
      if (attr) {
        const cls = /[[(*@]/.test(attr) ? 'tok-bind' : 'tok-attr';
        return span(cls, attr);
      }
      return match;
    },
  );
}

const TS_KEYWORDS =
  /^(?:import|from|export|class|const|let|readonly|protected|public|private|signal|input|output|computed|return|new|extends|implements|interface|type|void|async|await)$/;

/** Very small TS highlighter (single pass, same anti-re-scan reasoning). */
function highlightTs(escaped: string): string {
  const token =
    /(\/\/[^\n]*)|('[^']*'|"[^"]*"|`[^`]*`)|\b([A-Za-z_$][\w$]*)\b/g;
  return escaped.replace(token, (match, comment, str, word) => {
    if (comment) return span('tok-comment', comment);
    if (str) return span('tok-str', str);
    if (word && TS_KEYWORDS.test(word)) return span('tok-kw', word);
    return match;
  });
}

function span(cls: string, content: string): string {
  return `<span class="${cls}">${content}</span>`;
}
