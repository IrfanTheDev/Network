var MYID; // to remember my id, who the current user is.
var counter = 0 ; // to remember the post count.

document.addEventListener('DOMContentLoaded', function() {
   // Use buttons to toggle between views
  document.querySelector('#newPost').addEventListener('click', compose_post);

  MYID = document.querySelector('#profile').dataset.id 

  document.querySelector('#profile').onclick = function(){ load_my_profile(MYID) };

  document.querySelector('#following-view').onclick = function(){ load_allpost("following", 0) };
  
  // To go to next or previous page if the buttons are available.
  document.querySelectorAll('.page-link').forEach( button => {
    button.onclick = function(){ 
          load_allpost("all", this.dataset.page);
    }
  });

  // By default, load all the post.
  load_allpost("all", 0);
});


function load_allpost(who , page){
  // Show All post  and hide other views
  document.querySelector('#allPost-view').style.display = 'block';
  document.querySelector('#newPost-view').style.display = 'none';
  document.querySelector('#follow-view').style.display = 'none';
  document.querySelector('#pagin-view').style.display = 'block';

  if (who == "all") {
    document.querySelector('#allPost-view').innerHTML = "<h1> All post </h1>"
  }else if (who == "following") {
    document.querySelector('#allPost-view').innerHTML = "<h1> All post </h1> <h5>from your Following users </h5>"
    document.querySelector('#pagin-view').style.display = 'none'; 
  }

  if (page == 1) { // means user has clicked on next button.
    const start = counter;
    const end = start + 9;
    counter = end + 1; 
    document.querySelector('#previous').style.display = 'block' ;
    console.log(`next counter = ${counter}`)
  } else if (page == -1) { //means user has  clicked on previous button.
    const start = counter;
    const end = start - 9;
    counter = end - 1; 
    document.querySelector('#next').style.display = 'block'
    console.log(`previous counter = ${counter}`);
  }
  
  console.log(`counter = ${counter}`)
  if( counter == 0 ){ //means you are viewing the very latest post, there's no more new post.
    document.querySelector('#previous').style.display = 'none' ;
  }

 
  fetch(`/allPost/${who}/?c=${counter}`)
  .then(response => response.json())
  .then(posts => { 
    posts.forEach(post => { 
    const element = document.createElement('div');
    
    element.innerHTML =`<button class="prof btn btn-outline-secondary" data-id="${post.user.id}" data-name="${post.user.name}"
                          > <!--${post.user.id}-->
                           <b>${post.user.name}</b>
                        </button>
                        Post_Id : ${post.id}
                         <div class="shadow-sm p-3 mb-5 bg-white rounded border border-light"> ${post.content} </div>
                          <span class="timestamp">${post.timestamp}</span>
                          <div id="likesview-${post.id}"></div>
                          <div id="button-${post.id}"></div>
                          <div id="comment-${post.id}"></div>`;
    
    if (post.id == 1) { // means you are viewing the very first post, so ther's is no more post left in the database to show.
      document.querySelector('#next').style.display = 'none'
    }

    all_likes(`${post.id}`)

    element.className = "post-view shadow p-3 mb-5 bg-white rounded"
    
    document.querySelector('#allPost-view').append(element);

    // Dataset name should always be in lowercase otherwise it did not recognise it.

    // To open any users profile page.
    document.querySelectorAll('.prof').forEach( button => {
    button.onclick = function(){ 
      if (MYID === this.dataset.id){
        load_my_profile(MYID, this.dataset.name);
      }else{
        load_profile(this.dataset.id, this.dataset.name);
      }
    }
    });

    }); 
  });

}

function compose_post() {

  // // Show compose view and other views too.
  document.querySelector('#allPost-view').style.display = 'block';
  document.querySelector('#newPost-view').style.display = 'block';
  document.querySelector('#content-body').focus();
  // Clear out composition fields
  document.querySelector('#content-body').value = '';
  

  document.querySelector('#newPost-form').onsubmit = function (){

    const BODY = document.querySelector('#content-body').value;
    let csrftoken = getCookie('csrftoken');

    fetch('/newPost', {
      method: 'POST',
      body: JSON.stringify({
        content: BODY, 
      }),
      headers: { "X-CSRFToken": csrftoken },
    })
    .then(response => response.json())
    .then(result => {
      console.log(result)
      
    });
    document.querySelector('#newPost-view').style.display = 'none'
    load_allpost("all", 0);
    return false;
  }
}



