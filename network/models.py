from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass

class Post(models.Model):
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="post_owner")
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add =True)
    likes = models.IntegerField(default=0)
    dislikes = models.IntegerField(default=0)

    def serialize(self):
        return{
            "id": self.id,
            "user": {"name":self.user.username, "id":self.user.id },
            "content": self.content,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
            "likes": self.likes,
            "dislikes": self.dislikes,
        }

class Follower(models.Model):
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="follower_owner")
    follower = models.ForeignKey("User", on_delete=models.CASCADE)
# one class is enough to get follower and following.
# when you want the no. of following then search for that user in follower column.

class Likeness(models.Model):
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="liker")
    post = models.ForeignKey("Post", on_delete=models.CASCADE)
    like = models.BooleanField()