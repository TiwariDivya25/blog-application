from rest_framework import DefaultRouter
from .views import PostViewSet
from django.contrib import admin
from django.urls import path, include
from django.contrib import admin
from django.urls import path, include
from posts.views import signup_view, login_view, logout_view, me_view

router = DefaultRouter()
router.register(r'posts', PostViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('posts.urls')),
    path('api-auth/', include('rest_framework.urls')),
    path('api/auth/signup/',  signup_view),
    path('api/auth/login/',   login_view),
    path('api/auth/logout/',  logout_view),
    path('api/auth/me/',      me_view),
]
# This auto-creates:
#   GET  /api/posts/      ← list all posts
#   POST /api/posts/      ← create a post
#   GET  /api/posts/1/    ← get one post
#   DELETE /api/posts/1/  ← delete a post