function load_profile(x, nme){

  document.querySelector('#allPost-view').style.display = 'block';
  document.querySelector('#newPost-view').style.display = 'none';
  document.querySelector('#follow-view').style.display = 'block';
  document.querySelector('#pagin-view').style.display = 'none';

  document.querySelector('#follow-view').innerHTML = `<h1>Profile Page of 
                                                          <!-- id:${x} name:-->
                                                           ${nme}</h1>`
  document.querySelector('#allPost-view').innerHTML = `<h5> All Post by ${x} </h5>`
  
  const elementF = document.createElement('div');
  elementF.className = "followers_view"
  document.querySelector('#follow-view').append(elementF)
  
  const elementForUf = document.createElement('div') 
  elementForUf.className = "followers_button_view" 
  document.querySelector('#follow-view').append(elementForUf)                                        
  
  get_follow(x);
  
  fetch(`/profile/${x}`)
  .then(response => response.json())
  .then(posts => {
    posts.forEach(post => {
      const element = document.createElement('div');
      element.innerHTML =`<b>${post.user.name}</b> : 
                    <div class="shadow-sm p-3 mb-5 bg-white rounded border border-light">${post.content} </div>
                          <span class="timestamp">${post.timestamp}</span>
                          <div id="likesview-${post.id}"></div>
                          <div id="button-${post.id}"></div>
                          <div id="comment-${post.id}"></div>` ;
      element.className = "post-view shadow p-3 mb-5 bg-white rounded"
      document.querySelector('#allPost-view').append(element);

      all_likes(`${post.id}`)
       
    }); 
  });
}

function fun_follow (userId){
  fetch(`/follow/${userId}`, {
    method: 'POST',
    body: JSON.stringify({
        user: userId
    }),
  })
  .then(response => response.json())
  .then(result => {
    console.log(result) 
  });
  get_follow(userId);
}

function fun_like (PostId){
  fetch(`/like/${PostId}`, {
    method: 'POST' })
  .then(response => response.json())
  .then(result => {
    console.log(result) 
  });
  all_likes(PostId);
}
function fun_dislike (postId){
  fetch(`/dislike/${postId}`, {
    method: 'POST' })
  .then(response => response.json())
  .then(result => {
    console.log(result) 
  });
  all_likes(postId);
}

function fun_unfollow (userId){
  fetch(`/unfollow/${userId}`, {
    method: 'POST',
    body: JSON.stringify({
        user: userId
    }),
  })
  .then(response => response.json())
  .then(result => {
    console.log(result) 
  });
  get_follow(userId);
}

function all_likes(i){
  fetch(`/alllike/${i}`)
  .then(response => response.json())
  .then(y => {
    const element = document.querySelector(`#likesview-${i}`);
    const elementforbutton = document.querySelector(`#button-${i}`);
    
    if (y.liked === 0){ //means user has not given any response yet.
      element.innerHTML = `Likes: ${y.no_of_likes} &nbsp; Dislikes: ${y.no_of_dislikes}`
                        // liked: ${y.liked}

      elementforbutton.innerHTML =`<button  class="btn btn-outline-danger" id="like${i}"> Like </button> 
                                    <button class="btn btn-outline-dark" id="dislike${i}"> disike</button>` //use some icon in place of buttons.

      document.querySelector(`#dislike${i}`).onclick = function(){ fun_dislike(i) }            
      document.querySelector(`#like${i}`).onclick = function(){ fun_like(i) }
    }
    else if (y.liked === 1){ //means user has liked the post already.
      element.innerHTML = `Likes: ${y.no_of_likes} &nbsp; Dislikes: ${y.no_of_dislikes}`
                          // liked: ${y.liked}
      
      elementforbutton.innerHTML =`<div class="alert alert-success" role="alert" style="width: 25%;">
                                    You have Liked this Post. </div>`
       // you can also put a liked icon here.
    }
    else if (y.liked === 2){ //means user has disliked the post already.
      element.innerHTML = `Likes: ${y.no_of_likes} &nbsp; Dislikes: ${y.no_of_dislikes}`
                           // liked: ${y.liked}
      
      elementforbutton.innerHTML =`<div class="alert alert-dark" role="alert" style="width: 25%;">
                                      You have Disliked this Post.</div>`
     //you can also put a disliked icon here.
    }
  
    
  });
}

