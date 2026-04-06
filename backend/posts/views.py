from django.shortcuts import render
from rest_framework import viewsets, permissions
from .models import Post   
from .serializers import PostSerializer
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import ensure_csrf_cookie

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)  # Set the author to the current user when creating a post    

@api_view(['POST'])
@permission_classes([AllowAny])
def signup_view(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already exists."}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=username, password=password)
    user.save()
    return Response({"message": "User created successfully."}, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user) # session + cookie
        return Response({'username': user.username}, status=status.HTTP_200_OK)
    return Response({"error": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
def logout_view(request):
    logout(request)
    return Response({"message": "Logged out successfully."}, status=status.HTTP_200_OK)

@api_view(['GET'])
@ensure_csrf_cookie
def me_view(request):
    if request.user.is_authenticated:
        return Response({'username': request.user.username}, status=status.HTTP_200_OK)
    return Response({"error": "Not authenticated."}, status=status.HTTP_401_UNAUTHORIZED)