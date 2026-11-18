import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, BrainCircuit, FileText, Globe, Link2, LoaderCircle, MessageSquareText, Plus, Search, Send, Sparkles, Trash2, X } from 'lucide-react';

const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const dateLabel = value => new Date(value + (value.endsWith('Z') ? '' : 'Z')).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

export default function App() {
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [mode, setMode] = useState('note');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');


useEffect(() => {
  if (!notice) return;

  const timer = setTimeout(() => {
    setNotice('');
  }, 3000);

  return () => clearTimeout(timer);
}, [notice]);

  async function loadItems() {
    try { const r = await fetch(`${API}/items`); const d = await r.json(); if (!r.ok) throw new Error(d.error); setItems(d.items); }
    catch { setError('Cannot connect to the backend. Make sure the API server is running on port 5000.'); }
  }
  useEffect(() => { loadItems(); }, []);

  const filtered = useMemo(() => items.filter(item => (tab === 'all' || item.source_type === tab) && `${item.title} ${item.content}`.toLowerCase().includes(search.toLowerCase())), [items, tab, search]);

  async function saveItem(e) {
    e.preventDefault(); setError(''); setNotice('');
    if (mode === 'note' && !content.trim()) return setError('Write a note before saving.');
    if (mode === 'url' && !url.trim()) return setError('Paste a URL before saving.');
    setSaving(true);
    try {
      const r = await fetch(`${API}/ingest`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(mode === 'note' ? { type: 'note', title, content } : { type: 'url', title, url }) });
      const d = await r.json(); if (!r.ok) throw new Error(d.error || 'Could not save this item.');
      setTitle(''); setContent(''); setUrl(''); setNotice('Saved to your knowledge inbox.'); await loadItems();
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  }

  async function askQuestion(e) {
    e.preventDefault(); if (!question.trim()) return;
    setLoading(true); setError(''); setAnswer(null);
    try {
      const r = await fetch(`${API}/query`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question }) });
      const d = await r.json(); if (!r.ok) throw new Error(d.error || 'Could not answer this question.'); setAnswer(d);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }

  
async function deleteItem(id) {
  if (!window.confirm('Delete this saved item?')) return;

  setNotice('');
  setError('');

  try {
    const r = await fetch(`${API}/items/${id}`, { method: 'DELETE' });
    const d = await r.json();

    if (!r.ok) throw new Error(d.error || 'Could not delete this item.');

    setItems(prev => prev.filter(item => item.id !== id));
  } catch (e) {
    setError(e.message);
  }
}


  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><BrainCircuit size={22}/></div><div><strong>MindVault</strong><span>YOUR AI KNOWLEDGE SPACE</span></div></div>
      <div className="side-label">WORKSPACE</div>
      <button className="nav-item active"><BookOpen size={18}/> Knowledge inbox <span className="nav-count">{items.length}</span></button>
      <div className="sidebar-bottom"><div className="tip-icon"><Sparkles size={18}/></div><strong>Your second brain</strong><p>Save what matters. Ask better questions. Find answers faster.</p></div>
    </aside>

    <main className="main-area">
      <header className="topbar"><div><div className="eyebrow">PERSONAL WORKSPACE / OVERVIEW</div><h1>Your knowledge, connected.</h1><p className="subheading">A simple home for everything you want to remember.</p></div><div className="top-pill"><span className="live-dot"/> AI workspace</div></header>
      {error && <div className="alert error"><span>{error}</span><button onClick={() => setError('')}><X size={16}/></button></div>}
      {notice && <div className="alert success"><span>{notice}</span><button onClick={() => setNotice('')}><X size={16}/></button></div>}

      <section className="stats-row"><div className="stat-card"><div className="stat-icon purple"><BookOpen size={19}/></div><div><strong>{items.length}</strong><span>Saved items</span></div></div><div className="stat-card"><div className="stat-icon blue"><FileText size={19}/></div><div><strong>{items.filter(i => i.source_type === 'note').length}</strong><span>Text notes</span></div></div><div className="stat-card"><div className="stat-icon orange"><Globe size={19}/></div><div><strong>{items.filter(i => i.source_type === 'url').length}</strong><span>Web pages</span></div></div></section>

      <div className="content-grid">
        <section className="panel add-panel"><div className="panel-heading"><div><span className="section-kicker">CAPTURE</span><h2>Add to your inbox</h2><p>Keep useful ideas and resources in one place.</p></div><div className="heading-icon"><Plus size={19}/></div></div>
          <div className="mode-switch"><button className={mode === 'note' ? 'selected' : ''} onClick={() => setMode('note')}><FileText size={16}/> Text note</button><button className={mode === 'url' ? 'selected' : ''} onClick={() => setMode('url')}><Link2 size={16}/> Website URL</button></div>
          <form onSubmit={saveItem} className="capture-form"><label>Title <span>OPTIONAL</span></label><input value={title} onChange={e => setTitle(e.target.value)} placeholder={mode === 'note' ? 'e.g. Ideas from today’s meeting' : 'e.g. Useful React guide'}/>
            {mode === 'note' ? <><label>Note content</label><textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Write or paste something worth remembering..." rows="6"/></> : <><label>Website address</label><input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com/article" type="url"/><div className="helper"><Globe size={14}/> We’ll fetch and save readable page text automatically.</div></>}
            <button className="primary-btn" disabled={saving}>{saving ? <><LoaderCircle className="spin" size={17}/> Saving and processing...</> : <><Plus size={17}/> Save to inbox</>}</button>
          </form>
        </section>

        <section className="panel ask-panel"><div className="panel-heading"><div><span className="section-kicker">AI ASSISTANT</span><h2>Ask your knowledge</h2><p>Get answers grounded in the things you saved.</p></div><div className="heading-icon ai"><Sparkles size={19}/></div></div>
          <div className="ask-prompt"><div className="prompt-spark"><Sparkles size={17}/></div><div><strong>What would you like to know?</strong><span>Your AI assistant searches your saved notes and pages.</span></div></div>
          <form className="question-form" onSubmit={askQuestion}><textarea rows="3" value={question} onChange={e => setQuestion(e.target.value)} placeholder="Ask a question about your saved knowledge..."/><button disabled={loading || !question.trim()} aria-label="Ask AI">{loading ? <LoaderCircle className="spin" size={18}/> : <Send size={18}/>}</button></form>
          {!answer && <div className="suggestions"><span>TRY ASKING</span><button onClick={() => setQuestion('Summarize the most important points I saved.')}>Summarize my notes</button><button onClick={() => setQuestion('What do my saved items say about the main topic?')}>Find key themes</button></div>}