function get_follow(x){

  fetch(`/follow/${x}`)
  .then(response => response.json())
  .then(y => {
    document.querySelector(".followers_view").innerHTML = `
                                                    <li>Followers: ${y.no_of_follower}</li>
                                                    <li>Following: ${y.no_of_following}</li>`
                                                    // followed: ${y.followed}

    if (y.followed === 0){ //means user has not follow this person yet
      document.querySelector(".followers_button_view").innerHTML = '<button class="btn btn-outline-success" id="follow"> Follow </button>'
      document.querySelector('#follow').onclick = function(){ fun_follow(x) }
    }
    else if (y.followed === 1){ // means user has already follow this person.
      document.querySelector(".followers_button_view").innerHTML = '<button class="btn btn-outline-danger" id="unfollow"> UnFollow </button>'
      document.querySelector('#unfollow').onclick = function(){ fun_unfollow(x) }
    }
  });
}



function load_my_profile(userId,nme){

  document.querySelector('#allPost-view').style.display = 'block';
  document.querySelector('#newPost-view').style.display = 'none';
  document.querySelector('#follow-view').style.display = 'block';
  document.querySelector('#pagin-view').style.display = 'none';

  document.querySelector('#follow-view').innerHTML = `<h1>Your Profile Page 
                                                           <!-- of id:${userId} Name :${nme}</h1> -->`
                                                             
  document.querySelector('#allPost-view').innerHTML = `<h5> My All Post.</h5> <!-- Id: ${userId} -->`
  
  const elementF = document.createElement('div');
  elementF.className = "followers_view"
  document.querySelector('#follow-view').append(elementF) 

  get_follow(userId);
 
  fetch(`/profile/${userId}`)
  .then(response => response.json())
  .then(posts => {
    posts.forEach(post => {
      const element = document.createElement('div');   
      element.innerHTML =`<b>${post.user.name}</b> : 
      <div class="shadow-sm p-3 mb-5 bg-white rounded border border-light"> ${post.content} </div>
                          <span class="timestamp">${post.timestamp}</span>
                          <button class="edit-btn btn btn-outline-info" data-edit="${post.id}">Edit</button>` ;

      element.className = "post-view shadow p-3 mb-5 bg-white rounded"    
      document.querySelector('#allPost-view').append(element);    

      document.querySelectorAll('.edit-btn').forEach( button => {
        button.onclick = function(){ 
          edit_post(this.dataset.edit, nme);
        }
      });
    }); 
  });
}

function edit_post (postId, nme){
  // console.log(postId)
  document.querySelector('#newPost-view').style.display = 'block';
  document.querySelector('#content-body').focus();
  

  fetch(`/allPost/toedit/?postid=${postId}`)
  .then(response => response.json())
  .then(posts => { 
    posts.forEach(post => { 
      // console.log(post);
      document.querySelector('#content-body').value = `${post.content}`;
      

      document.querySelector('#newPost-form').onsubmit = function (){
        const BODY = document.querySelector('#content-body').value;
        let csrftoken = getCookie('csrftoken');
    
        fetch('/editPost', {
          method: 'POST',
          body: JSON.stringify({
            content: BODY,
            postId: postId 
          }),
          headers: { "X-CSRFToken": csrftoken },
        })
        .then(response => response.json())
        .then(result => {
          console.log(result)
          
        });
        document.querySelector('#newPost-view').style.display = 'none'
        load_my_profile(MYID,nme);
        return false;
      }

    });
});
}



// The following function are copyied from 
// https://docs.djangoproject.com/en/dev/ref/csrf/#ajax
function getCookie(name) {
  var cookieValue = null;
  if (document.cookie && document.cookie !== '') {
      var cookies = document.cookie.split(';');
      for (var i = 0; i < cookies.length; i++) {
          var cookie = cookies[i].trim();
          // Does this cookie string begin with the name we want?
          if (cookie.substring(0, name.length + 1) === (name + '=')) {
              cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
              break;
          }
      }
  }
  return cookieValue;
}