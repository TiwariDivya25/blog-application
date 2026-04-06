from django.db import models
from django.contrib.auth.models import User # Import the User model- it is used to link posts to their authors

class Post(models.Model):
    title = models.CharField(max_length=200)  # Title of the post
    content = models.TextField()  # Content of the post
    author = models.ForeignKey(User, on_delete=models.CASCADE)  # Link to the User
    created = models.DateTimeField(auto_now_add=True)  # Timestamp for when the post was created

    def __str__(self):
        return self.title  # Return the title when the post is printed