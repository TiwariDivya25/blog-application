# DevBlog

A full-stack blogging platform built with **Django REST Framework** (backend) and **React + Vite** (frontend). Users can sign up, log in, create posts, and read posts from other users.

![DevBlog Screenshot](https://github.com/user-attachments/assets/551dd5c4-25a6-4015-acc8-7706b74a9a2a)

---

## Tech Stack

**Backend** — Django 6, Django REST Framework, SQLite (dev) / PostgreSQL (prod), session-based auth with CSRF protection

**Frontend** — React 19, Vite 8, plain CSS-in-JS (no UI library)

---

## Features

- User registration and login (session-based)
- Create and read blog posts
- Author attribution on each post
- Responsive layout

---

## Project Structure

```
.
├── backend/
│   ├── backend/          # Django project settings, URLs, WSGI/ASGI
│   └── posts/            # Posts app — models, serializers, views
└── frontend/
    ├── public/
    └── src/
        ├── App.jsx       # Main app component (all views)
        └── main.jsx      # React entry point
```

---

## Local Development

### Prerequisites

- Python 3.11+
- Node.js 20+

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install django djangorestframework django-cors-headers
python manage.py migrate
python manage.py runserver      # Runs on http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev                     # Runs on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## API Reference

| Method | Endpoint | Auth required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/posts/` | No | List all posts |
| POST | `/api/posts/` | Yes | Create a post |
| GET | `/api/posts/:id/` | No | Get a single post |
| DELETE | `/api/posts/:id/` | Yes (owner) | Delete a post |
| POST | `/api/auth/signup/` | No | Register a new user |
| POST | `/api/auth/login/` | No | Log in |
| POST | `/api/auth/logout/` | Yes | Log out |
| GET | `/api/auth/me/` | No | Get current user + set CSRF cookie |

---

## Deployment

See **[DEPLOY.md](./DEPLOY.md)** for step-by-step instructions to deploy for free using **Railway** (backend) and **Vercel** (frontend).