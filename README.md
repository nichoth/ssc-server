# ssc server

[![Netlify Status](https://api.netlify.com/api/v1/badges/ae03a3bc-b5a6-4fb8-b9dc-d95cc4606ca1/deploy-status)](https://app.netlify.com/sites/ssc-server/deploys)

Trying this

## start a local server

```
npm start
```

----------------------------------------


## use `netlify-cli` to create a demo function, 'test'

```
netlify functions:create test
```

Then you select 'fauna crud' from the templates.

## make a .env file

Make a `.env` file with a variable `FAUNADB_SERVER_SECRET`. Also put this
variable in netlify via their GUI.

## try a function call

Use 'postman' to test the `POST` method call, creating a new document.


-----------------------------------

## test-post-one

note: you need the `author` index to exist in the DB


## getting a feed

```
GET locahost:8888/.netlify/functions/feed
```

Call as a POST request with a body of
```js
{ author: 'publicKey' }
```


## saving images
Use cloudinary. They have a free forever section.

`ssc` includes a `hash` function already -- `ssc.hash(data)`

`mentions` in the message has the hash of an image, and
that hash should be in the cloudinary URL

Could be any host. The image URL is static except for the hash

### Can you hash things in a browser?
Yes. See @feross/buffer

What type is the `buffer` argument?

------------------------------------------------------------

https://cloudinary.com/documentation/javascript2_quick_start


[base64 info](https://blog.abelotech.com/posts/data-uri-scheme-image-nodejs-jade/)

https://cloudinary.com/blog/node_js_file_upload_to_a_local_server_or_to_the_cloud


-------------------------------------------------------------------------

## 5-10-2021

get a file from a form
https://github.com/nichoth/eventual-gram-ssb-old/blob/main/src/subscribe.js
```js
var file = ev.target.files[0]
```

[Using_files_from_web_applications](https://developer.mozilla.org/en-US/docs/Web/API/File/Using_files_from_web_applications)


https://developer.mozilla.org/en-US/docs/Web/API/File/Using_files_from_web_applications#handling_the_upload_process_for_a_file
```js
new FileUpload(imgs[i], imgs[i].file);
```

```js
const xhr = new XMLHttpRequest();
xhr.open("POST", "http://demos.hacks.mozilla.org/paul/demos/resources/webservices/devnull.php");
xhr.overrideMimeType('text/plain; charset=x-user-defined-binary');


const reader = new FileReader();
reader.onload = function(ev) {
    // send the file 
    xhr.send(ev.target.result);
};
reader.readAsBinaryString(file);
```

```js
const fd = new FormData();
function sendFile(file) {
    fd.append('myFile', file);
    xhr.send(fd);
}
```

----------------------------------------------------

## 5-13-2021

Cloudinary already slugifies the URL for pictures (duh). The do `encodeURIComponent`.

To get the URI for a pic, take the already slugified URI, then slugify it again

-----------------------------------------

https://cloudinary.com/documentation/node_image_manipulation#direct_url_building

~Should try using the cloudinary module in the client-side code too to create the URLs. Or could create URLs server-side and send in another array in the response body.~

Should put URL(s) into the response on the server


----------------------------------------------------------------

## 5-21-2021

### ssc server
Should do the one concrete use case, getting a 'repo' of images that i can use
in my website.

Things are already set up for that. Now I need a way to preserve the keys
between multiple browser sessions. Should look at `auth0` maybe. Or i could
just password protect the keys on my existing faunaDB. There are also all
those web3 decentralized id providers.


-----------------------------------------------------------------

Trying auth0

https://manage.auth0.com/dashboard/us/dev-pbbq06so/applications/ROBvIjx95pLWvLyZSVKv2ekPmJvMUVUb/quickstart



`authentication > social` section in auth0 to try the auth

https://manage.auth0.com/dashboard/us/dev-pbbq06so/connections/social/con_ymhlr4g5Us9nmhsZ/settings


In github, they need the `auth0` url for `Authroization callback URL` --

https://dev-pbbq06so.auth0.com/login/callback

then i had a whole bunch of stuff in the auth0 site:

```
https://ssc-server.netlify.app/login/callback,
https://ssc-server.netlify.app/,
http://localhost:8888,
https://dev-pbbq06so.auth0.com/login/callback,
https://dev-pbbq06so.us.auth0.com/login/callback
```


has a redirect loop though

-----------------------------------------

doing this https://auth0.com/docs/quickstart/spa/vanillajs/01-login

* fixed the redirect loop by putting the login code into a function on `window`


> When a user logs in, Auth0 returns three items:
> 
> access_token: to learn more, see the Access Token documentation
> id_token: to learn more, see the ID Token documentation
> expires_in: the number of seconds before the Access Token expires
> You can use these items in your application to set up and manage authentication.



```
https://ssc-server.netlify.app/login/callback?code=bystX-9OzlGIvrtM&state=M2phY0ZXTkRJY2tES3FaVEsxRGhhYzY5RDllYzRFclBsfkxmNjh0ampJYw%3D%3D
```


[ID Tokens](https://auth0.com/docs/tokens/id-tokens)

> ID tokens are used in token-based authentication to cache user profile information and provide it to a client application

> Once a user logs in, use the ID token to gather information such as name and email address, which you can then use to auto-generate and send a personalized welcome email.

> ID Tokens should never be used to obtain direct access to APIs or to make authorization decisions.


[Access Tokens](https://auth0.com/docs/tokens/access-tokens)

> Access tokens are used in token-based authentication to allow an application to access an API.

--------------------------------------------

> Every time a user is logged in you get access both to the access token and the ID token. The user's profile information is then extracted from the ID token. 

> Typically, the token is used to call your backend application and the profile information is used to display their name and profile picture


-----------------------------------------------------------------

did these

`auth0.getTokenSilently()` and `auth0.getUser()`

so that has some user info from gh like an avatar and email

* [x] step one

----------------------------------------------------

step two is [JavaScript: Calling an API](https://auth0.com/docs/quickstart/spa/vanillajs/02-calling-an-api)

> Read the [Backend/API quickstart](https://auth0.com/docs/quickstart/backend) documentation for instructions on how to protect your API.

----------------------------------------------

> Create an enndpoint. This endpoint will require a valid access token to be sent in the `Authorization` header 

>  install some NPM packages that will be used to validate incoming tokens to the server.










