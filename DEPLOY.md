# Deployment Guide

This app deploys for free using:

- **Railway** — hosts the Django backend (free tier: 500 hrs/month)
- **Vercel** — hosts the React frontend (free tier: unlimited for personal projects)

Both connect directly to your GitHub repo and auto-deploy on every push.

---

## Step 1 — Prepare the Backend for Production

### 1.1 Install production dependencies

```bash
cd backend
pip install gunicorn whitenoise psycopg2-binary dj-database-url python-decouple
pip freeze > requirements.txt
```

### 1.2 Create a `Procfile` in the `backend/` folder

```
web: gunicorn backend.wsgi --log-file -
```

### 1.3 Update `backend/backend/settings.py`

Add these imports at the top:

```python
import os
from decouple import config
import dj_database_url
```

Then replace / add these settings:

```python
SECRET_KEY = config('SECRET_KEY')

DEBUG = config('DEBUG', default=False, cast=bool)

ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='').split(',')

# Database — uses DATABASE_URL env var on Railway, SQLite locally
DATABASES = {
    'default': dj_database_url.config(
        default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}"
    )
}

# Static files via whitenoise
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',   # ← add after SecurityMiddleware
    ...
]

STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# CORS — allow your Vercel frontend URL
CORS_ALLOWED_ORIGINS = config('CORS_ALLOWED_ORIGINS', default='http://localhost:5173').split(',')
CORS_ALLOW_CREDENTIALS = True

# Cookie security for cross-origin sessions
SESSION_COOKIE_SAMESITE = 'None'
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SAMESITE = 'None'
CSRF_COOKIE_SECURE = True
CSRF_TRUSTED_ORIGINS = config('CSRF_TRUSTED_ORIGINS', default='http://localhost:5173').split(',')
```

### 1.4 Add a `runtime.txt` in `backend/` (optional but recommended)

```
python-3.12.0
```

---

## Step 2 — Deploy the Backend on Railway

1. Go to [railway.app](https://railway.app) and sign in with GitHub.
2. Click **New Project → Deploy from GitHub repo** and select your repo.
3. Railway will detect the `Procfile`. Set the **Root Directory** to `backend`.
4. Click **Add Plugin → PostgreSQL** to provision a free database. Railway will automatically set `DATABASE_URL`.
5. Under **Variables**, add:

   | Key | Value |
   |-----|-------|
   | `SECRET_KEY` | any long random string |
   | `DEBUG` | `False` |
   | `ALLOWED_HOSTS` | your Railway domain, e.g. `myapp.up.railway.app` |
   | `CORS_ALLOWED_ORIGINS` | your Vercel URL (add this after Step 3) |
   | `CSRF_TRUSTED_ORIGINS` | your Vercel URL (add this after Step 3) |

6. Open the **Deploy** tab and run the migration command once:

   ```
   python manage.py migrate
   ```

   You can do this via Railway's **one-off command** feature in the dashboard.

7. Note your Railway backend URL (e.g. `https://myapp.up.railway.app`).

---

## Step 3 — Prepare the Frontend for Production

### 3.1 Update the API base URL in `frontend/src/App.jsx`

Replace the hardcoded localhost URL with an environment variable:

```js
// Before
const API = 'http://localhost:8000/api';

// After
const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
```

### 3.2 Create `frontend/.env.local` for local dev (don't commit this)

```
VITE_API_URL=http://localhost:8000/api
```

Add `.env.local` to `frontend/.gitignore` if it isn't already.

---

## Step 4 — Deploy the Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New Project** and import your repo.
3. Set the **Root Directory** to `frontend`.
4. Vercel auto-detects Vite. Leave the build settings as-is.
5. Under **Environment Variables**, add:

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://myapp.up.railway.app/api` |

6. Click **Deploy**. Vercel gives you a URL like `https://myapp.vercel.app`.

---

## Step 5 — Wire Them Together

Go back to your Railway backend environment variables and update:

| Key | Value |
|-----|-------|
| `CORS_ALLOWED_ORIGINS` | `https://myapp.vercel.app` |
| `CSRF_TRUSTED_ORIGINS` | `https://myapp.vercel.app` |

Redeploy the backend (Railway does this automatically when you save variables).

---

## Step 6 — Verify

1. Open your Vercel URL in a browser.
2. Sign up for an account — you should get a success response.
3. Log in, create a post, and confirm it appears in the feed.
4. Check the Django admin at `https://myapp.up.railway.app/admin` (create a superuser first via Railway's one-off command: `python manage.py createsuperuser`).

---

## Troubleshooting

**CORS errors in the browser console** — Double-check that `CORS_ALLOWED_ORIGINS` on Railway exactly matches your Vercel URL (no trailing slash).

**CSRF errors on POST requests** — Make sure `SESSION_COOKIE_SAMESITE = 'None'` and `SESSION_COOKIE_SECURE = True` are set. These are required for cross-origin cookies.

**Cookies not being sent** — The `credentials: 'include'` option in `App.jsx` is already set correctly. If it still fails, verify the browser isn't blocking third-party cookies (Safari does this by default — consider switching to token-based auth for production).

**Static files 404** — Run `python manage.py collectstatic` via Railway's one-off command after the first deploy.