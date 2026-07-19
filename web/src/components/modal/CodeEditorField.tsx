/**
 * CodeEditorField - Lightweight syntax-highlighted code editor
 * No external deps: textarea + highlight overlay (textarea mirror pattern)
 */

import React, { useRef, useCallback } from 'react';

type Language = 'javascript' | 'typescript' | 'python';

interface Props {
  value: string;
  onChange: (val: string) => void;
  language?: Language;
}

// ── Tokenizer ──────────────────────────────────────────────────────────────
const JS_KEYWORDS = /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|delete|typeof|instanceof|in|of|class|extends|import|export|default|async|await|try|catch|finally|throw|null|undefined|true|false|this|super|yield|from|as|void)\b/g;
const TS_EXTRA   = /\b(type|interface|enum|implements|declare|namespace|module|abstract|readonly|keyof|infer|never|unknown|any|string|number|boolean|object|symbol|bigint|public|private|protected|static|override)\b/g;
const PY_KEYWORDS = /\b(def|class|return|if|elif|else|for|while|in|not|and|or|import|from|as|with|try|except|finally|raise|pass|break|continue|lambda|yield|global|nonlocal|del|assert|True|False|None|print|len|range|type|str|int|float|bool|list|dict|set|tuple)\b/g;

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function highlight(code: string, lang: Language): string {
  let esc = escapeHtml(code);

  // Comments
  if (lang === 'python') {
    esc = esc.replace(/(#.*)$/gm, '<span class="ce-comment">$1</span>');
  } else {
    esc = esc.replace(/(\/\/.*$)/gm, '<span class="ce-comment">$1</span>');
    esc = esc.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="ce-comment">$1</span>');
  }

  // Strings — don't re-highlight inside already-wrapped spans
  esc = esc.replace(/(`[^`]*`|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, (m) => {
    if (m.startsWith('<')) return m; // already wrapped
    return `<span class="ce-string">${m}</span>`;
  });

  // Numbers
  esc = esc.replace(/\b(\d+\.?\d*)\b/g, '<span class="ce-number">$1</span>');

  // $json / $node / $items built-ins
  esc = esc.replace(/(\$[a-zA-Z_]\w*)/g, '<span class="ce-builtin">$1</span>');

  // Keywords
  const kwPattern = lang === 'python' ? PY_KEYWORDS : JS_KEYWORDS;
  kwPattern.lastIndex = 0;
  esc = esc.replace(kwPattern, '<span class="ce-keyword">$1</span>');

  if (lang === 'typescript') {
    TS_EXTRA.lastIndex = 0;
    esc = esc.replace(TS_EXTRA, '<span class="ce-type">$1</span>');
  }

  return esc;
}

// ── Component ──────────────────────────────────────────────────────────────
export function CodeEditorField({ value, onChange, language = 'javascript' }: Props) {
  const preRef = useRef<HTMLPreElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const syncScroll = useCallback(() => {
    if (preRef.current && textareaRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Tab key → insert 2 spaces
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newVal = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newVal);
      // Restore cursor after React re-render
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2;
      });
    }
  }, [value, onChange]);

  const highlighted = highlight(value || '', language) + '\n'; // trailing newline prevents last-line clipping

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-white/10 hover:border-white/20 focus-within:border-brand-blue focus-within:ring-2 focus-within:ring-brand-blue/30 transition-all" style={{ fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace", fontSize: '13px', lineHeight: '1.6' }}>
      {/* Syntax-highlighted overlay */}
      <pre
        ref={preRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 m-0 p-4 overflow-auto whitespace-pre select-none text-gray-100"
        style={{ fontFamily: 'inherit', fontSize: 'inherit', lineHeight: 'inherit', background: 'transparent' }}
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />
      {/* Actual editable textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={syncScroll}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        className="relative w-full bg-gray-950/80 text-gray-100 caret-white outline-none resize-none p-4 min-h-[200px] overflow-auto whitespace-pre"
        style={{
          fontFamily: 'inherit',
          fontSize: 'inherit',
          lineHeight: 'inherit',
          caretColor: 'white',
          color: 'transparent',
          WebkitTextFillColor: 'transparent',
          background: 'transparent',
        }}
        placeholder={language === 'python' ? '# Your Python code here\nprint($json["value"])' : '// Your code here\nconst result = $json.value;\nreturn { result };'}
      />
      {/* Visible code layer (behind textarea, acts as display) */}
      <style>{`
        .ce-keyword { color: #c792ea; font-weight: 600; }
        .ce-type    { color: #82aaff; }
        .ce-string  { color: #c3e88d; }
        .ce-number  { color: #f78c6c; }
        .ce-comment { color: #546e7a; font-style: italic; }
        .ce-builtin { color: #ffcb6b; font-weight: 600; }
        /* Make the pre visible by rendering the span colors in the pre */
        div:has(> pre) pre { color: #eee; }
      `}</style>
    </div>
  );
}
