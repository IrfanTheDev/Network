from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
import json
from django.views.decorators.csrf import csrf_exempt

from .models import User, Post, Follower, Likeness


def index(request):
    # Authenticated users view the index
    if request.user.is_authenticated:
        return render(request, "network/index.html")

    # Everyone else is prompted to sign in
    else:
        return HttpResponseRedirect(reverse("login"))

    

@login_required
def All_post(request, who):

    # get all post
    if who == "all":
        total_no_of_post = Post.objects.all().count()

        # Pagination in your case is very difficult as you have send data as api and javascripting is parsing it.
        # so there is no way to do so, and either i didnot get any help from internet too.
        # So i make my own pagination system which work from javascript.
        counter = int(request.GET.get("c"))
        # Get start and end points.
        end =  total_no_of_post - counter 
        start =  end - 9 

        dataid = []
        for i in range (start, end+1):
            dataid.append(i)
        
        post = Post.objects.filter(id__in = dataid)
    
    # get only the post of the following.
    elif who == "following":
        qFollowing = Follower.objects.filter(follower = request.user).values_list('user')
        # print(qFollowing)
        post = Post.objects.filter(user__in = qFollowing)
    
    # Get only the post which one is to edit.
    elif who == "toedit":
        postid = request.GET.get('postid')
        post = Post.objects.filter(id = postid)

    # Return post in reverse chronologial order
    post = post.order_by("-timestamp").all()

    return JsonResponse([p.serialize() for p in post], safe=False)

@login_required
def All_likes(request,postId):
    no_of_likes = Likeness.objects.filter(post=postId, like=True).count()
    no_of_dislikes = Likeness.objects.filter(post=postId, like=False).count()

    response = Likeness.objects.filter(user=request.user, post=postId)
    if not response:
        liked = 0  # means user has not given any response yet.
    elif response.filter(like=True):
        liked = 1 # means user has liked the post.
    elif response.filter(like=False):
        liked = 2 # means user has disliked the post
        
        
    return JsonResponse({
            "no_of_likes": no_of_likes,
            "no_of_dislikes": no_of_dislikes,
            "liked": liked
            })
    

@login_required
def Compose_new_post(request):

    # Composing a new content must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
   
    # Get contents of post
    data = json.loads(request.body)   
    body = data.get("content", "")

    newpost = Post(
        user=request.user,
        content=body,
    )
    newpost.save()
    
    return JsonResponse({"message": "Post Added successfully."}, status=201)

@login_required
def Edit_old_post(request,): 
    # Editing content must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    # Get contents of post
    data = json.loads(request.body)
    body = data.get("content", "")
    postid = data.get("postId", "")

    oldPost = Post.objects.get(id = postid )
    oldPost.content =body  # this is how you update the database via django model.
    oldPost.save()
    
    return JsonResponse({"message": "Post Added successfully."}, status=201)

    

@login_required
def Profile(request, userId):
    post = Post.objects.filter(user=userId)
     # Return post in reverse chronologial order
    post = post.order_by("-timestamp").all()

    return JsonResponse([p.serialize() for p in post], safe=False)


@csrf_exempt
@login_required
def F_follow(request,userId):
    if request.method == "POST":
        data = json.loads(request.body)
        body = data.get("user", "")
        x = User.objects.get(id=body)

        post = Follower(
            user=x,
            follower=request.user
        )
        post.save()
        return JsonResponse({"message": "Follower Added successfully."}, status=201)
    else :
        no_of_follower = Follower.objects.filter(user= userId).count()
        no_of_following = Follower.objects.filter(follower= userId).count()

        x = User.objects.get(id=userId)

        folow = Follower.objects.filter(user = x, follower= request.user)

        if not folow :     # that's how you check if something is empty or not.
            followed = 0   # means follower has not followed the followee
        else:
            followed = 1   # means follower has already followed the followee.
        return JsonResponse({
            "no_of_follower": no_of_follower,
            "no_of_following": no_of_following,
            "followed": followed
            }, status=201)

@csrf_exempt
@login_required
def F_unfollow(request,userId):
    if request.method == "POST":
        x = User.objects.get(id=userId)
        folow = Follower.objects.filter(user = x, follower= request.user)
        folow.delete()
        return JsonResponse({"message": " Unfollowed successfully."}, status=201)

    elif request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

@csrf_exempt
@login_required
def F_like(request,postId):
    if request.method == "POST":
        p = Post.objects.get(id= postId)
        n = p.likes

        lk = Likeness(
            user =request.user,
            post= p,
            like = True
        )
        lk.save()
        p.likes = n+1 # update the post's like column too.
        p.save()
        
        return JsonResponse({"message": " Post liked successfully."}, status=201)

    elif request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

@csrf_exempt
@login_required
def F_dislike(request,postId):
    if request.method == "POST":
        p = Post.objects.get(id= postId)
        n = p.dislikes
    
        lk = Likeness(
            user=request.user,
            post= p,
            like = False
        )

        lk.save()
        p.dislikes = n+1   # update the post's dislike column too.
        p.save()
        
        return JsonResponse({"message": " Post disliked unfortunetly."}, status=201)

    elif request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)







def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
