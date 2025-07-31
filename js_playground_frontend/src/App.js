import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('light');
  const [code, setCode] = useState('// Write JavaScript here\nconsole.log("Hello, Playground!");');
  const [consoleLines, setConsoleLines] = useState([]);
  const [snippets, setSnippets] = useState([]);
  const [snippetName, setSnippetName] = useState('');
  const [selectedSnippetIdx, setSelectedSnippetIdx] = useState(null);

  const editorRef = useRef(null);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // Syntax highlighting (simple, in-browser for JS keywords)
  function highlightJS(code) {
    if (!code) return '';
    // Basic keyword highlighting
    const keywords = /\b(function|const|let|var|return|if|else|for|while|break|continue|switch|case|default|console|log|class|new|try|catch|throw|import|export|extends|super|this)\b/g;
    const stringLiterals = /("[^"]*"|'[^']*'|`[^`]*`)/g;
    const numbers = /\b(\d+(\.\d+)?)\b/g;
    // Order: strings, numbers, keywords
    let escaped = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    escaped = escaped.replace(stringLiterals, '<span class="hl-string">$1</span>');
    escaped = escaped.replace(numbers, '<span class="hl-number">$1</span>');
    escaped = escaped.replace(keywords, '<span class="hl-keyword">$1</span>');
    return escaped;
  }

  // PUBLIC_INTERFACE
  function handleEditorInput(e) {
    setCode(e.target.innerText);
  }

  // PUBLIC_INTERFACE
  function runCode() {
    let output = [];
    // Custom console implementation
    const fakeConsole = {
      log: (...args) => {
        output.push({ type: 'log', text: args.map(String).join(' ') });
      },
      error: (...args) => {
        output.push({ type: 'error', text: args.map(String).join(' ') });
      },
      warn: (...args) => {
        output.push({ type: 'warn', text: args.map(String).join(' ') });
      }
    };
    try {
      // eslint-disable-next-line no-new-func
      const runner = new Function('console', code);
      runner(fakeConsole);
    } catch (err) {
      output.push({ type: 'error', text: String(err) });
    }
    setConsoleLines(output);
  }

  // PUBLIC_INTERFACE
  function saveSnippet() {
    if (!snippetName.trim()) return;
    setSnippets((prev) => [
      ...prev,
      {
        name: snippetName.trim(),
        code: code,
      },
    ]);
    setSnippetName('');
  }

  // PUBLIC_INTERFACE
  function selectSnippet(idx) {
    setSelectedSnippetIdx(idx);
    setCode(snippets[idx].code);
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.focus();
      }
    }, 0);
  }

  // PUBLIC_INTERFACE
  function shareSnippet() {
    // Just share a serialized code (could use a sharing backend in real app)
    const url = `${window.location.origin}${window.location.pathname}?code=${encodeURIComponent(
      code
    )}`;
    navigator.clipboard.writeText(url);
    alert('Sharable URL copied to clipboard!');
  }

  // PUBLIC_INTERFACE
  function copyCode() {
    navigator.clipboard.writeText(code);
    alert('Code copied to clipboard!');
  }

  // Handle initial URL load with ?code=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeQ = params.get('code');
    if (codeQ) setCode(codeQ);
  }, []);

  return (
    <div className="playground-root" style={{ background: "var(--bg-primary)", minHeight: "100vh", color: "var(--text-primary)", transition: "background 0.2s" }}>
      <header className="top-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 2rem", background: "var(--primary, #1e88e5)", color: "#fff", height: 56, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
        <div style={{ fontWeight: 700, fontSize: 22, letterSpacing: "0.04em" }}>
          <span style={{ color: "#ffb300" }}>JS</span> Playground
        </div>
        <button 
          className="theme-toggle" 
          onClick={toggleTheme} 
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          style={{ background: "var(--accent, #ffb300)" }}
        >{theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </header>
      <div className="layout-main" style={{ display: "flex", height: "calc(100vh - 56px)" }}>
        {/* Sidebar */}
        <aside className="sidebar" style={{
          minWidth: 210,
          width: 210,
          background: "var(--secondary, #424242)",
          color: "#fff",
          padding: "30px 16px 16px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          gap: 24
        }}>
          <div style={{ fontWeight: 600, fontSize: 18 }}>Saved Snippets</div>
          <ul className="snippets-list" style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1, overflowY: "auto" }}>
            {snippets.length === 0 && <li style={{ fontSize: 13, color: "#ccc" }}>No saved snippets.</li>}
            {snippets.map((snip, idx) => (
              <li key={idx} style={{ marginBottom: 8 }}>
                <button
                  style={{
                    background: selectedSnippetIdx === idx ? "#ffb300" : "#fff",
                    color: selectedSnippetIdx === idx ? "#333" : "#222",
                    border: 'none',
                    padding: "5px 11px",
                    borderRadius: 5,
                    cursor: "pointer",
                    width: "100%",
                    textAlign: "left",
                    fontWeight: selectedSnippetIdx === idx ? 700 : 500
                  }}
                  onClick={() => selectSnippet(idx)}
                >
                  {snip.name}
                </button>
              </li>
            ))}
          </ul>
          <div style={{ marginTop: "auto" }}>
            <input
              type="text"
              value={snippetName}
              onChange={e => setSnippetName(e.target.value)}
              placeholder="New snippet name"
              style={{ borderRadius: 4, border: "none", padding: "5px 9px", width: "100%", marginBottom: 7, outline: "none" }}
              onKeyDown={e => {
                if (e.key === "Enter") saveSnippet();
              }}
              maxLength={32}
            />
            <button
              style={{ background: "#ffb300", border: "none", borderRadius: 4, padding: "7px 12px", width: "100%", fontWeight: 600, cursor: 'pointer', color: "#222", fontSize: 15 }}
              onClick={saveSnippet}
              disabled={!snippetName.trim()}
            >
              Save Snippet
            </button>
          </div>
        </aside>
        {/* Main Editor and Output Panel */}
        <main style={{
          flex: 1, display: "flex", flexDirection: "column", background: "var(--bg-secondary)", minWidth: 0, padding: "0", overflow: "hidden"
        }}>
          {/* Editor panel */}
          <section style={{ flex: 1, padding: "32px 40px 0 40px", minHeight: 0, display: 'flex', flexDirection: "column", alignItems: "stretch", gap: "16px" }}>
            <div style={{ display: "flex", gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 18, fontWeight: 600 }}>Editor</span>
              <button className="btn-utility" style={{ marginLeft: "auto" }} title="Copy Code" onClick={copyCode}>📋</button>
              <button className="btn-utility" title="Share Code" onClick={shareSnippet}>🔗</button>
              <button className="btn-utility" title="Run Code" style={{ color: "#fff", background: "#1e88e5", border: "none", borderRadius: 5, padding: "4px 15px" }} onClick={runCode}>▶ Run</button>
            </div>
            <pre
              className="editor"
              ref={editorRef}
              contentEditable
              spellCheck={false}
              onInput={handleEditorInput}
              onBlur={e => setCode(e.target.innerText)}
              style={{
                fontFamily: "Menlo, Monaco, Consolas, 'Courier New', monospace",
                fontSize: 16,
                minHeight: 214,
                maxHeight: 330,
                lineHeight: 1.5,
                border: "2px solid #e3e8f0",
                background: "#f9f9fa",
                borderRadius: 9,
                padding: "16px",
                color: "#333",
                outline: "none",
                overflowY: 'auto',
                boxShadow: "0 2px 6px rgba(30,136,229,0.02)"
              }}
              dangerouslySetInnerHTML={{ __html: highlightJS(code) }}
              aria-label="JavaScript Editor"
              tabIndex={0}
              data-testid="js-editor"
            />
            <div style={{ marginTop: 2, fontSize: 13, color: "#888" }}>Supports basic syntax highlight. Press ▶ Run to execute. Console logs will appear below.</div>
          </section>
          {/* Output/console */}
          <section className="output-panel" style={{
            background: "#212121", color: "#fff", minHeight: 120, borderTop: "3px solid #1e88e5", padding: "16px 38px", fontFamily: "Menlo, Monaco, Consolas, 'Courier New', monospace", fontSize: 15, overflowY: "auto"
          }}>
            <div style={{ marginBottom: "6px", fontWeight: 700, color: "#ffb300", letterSpacing: "0.03em" }}>Console Output:</div>
            {consoleLines.length === 0 && <div style={{ color: "#bbb" }}>No output. Use <b>console.log(...)</b> in your code and press Run.</div>}
            {consoleLines.map((l, idx) =>
              <div key={idx} style={{
                color:
                  l.type === 'error'
                    ? '#ff3333'
                    : l.type === 'warn'
                      ? '#ffe082'
                      : '#a7ffeb',
                background:
                  l.type === 'error'
                    ? 'rgba(255,0,44,0.06)'
                    : l.type === 'warn'
                      ? 'rgba(255,183,77,0.16)'
                      : 'rgba(30,136,229,0.09)',
                padding: '3px 8px',
                borderRadius: 3,
                marginBottom: 2,
                fontWeight: l.type === 'error' ? 700 : 500,
                whiteSpace: 'pre-wrap'
              }}>{l.text}</div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
