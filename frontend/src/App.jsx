import { useState, useEffect } from 'react';

const API = 'http://localhost:8000/api';

const api = (url, opts = {}) => {
  const defaultHeaders = { 'Content-Type': 'application/json' };
  return fetch(API + url, {
    credentials: 'include',
    ...opts,
    headers: { ...defaultHeaders, ...opts.headers },
  });
};

function getCsrf() {
  return document.cookie.split('; ')
    .find(r => r.startsWith('csrftoken='))
    ?.split('=')[1];
}

export default function App() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [view, setView] = useState('list');
  const [form, setForm] = useState({ username: '', password: '' });
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const [meRes, postsRes] = await Promise.all([
          api('/auth/me/'),
          api('/posts/'),
        ]);
        const me = await meRes.json();
        const postsData = await postsRes.json();
        setUser(me.username || null);
        setPosts(Array.isArray(postsData) ? postsData : postsData.results || []);
      } catch (err) {
        console.error('Startup fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitial();
  }, []);

  async function handleAuth(endpoint) {
    const res = await api('/auth/' + endpoint + '/', {
      method: 'POST',
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) { 
      setUser(data.username); 
      setView('list'); 
      setForm({ username: '', password: '' });
    } else alert(data.error || 'Auth failed');
  }

  async function handleLogout() {
    await api('/auth/logout/', { 
      method: 'POST',
      headers: { 'X-CSRFToken': getCsrf() } 
    });
    setUser(null);
    setView('list');
  }

  async function handleCreatePost() {
    const res = await api('/posts/', {
      method: 'POST',
      headers: { 'X-CSRFToken': getCsrf() },
      body: JSON.stringify(newPost),
    });
    if (res.ok) {
      const post = await res.json();
      setPosts([post, ...posts]);
      setNewPost({ title: '', content: '' });
      setView('list');
    } else alert('Failed to create post');
  }

  if (loading) return <div style={styles.loader}>Loading...</div>;

  return (
    <div style={styles.wrapper}>
      {/* HEADER SECTION */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.brand} onClick={() => setView('list')}>DevBlog</h1>
          
          <div style={styles.navControls}>
            {user ? (
              <div style={styles.userGroup}>
                <span style={styles.welcomeText}>Hello, <strong>{user}</strong></span>
                <button style={styles.primaryBtn} onClick={() => setView('new')}>Write Post</button>
                <button style={styles.secondaryBtn} onClick={handleLogout}>Logout</button>
              </div>
            ) : (
              <div style={styles.authGroup}>
                <button style={styles.textBtn} onClick={() => setView('login')}>Sign In</button>
                <button style={styles.primaryBtn} onClick={() => setView('signup')}>Get Started</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main style={styles.main}>
        {/* AUTH VIEWS */}
        {(view === 'login' || view === 'signup') && (
          <div style={styles.authCard}>
            <h2 style={styles.cardHeading}>{view === 'login' ? 'Welcome Back' : 'Join the Community'}</h2>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Username</label>
              <input style={styles.input} value={form.username}
                onChange={e => setForm({...form, username: e.target.value})} />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Password</label>
              <input type="password" style={styles.input} value={form.password}
                onChange={e => setForm({...form, password: e.target.value})} />
            </div>
            <button style={{...styles.primaryBtn, width: '100%', marginTop: '10px'}} onClick={() => handleAuth(view)}>
              {view === 'login' ? 'Login' : 'Create Account'}
            </button>
          </div>
        )}

        {/* EDITOR VIEW */}
        {view === 'new' && (
          <div style={styles.editorCard}>
            <h2 style={styles.cardHeading}>Create a New Story</h2>
            <input placeholder="Title" style={styles.titleInput} value={newPost.title}
              onChange={e => setNewPost({...newPost, title: e.target.value})} />
            <textarea placeholder="Tell your story..." style={styles.textArea} rows={12}
              onChange={e => setNewPost({...newPost, content: e.target.value})} />
            <div style={styles.editorActions}>
              <button style={styles.primaryBtn} onClick={handleCreatePost}>Publish Story</button>
              <button style={styles.textBtn} onClick={() => setView('list')}>Discard</button>
            </div>
          </div>
        )}

        {/* POST FEED */}
        {view === 'list' && (
          <div style={styles.feed}>
            {posts.length === 0 ? (
              <div style={styles.emptyState}>
                <p>No posts found. Start the conversation!</p>
              </div>
            ) : (
              posts.map(post => (
                <article key={post.id} style={styles.postItem}>
                  <div style={styles.postHeader}>
                    <span style={styles.postAuthor}>{post.author_name}</span>
                    <span style={styles.postDate}>{new Date(post.created).toLocaleDateString()}</span>
                  </div>
                  <h2 style={styles.postTitle}>{post.title}</h2>
                  <p style={styles.postBody}>{post.content}</p>
                </article>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  wrapper: { backgroundColor: '#fcfcfc', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' },
  header: { backgroundColor: '#ffffff', borderBottom: '1px solid #eee', position: 'sticky', top: 0, zIndex: 100 },
  headerContent: { maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px' },
  brand: { fontSize: '22px', fontWeight: '800', letterSpacing: '-0.5px', cursor: 'pointer', margin: 0, color: '#1a1a1a' },
  
  navControls: { display: 'flex', alignItems: 'center' },
  userGroup: { display: 'flex', alignItems: 'center', gap: '16px' },
  welcomeText: { fontSize: '14px', color: '#666' },
  authGroup: { display: 'flex', gap: '12px' },

  main: { maxWidth: '700px', margin: '40px auto', padding: '0 20px' },

  // Buttons
  primaryBtn: { backgroundColor: '#1a1a1a', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', transition: '0.2s' },
  secondaryBtn: { backgroundColor: '#fff', color: '#1a1a1a', border: '1px solid #ddd', padding: '10px 20px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' },
  textBtn: { backgroundColor: 'transparent', border: 'none', color: '#666', cursor: 'pointer', fontWeight: '500' },

  // Auth & Editor Cards
  authCard: { background: '#fff', border: '1px solid #eee', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' },
  editorCard: { background: '#fff', border: '1px solid #eee', padding: '32px', borderRadius: '12px' },
  cardHeading: { margin: '0 0 24px 0', fontSize: '24px', fontWeight: '700' },
  fieldGroup: { marginBottom: '20px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#444' },
  input: { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' },
  titleInput: { width: '100%', border: 'none', fontSize: '32px', fontWeight: '700', marginBottom: '20px', outline: 'none' },
  textArea: { width: '100%', border: 'none', fontSize: '18px', lineHeight: '1.6', outline: 'none', resize: 'none' },
  editorActions: { borderTop: '1px solid #eee', paddingTop: '20px', display: 'flex', gap: '15px' },

  // Feed & Posts
  feed: { display: 'flex', flexDirection: 'column', gap: '48px' },
  postItem: { borderBottom: '1px solid #f0f0f0', paddingBottom: '32px' },
  postHeader: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontSize: '13px' },
  postAuthor: { fontWeight: '700', color: '#1a1a1a' },
  postDate: { color: '#888' },
  postTitle: { fontSize: '24px', fontWeight: '800', margin: '0 0 10px 0', lineHeight: '1.3' },
  postBody: { fontSize: '16px', color: '#404040', lineHeight: '1.7', margin: 0 },
  
  emptyState: { textAlign: 'center', padding: '100px 0', color: '#999' },
  loader: { display: 'flex', justifyContent: 'center', padding: '100px', color: '#666' }
};