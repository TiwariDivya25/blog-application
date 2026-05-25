import { useState, useEffect, useRef } from 'react';

const API = 'http://localhost:8000/api';

const api = (url, opts = {}) =>
  fetch(API + url, {
    credentials: 'include',
    ...opts,
    headers: { 'Content-Type': 'application/json', ...opts.headers },
  });

function getCsrf() {
  return document.cookie
    .split('; ')
    .find(r => r.startsWith('csrftoken='))
    ?.split('=')[1];
}

function getReadTime(content) {
  const words = content?.trim().split(/\s+/).length || 0;
  return Math.max(1, Math.ceil(words / 200));
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

function getInitial(name) {
  return (name || '?')[0].toUpperCase();
}

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ name, size = 36 }) {
  const colors = ['#c8a96e', '#7c9e87', '#9b7aa0', '#c07b6a', '#6a8caf'];
  const idx = (name?.charCodeAt(0) || 0) % colors.length;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: colors[idx], color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.4, fontWeight: '700', flexShrink: 0,
      fontFamily: "'DM Serif Display', Georgia, serif",
      letterSpacing: '0.02em',
    }}>
      {getInitial(name)}
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div style={{
      position: 'fixed', bottom: 32, left: '50%',
      transform: 'translateX(-50%)',
      background: type === 'error' ? '#b94040' : '#2a2a2a',
      color: '#faf8f4', padding: '12px 24px', borderRadius: 4,
      fontSize: 14, fontFamily: "'DM Sans', sans-serif",
      boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
      zIndex: 9999, animation: 'fadeUp 0.25s ease',
      letterSpacing: '0.02em', fontWeight: 500,
      whiteSpace: 'nowrap',
    }}>
      {msg}
    </div>
  );
}

// ── Featured Post Card ────────────────────────────────────────────────────────
function FeaturedCard({ post, currentUser, onDelete }) {
  return (
    <article style={{
      borderBottom: '1px solid #e8e3da',
      paddingBottom: 56, marginBottom: 56,
      animation: 'fadeIn 0.5s ease 0s both',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <span style={{
          background: '#1a1a1a', color: '#faf8f4',
          fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
          textTransform: 'uppercase', padding: '4px 10px', borderRadius: 2,
          fontFamily: "'DM Sans', sans-serif",
        }}>Featured</span>
      </div>
      <h2 style={{
        fontFamily: "'DM Serif Display', Georgia, serif",
        fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 400,
        lineHeight: 1.18, letterSpacing: '-0.02em', color: '#1a1a1a',
        margin: '0 0 18px',
      }}>
        {post.title}
      </h2>
      <p style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: 17,
        color: '#4a4a4a', lineHeight: 1.75, margin: '0 0 24px', maxWidth: 680,
      }}>
        {post.content.length > 280 ? post.content.slice(0, 280) + '\u2026' : post.content}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <Avatar name={post.author_name} size={34} />
        <div>
          <div style={{
            fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
            fontSize: 14, color: '#1a1a1a',
          }}>
            {post.author_name}
          </div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888' }}>
            {formatDate(post.created)} &middot; {getReadTime(post.content)} min read
          </div>
        </div>
        {currentUser === post.author_name && (
          <button
            onClick={() => onDelete(post.id)}
            style={{
              marginLeft: 'auto', background: 'none', border: '1px solid #ddd',
              color: '#999', padding: '5px 12px', borderRadius: 3, cursor: 'pointer',
              fontSize: 12, fontFamily: "'DM Sans', sans-serif",
              letterSpacing: '0.04em', transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#b94040';
              e.currentTarget.style.color = '#b94040';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#ddd';
              e.currentTarget.style.color = '#999';
            }}
          >
            Delete
          </button>
        )}
      </div>
    </article>
  );
}

