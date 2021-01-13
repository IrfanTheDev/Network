
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    path("allPost/<str:who>/", views.All_post, name="allPost"),
    path("newPost", views.Compose_new_post, name="newPost"),
    path("editPost", views.Edit_old_post, name="editPost"),
    path("profile/<int:userId>", views.Profile, name="profile"),
    path("follow/<int:userId>", views.F_follow, name="follow"),
    path("unfollow/<int:userId>", views.F_unfollow, name="unfollow"),
    path("like/<int:postId>", views.F_like, name="like"),
    path("dislike/<int:postId>", views.F_dislike, name="dislike"),
    path("alllike/<int:postId>", views.All_likes, name="alllike"),
]