{answer && (
  <div className="answer-box">
    <div className="answer-title">
      <Sparkles size={16} /> ANSWER
    </div>

    <p className="answer-text">{answer.answer}</p>

    <div className="source-title">SOURCES USED</div>

    {answer.sources.map((s) => (
      <div
        className="source-row"
        key={`${s.item_id}-${s.citation}`}
      >
        <span className="citation">[{s.citation}]</span>

        <div>
          <strong>{s.title}</strong>

          {s.source_type === 'url' && s.source_url && (
            <a
              href={s.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="source-url"
            >
              {s.source_url}
            </a>
          )}

          <p>
            {s.snippet.slice(0, 190)}
            {s.snippet.length > 190 ? '…' : ''}
          </p>
        </div>
      </div>
    ))}
  </div>
)}
        </section>
      </div>

      <section className="panel library-panel"><div className="library-head"><div><span className="section-kicker">YOUR LIBRARY</span><h2>Recently saved</h2><p>Your notes and web pages, all searchable.</p></div><div className="search-box"><Search size={16}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search your inbox..."/></div></div>
        <div className="filter-row"><div className="filters"><button className={tab === 'all' ? 'filter-active' : ''} onClick={() => setTab('all')}>All items <span>{items.length}</span></button><button className={tab === 'note' ? 'filter-active' : ''} onClick={() => setTab('note')}>Notes</button><button className={tab === 'url' ? 'filter-active' : ''} onClick={() => setTab('url')}>Web pages</button></div></div>
        {filtered.length ? <div className="item-list">{filtered.map(item => <article className="item-row" key={item.id}><div className={`item-icon ${item.source_type}`} >{item.source_type === 'note' ? <FileText size={19}/> : <Globe size={19}/>}</div><div className="item-info">
  <strong>{item.title}</strong>

  {item.source_type === 'url' && item.source_url && (
    <p>
      <a
        href={item.source_url}
        target="_blank"
        rel="noopener noreferrer"
        className="website-link"
      >
        {item.source_url}
      </a>
    </p>
  )}

  <p>
    {item.content.slice(0, 150)}
    {item.content.length > 150 ? '…' : ''}
  </p>

  <div className="item-meta"><span>{item.source_type === 'note' ? 'TEXT NOTE' : 'WEB PAGE'}</span><i/> {dateLabel(item.created_at)} <i/> {item.chunk_count} text chunks</div></div><button className="delete-btn" onClick={() => deleteItem(item.id)} title="Delete item"><Trash2 size={17}/></button></article>)}</div> : <div className="empty-state"><div><MessageSquareText size={24}/></div><strong>{items.length ? 'No matching items' : 'Your inbox is ready for its first note'}</strong><p>{items.length ? 'Try another search or filter.' : 'Add a note or website above. Your AI assistant will use it to answer questions.'}</p></div>}
      </section>
      <footer>MindVault <span>·</span> Built to make your knowledge useful.</footer>
    </main>
  </div>;
}