// ── Regular Post Card ─────────────────────────────────────────────────────────
function PostCard({ post, index, currentUser, onDelete }) {
  const [hovered, setHovered] = useState(false);
  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'grid', gridTemplateColumns: '1fr auto',
        gap: 24, paddingBottom: 32, marginBottom: 32,
        borderBottom: '1px solid #e8e3da',
        animation: `fadeIn 0.5s ease ${index * 0.07}s both`,
        transition: 'opacity 0.2s',
        opacity: hovered ? 0.82 : 1,
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <Avatar name={post.author_name} size={24} />
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13, fontWeight: 600, color: '#444',
          }}>
            {post.author_name}
          </span>
          <span style={{ color: '#ccc' }}>&middot;</span>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888' }}>
            {formatDate(post.created)}
          </span>
        </div>
        <h2 style={{
          fontFamily: "'DM Serif Display', Georgia, serif",
          fontSize: 'clamp(18px, 2.5vw, 22px)', fontWeight: 400,
          lineHeight: 1.3, letterSpacing: '-0.01em', color: '#1a1a1a',
          margin: '0 0 8px',
        }}>
          {post.title}
        </h2>
        <p style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: 15,
          color: '#555', lineHeight: 1.65, margin: '0 0 12px',
        }}>
          {post.content.length > 140
            ? post.content.slice(0, 140) + '\u2026'
            : post.content}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 12,
            color: '#999', letterSpacing: '0.04em',
          }}>
            {getReadTime(post.content)} min read
          </span>
          {currentUser === post.author_name && (
            <button
              onClick={() => onDelete(post.id)}
              style={{
                background: 'none', border: 'none', color: '#bbb',
                cursor: 'pointer', fontSize: 12, padding: 0,
                fontFamily: "'DM Sans', sans-serif",
                letterSpacing: '0.04em', transition: 'color 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#b94040'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#bbb'; }}
            >
              Delete
            </button>
          )}
        </div>
      </div>
      <div style={{
        fontFamily: "'DM Serif Display', Georgia, serif",
        fontSize: 48, color: '#ede9e0', lineHeight: 1,
        userSelect: 'none', alignSelf: 'center', paddingLeft: 8,
      }}>
        {String(index + 1).padStart(2, '0')}
      </div>
    </article>
  );
}

// ── Auth Form ─────────────────────────────────────────────────────────────────
function AuthForm({ view, form, setForm, onSubmit, onSwitch }) {
  const [focused, setFocused] = useState(null);
  const isLogin = view === 'login';

  const inputStyle = field => ({
    width: '100%', padding: '14px 0', border: 'none',
    borderBottom: `2px solid ${focused === field ? '#1a1a1a' : '#ddd'}`,
    background: 'transparent', outline: 'none', boxSizing: 'border-box',
    fontFamily: "'DM Sans', sans-serif", fontSize: 16,
    color: '#1a1a1a', transition: 'border-color 0.2s',
    letterSpacing: '0.01em',
  });

  return (
    <div style={{
      maxWidth: 420, margin: '80px auto 0',
      padding: '0 24px', animation: 'fadeIn 0.4s ease',
    }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <h2 style={{
          fontFamily: "'DM Serif Display', Georgia, serif",
          fontSize: 36, fontWeight: 400, color: '#1a1a1a',
          margin: '0 0 12px', letterSpacing: '-0.02em',
        }}>
          {isLogin ? 'Welcome back.' : 'Start writing.'}
        </h2>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: '#888', margin: 0 }}>
          {isLogin ? 'Sign in to continue to DevBlog' : 'Create your free account'}
        </p>
      </div>

      <div style={{ marginBottom: 32 }}>
        <label style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600,
          letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888',
        }}>
          Username
        </label>
        <input
          style={inputStyle('username')}
          value={form.username}
          onFocus={() => setFocused('username')}
          onBlur={() => setFocused(null)}
          onChange={e => setForm({ ...form, username: e.target.value })}
          onKeyDown={e => e.key === 'Enter' && onSubmit()}
        />
      </div>
      <div style={{ marginBottom: 40 }}>
        <label style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600,
          letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888',
        }}>
          Password
        </label>
        <input
          type="password"
          style={inputStyle('password')}
          value={form.password}
          onFocus={() => setFocused('password')}
          onBlur={() => setFocused(null)}
          onChange={e => setForm({ ...form, password: e.target.value })}
          onKeyDown={e => e.key === 'Enter' && onSubmit()}
        />
      </div>

      <button
        onClick={onSubmit}
        style={{
          width: '100%', padding: '15px', background: '#1a1a1a',
          color: '#faf8f4', border: 'none', borderRadius: 3,
          fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
          fontSize: 14, letterSpacing: '0.08em', textTransform: 'uppercase',
          cursor: 'pointer', transition: 'background 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#333'; }}
        onMouseLeave={e => { e.currentTarget.style.background = '#1a1a1a'; }}
      >
        {isLogin ? 'Sign In' : 'Create Account'}
      </button>

      <p style={{
        textAlign: 'center', marginTop: 24,
        fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#888',
      }}>
        {isLogin ? "Don't have an account? " : 'Already a member? '}
        <button
          onClick={onSwitch}
          style={{
            background: 'none', border: 'none', color: '#1a1a1a',
            cursor: 'pointer', fontWeight: 700, fontSize: 14,
            fontFamily: "'DM Sans', sans-serif",
            textDecoration: 'underline', textDecorationColor: '#ccc', padding: 0,
          }}
        >
          {isLogin ? 'Sign up' : 'Sign in'}
        </button>
      </p>
    </div>
  );
}

