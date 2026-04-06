from rest_framework import serializers
from .models import Post

class PostSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(
        source='author.username', read_only=True
    )

    class Meta:
        model = Post
        fields = ['id', 'title', 'content', 'author_name', 'created']
        read_only_fields = ['author_name', 'created']