// ── Editor ────────────────────────────────────────────────────────────────────
function Editor({ newPost, setNewPost, onPublish, onDiscard }) {
  const titleRef = useRef(null);
  const wordCount = newPost.content.trim().split(/\s+/).filter(Boolean).length;

  useEffect(() => { titleRef.current?.focus(); }, []);

  return (
    <div style={{
      maxWidth: 700, margin: '0 auto',
      padding: '0 24px', animation: 'fadeIn 0.4s ease',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingBottom: 20, marginBottom: 32, borderBottom: '1px solid #e8e3da',
      }}>
        <span style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13, color: '#aaa', letterSpacing: '0.04em',
        }}>
          {wordCount > 0
            ? `${wordCount} words \u00b7 ${getReadTime(newPost.content)} min read`
            : 'New Story'}
        </span>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={onDiscard}
            style={{
              background: 'none', border: 'none', color: '#999',
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              fontSize: 14, letterSpacing: '0.04em', padding: '8px 16px',
            }}
          >
            Discard
          </button>
          <button
            onClick={onPublish}
            style={{
              background: '#1a1a1a', color: '#faf8f4',
              border: 'none', borderRadius: 3,
              fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
              fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase',
              padding: '8px 20px', cursor: 'pointer', transition: 'background 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#333'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#1a1a1a'; }}
          >
            Publish
          </button>
        </div>
      </div>

      <input
        ref={titleRef}
        placeholder="Your title here\u2026"
        style={{
          width: '100%', border: 'none', outline: 'none',
          fontFamily: "'DM Serif Display', Georgia, serif",
          fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 400,
          lineHeight: 1.2, letterSpacing: '-0.02em', color: '#1a1a1a',
          background: 'transparent', marginBottom: 24, display: 'block',
          boxSizing: 'border-box',
        }}
        value={newPost.title}
        onChange={e => setNewPost({ ...newPost, title: e.target.value })}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <div style={{ width: 40, height: 1, background: '#1a1a1a' }} />
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#c8a96e' }} />
        <div style={{ flex: 1, height: 1, background: '#e8e3da' }} />
      </div>

      <textarea
        placeholder="Tell your story\u2026"
        style={{
          width: '100%', border: 'none', outline: 'none', resize: 'none',
          fontFamily: "'DM Sans', sans-serif", fontSize: 18,
          lineHeight: 1.85, color: '#2a2a2a', background: 'transparent',
          minHeight: 380, display: 'block', boxSizing: 'border-box',
          letterSpacing: '0.01em',
        }}
        value={newPost.content}
        onChange={e => setNewPost({ ...newPost, content: e.target.value })}
      />
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ posts, user, onSignup }) {
  const authorCounts = posts.reduce((acc, p) => {
    acc[p.author_name] = (acc[p.author_name] || 0) + 1;
    return acc;
  }, {});
  const uniqueAuthors = Object.keys(authorCounts).slice(0, 5);

  return (
    <aside>
      <div style={{
        borderTop: '3px solid #1a1a1a', paddingTop: 24,
        marginBottom: 40, animation: 'fadeIn 0.5s ease 0.2s both',
      }}>
        <h3 style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700,
          letterSpacing: '0.12em', textTransform: 'uppercase', color: '#888',
          margin: '0 0 20px',
        }}>
          Publication
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {[
            { label: 'Stories', value: posts.length },
            { label: 'Authors', value: uniqueAuthors.length },
            {
              label: 'Est. read',
              value: `${posts.reduce((a, p) => a + getReadTime(p.content), 0)}m`,
            },
            {
              label: 'Latest',
              value: posts[0]
                ? new Date(posts[0].created).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : '\u2014',
            },
          ].map(({ label, value }) => (
            <div key={label}>
              <div style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: 28, color: '#1a1a1a', lineHeight: 1,
              }}>
                {value}
              </div>
              <div style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 12,
                color: '#999', marginTop: 4, letterSpacing: '0.04em',
              }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        borderTop: '1px solid #e8e3da', paddingTop: 24,
        marginBottom: 40, animation: 'fadeIn 0.5s ease 0.3s both',
      }}>
        <h3 style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700,
          letterSpacing: '0.12em', textTransform: 'uppercase', color: '#888',
          margin: '0 0 20px',
        }}>
          Contributors
        </h3>
        {uniqueAuthors.map(name => (
          <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <Avatar name={name} size={32} />
            <div>
              <div style={{
                fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
                fontSize: 14, color: '#1a1a1a',
              }}>
                {name}
              </div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#aaa' }}>
                {authorCounts[name]} {authorCounts[name] === 1 ? 'story' : 'stories'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {!user && (
        <div style={{
          background: '#1a1a1a', padding: 28, borderRadius: 4,
          animation: 'fadeIn 0.5s ease 0.4s both',
        }}>
          <h3 style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: 22, color: '#faf8f4', margin: '0 0 10px',
            fontWeight: 400, lineHeight: 1.25,
          }}>
            Ready to share your story?
          </h3>
          <p style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 14,
            color: '#888', margin: '0 0 20px', lineHeight: 1.6,
          }}>
            Join our community of writers.
          </p>
          <button
            onClick={onSignup}
            style={{
              width: '100%', background: '#c8a96e', color: '#1a1a1a',
              border: 'none', borderRadius: 3, padding: '11px 0',
              fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
              fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase',
              cursor: 'pointer', transition: 'background 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#d4b87a'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#c8a96e'; }}
          >
            Start Writing
          </button>
        </div>
      )}
    </aside>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser]       = useState(null);
  const [posts, setPosts]     = useState([]);
  const [view, setView]       = useState('list');
  const [form, setForm]       = useState({ username: '', password: '' });
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(true);
  const [toast, setToast]     = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const showToast = (msg, type = 'info') => setToast({ msg, type });

  useEffect(() => {
    (async () => {
      try {
        const [meRes, postsRes] = await Promise.all([
          api('/auth/me/'),
          api('/posts/'),
        ]);
        const me = await meRes.json();
        const postsData = await postsRes.json();
        setUser(me.username || null);
        setPosts(Array.isArray(postsData) ? postsData : (postsData.results || []));
      } catch (err) {
        console.error('Startup fetch failed:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleAuth(endpoint) {
    const res  = await api('/auth/' + endpoint + '/', {
      method: 'POST',
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      setUser(data.username);
      setView('list');
      setForm({ username: '', password: '' });
      showToast(`Welcome, ${data.username}!`);
    } else {
      showToast(data.error || 'Something went wrong', 'error');
    }
  }

  async function handleLogout() {
    await api('/auth/logout/', {
      method: 'POST',
      headers: { 'X-CSRFToken': getCsrf() },
    });
    setUser(null);
    setView('list');
    setMenuOpen(false);
    showToast("You've been signed out.");
  }

  async function handleCreatePost() {
    if (!newPost.title.trim())   return showToast('Please add a title', 'error');
    if (!newPost.content.trim()) return showToast('Please write something', 'error');
    const res = await api('/posts/', {
      method: 'POST',
      headers: { 'X-CSRFToken': getCsrf() },
      body: JSON.stringify(newPost),
    });
    if (res.ok) {
      const post = await res.json();
      setPosts(prev => [post, ...prev]);
      setNewPost({ title: '', content: '' });
      setView('list');
      showToast('Your story is live!');
    } else {
      showToast('Failed to publish', 'error');
    }
  }

  async function handleDelete(id) {
    const res = await api(`/posts/${id}/`, {
      method: 'DELETE',
      headers: { 'X-CSRFToken': getCsrf() },
    });
    if (res.ok || res.status === 204) {
      setPosts(prev => prev.filter(p => p.id !== id));
      showToast('Post deleted.');
    } else {
      showToast('Could not delete post', 'error');
    }
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: '#faf8f4',
        fontFamily: "'DM Serif Display', Georgia, serif",
        fontSize: 28, color: '#ccc', letterSpacing: '-0.02em',
      }}>
        DevBlog
      </div>
    );
  }

  const isAuthView = view === 'login' || view === 'signup';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; background: #faf8f4; }
        ::selection { background: rgba(200,169,110,0.25); }
        input, textarea { caret-color: #c8a96e; }
        input::placeholder, textarea::placeholder { color: #bbb; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translate(-50%, 10px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #faf8f4; }
        ::-webkit-scrollbar-thumb { background: #ddd; border-radius: 3px; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#faf8f4' }}>

        {/* HEADER */}
        <header style={{ background: '#1a1a1a', position: 'sticky', top: 0, zIndex: 100 }}>
          {/* Top strip */}
          <div style={{ borderBottom: '1px solid #2e2e2e', padding: '8px 0' }}>
            <div style={{
              maxWidth: 1100, margin: '0 auto', padding: '0 32px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', gap: 24 }}>
                {['Essays', 'Technology', 'Culture', 'Opinion'].map(tag => (
                  <span key={tag} style={{
                    fontFamily: "'DM Sans', sans-serif", fontSize: 11,
                    color: '#666', letterSpacing: '0.08em', textTransform: 'uppercase',
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
              <span style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 11, color: '#555', letterSpacing: '0.04em',
              }}>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
                })}
              </span>
            </div>
          </div>

          {/* Main nav */}
          <div style={{
            maxWidth: 1100, margin: '0 auto', padding: '18px 32px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <button
              onClick={() => setView('list')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: 'clamp(22px, 3vw, 30px)', color: '#faf8f4',
                letterSpacing: '-0.03em', lineHeight: 1,
              }}
            >
              DevBlog
            </button>

            <div style={{ flex: 1, height: 1, background: '#2e2e2e', margin: '0 32px' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {user ? (
                <>
                  <button
                    onClick={() => setView('new')}
                    style={{
                      background: 'none', border: '1px solid #3e3e3e',
                      color: '#aaa', padding: '8px 18px', borderRadius: 3,
                      fontFamily: "'DM Sans', sans-serif", fontSize: 13,
                      letterSpacing: '0.06em', fontWeight: 600,
                      textTransform: 'uppercase', cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = '#c8a96e';
                      e.currentTarget.style.color = '#c8a96e';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = '#3e3e3e';
                      e.currentTarget.style.color = '#aaa';
                    }}
                  >
                    Write
                  </button>

                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => setMenuOpen(o => !o)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0',
                      }}
                    >
                      <Avatar name={user} size={32} />
                      <span style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 14, color: '#aaa', fontWeight: 500,
                      }}>
                        {user}
                      </span>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 4l4 4 4-4" stroke="#666" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </button>

                    {menuOpen && (
                      <div style={{
                        position: 'absolute', top: 'calc(100% + 12px)', right: 0,
                        background: '#fff', border: '1px solid #e8e3da',
                        borderRadius: 4, overflow: 'hidden', minWidth: 160,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                        animation: 'slideDown 0.2s ease', zIndex: 200,
                      }}>
                        <button
                          onClick={handleLogout}
                          style={{
                            width: '100%', padding: '12px 20px', background: 'none',
                            border: 'none', textAlign: 'left', cursor: 'pointer',
                            fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#444',
                            letterSpacing: '0.02em', transition: 'background 0.15s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#faf8f4'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = ''; }}
                        >
                          Sign out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { setView('login'); setMenuOpen(false); }}
                    style={{
                      background: 'none', border: 'none', color: '#999',
                      cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                      fontSize: 14, fontWeight: 500, letterSpacing: '0.02em',
                      padding: '8px 4px', transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#faf8f4'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#999'; }}
                  >
                    Sign in
                  </button>
                  <button
                    onClick={() => { setView('signup'); setMenuOpen(false); }}
                    style={{
                      background: '#c8a96e', color: '#1a1a1a',
                      border: 'none', borderRadius: 3, padding: '8px 20px',
                      fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
                      fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase',
                      cursor: 'pointer', transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#d4b87a'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#c8a96e'; }}
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        </header>

        {/* MAIN */}
        <main>
          {isAuthView && (
            <AuthForm
              view={view}
              form={form}
              setForm={setForm}
              onSubmit={() => handleAuth(view)}
              onSwitch={() => setView(view === 'login' ? 'signup' : 'login')}
            />
          )}

          {view === 'new' && (
            <div style={{ padding: '48px 0 80px' }}>
              <Editor
                newPost={newPost}
                setNewPost={setNewPost}
                onPublish={handleCreatePost}
                onDiscard={() => { setView('list'); setNewPost({ title: '', content: '' }); }}
              />
            </div>
          )}

          {view === 'list' && (
            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px' }}>
              {/* Masthead */}
              <div style={{
                borderBottom: '3px double #1a1a1a',
                padding: '40px 0 24px', marginBottom: 48,
                textAlign: 'center', animation: 'fadeIn 0.5s ease',
              }}>
                <div style={{
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  fontSize: 'clamp(42px, 8vw, 80px)', fontWeight: 400,
                  letterSpacing: '-0.04em', lineHeight: 0.95,
                  color: '#1a1a1a', marginBottom: 16,
                }}>
                  DevBlog
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 16,
                }}>
                  <div style={{ height: 1, width: 60, background: '#1a1a1a' }} />
                  <span style={{
                    fontFamily: "'DM Sans', sans-serif", fontSize: 13,
                    color: '#888', letterSpacing: '0.14em', textTransform: 'uppercase',
                  }}>
                    Ideas worth reading
                  </span>
                  <div style={{ height: 1, width: 60, background: '#1a1a1a' }} />
                </div>
              </div>

              {posts.length === 0 ? (
                <div style={{
                  textAlign: 'center', padding: '80px 0 120px',
                  animation: 'fadeIn 0.5s ease',
                }}>
                  <div style={{
                    fontFamily: "'DM Serif Display', Georgia, serif",
                    fontSize: 22, color: '#ccc', marginBottom: 12, fontStyle: 'italic',
                  }}>
                    No stories yet.
                  </div>
                  <p style={{
                    fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: '#aaa',
                  }}>
                    {user ? (
                      <>
                        Be the first &mdash;{' '}
                        <button
                          onClick={() => setView('new')}
                          style={{
                            background: 'none', border: 'none', color: '#1a1a1a',
                            cursor: 'pointer', fontWeight: 700,
                            textDecoration: 'underline', textDecorationColor: '#ccc',
                            fontSize: 15, padding: 0, fontFamily: 'inherit',
                          }}
                        >
                          write a story
                        </button>.
                      </>
                    ) : (
                      'Sign up and be the first to write.'
                    )}
                  </p>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 340px',
                  gap: '0 64px',
                  alignItems: 'start',
                }}>
                  <div>
                    {posts.map((post, i) =>
                      i === 0 ? (
                        <FeaturedCard
                          key={post.id}
                          post={post}
                          currentUser={user}
                          onDelete={handleDelete}
                        />
                      ) : (
                        <PostCard
                          key={post.id}
                          post={post}
                          index={i}
                          currentUser={user}
                          onDelete={handleDelete}
                        />
                      )
                    )}
                  </div>
                  <Sidebar
                    posts={posts}
                    user={user}
                    onSignup={() => setView('signup')}
                  />
                </div>
              )}
            </div>
          )}
        </main>

        {/* FOOTER */}
        {view === 'list' && (
          <footer style={{
            borderTop: '1px solid #e8e3da', marginTop: 80, padding: '32px 0',
          }}>
            <div style={{
              maxWidth: 1100, margin: '0 auto', padding: '0 32px',
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
            }}>
              <span style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: 18, color: '#1a1a1a', letterSpacing: '-0.02em',
              }}>
                DevBlog
              </span>
              <span style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13, color: '#bbb', letterSpacing: '0.04em',
              }}>
                &copy; {new Date().getFullYear()} &middot; Built with Django &amp; React
              </span>
            </div>
          </footer>
        )}
      </div>

      {toast && (
        <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />
      )}

      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 99 }}
        />
      )}
    </>
  );
}