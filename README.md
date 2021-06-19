# ssc server

[![Netlify Status](https://api.netlify.com/api/v1/badges/ae03a3bc-b5a6-4fb8-b9dc-d95cc4606ca1/deploy-status)](https://app.netlify.com/sites/ssc-server/deploys)

[https://ssc-server.netlify.app/](https://ssc-server.netlify.app/)

Trying this

## start a local server

```
npm start
```

## start a local server, with test data

This creates a function `window.testStuff` that will create a second user and some test data.

```
npm run start-test
```

----------------------------------------

## forks

What happens if you fork your feed? This server doesn not allow you to fork your feed. I could imagine implementing something lik [forkdb](https://github.com/substack/forkdb), where there could be multiple 'heads' of a feed that you would then need to 'merge' into one. But for now the server will just reject any write with the wrong 'previous' message in the merkle-list. 

-------------------------------------

## the log

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



-----------------------------------------------------

## Using faunadb & localStorage for the secrets

* [User authentication](https://docs.fauna.com/fauna/current/tutorials/authentication/user.html)

```
Create(
  Collection("users"),
  {
    credentials: { password: "secret password" },
    data: {
      email: "alice@site.example",
    },
  }
)
```

[Login](https://docs.fauna.com/fauna/current/api/fql/functions/login?lang=javascript)

> When a user wants to login, they would provide their email address and password. Then we use the Login function to authenticate their access


------------------------------------------------------------------


[Credentials](https://docs.fauna.com/fauna/current/security/credentials.html)

> A credential document can be created directly, like any other document in Fauna, or indirectly via a document’s credentials field.

> The `password` within the credentials field value is never stored.

----------

> once a credential document has been created, the Identify function can be used to verify the hashed password in the credential document


[Create a credential document by adding the credentials field to a document](https://docs.fauna.com/fauna/current/security/credentials.html#operations)


[Where to store the password](https://docs.fauna.com/fauna/current/tutorials/basics/authentication.html?lang=javascript#password_store)

> The way to tell Fauna that an entity (such as a user document) "has a password" is by adding a credentials object to the metadata of a document.

So the `credentials` object in the document is special


So here we would need a `credentials` object with a password, then if you get the password right you are able to read a document with the secret key in it


> the credentials object is not part of the document’s data and it’s never returned when accessing the document.

> All the encryption and verification of passwords is solved for you when using Fauna’s authentication system.

-------------------


[Your first custom role](https://docs.fauna.com/fauna/current/tutorials/basics/authentication.html?lang=javascript#custom_role)

> We need to create a role to give them access to collections, indexes, etc.

> The SpaceUsers collection is now a member of the User role. Any token associated with a document from that collection inherits the role’s privileges

---------

https://docs.fauna.com/fauna/current/security/credentials.html#operations

> The `password` within the `credentials` field value is never stored.

-----------

https://docs.fauna.com/fauna/current/tutorials/authentication/abac?lang=javascript


-------------------------------------------------------------

https://docs.fauna.com/fauna/current/security/abac

I think the `privileges.resource` below takes a query that could return a single document. And you would want the `membership` to just be a single person, the ID holder.

```
CreateRole({
  name: "access_todos",
  membership: [{ resource: Collection("users") }],
  privileges: [{
    resource: Collection("todos"),
    actions: {
      create: true,
      delete: true,
      write: true
    }
  }]
})
```

`predicate` example
```
CreateRole({
  name: "can_manage_todos",
  membership: [
    {
      resource: Collection("users"),
      predicate: Query(Lambda(ref =>
        Select(["data", "vip"], Get(ref))
      ))
    }
  ],
  privileges: [
    {
      resource: Collection("todos"),
      actions: {
        create: Query(Lambda(newData =>
          Select(["data", "vip"], Get(Identity()))
        )),
        // ...
      }
    }
  ]
})
```

[https://docs.fauna.com/fauna/current/security/roles](https://docs.fauna.com/fauna/current/security/roles)


complete example
```
CreateRole({
  name: "users",
  membership: [
    {
      // This role will be assigned to all users
      // as long as they are active
      resource: Collection("users"),
      predicate: Query(ref =>
        Select(["data", "isActive"], Get(ref), false)
      )
    }
  ],
  privileges: [
    {
      resource: Collection("todos"),
      actions: {
        write:
          // The following function enforces that you can write to your
          // own data but, you can't change the owner of the data
          Query((oldData, newData) =>
            And(
              Equals(
                Identity(),
                Select(["data", "owner"], oldData)
              ),
              Equals(
                Select(["data", "owner"], oldData),
                Select(["data", "owner"], newData),
              )
            )
          )
      }
    }
  ]
})
```

------------------------------------------------

> The identity of an actor is determined by the token included in the query sent to Fauna. When the token is valid, and the token’s associated identity is listed in a role’s membership, the query’s operations are evaluated against the privileges defined by the role; if the required privileges are granted, the query is permitted to execute.



-------------------------------------------------

```
client.query(
  q.Login(
    q.Ref(q.Collection('characters'), '181388642114077184'),
    { password: 'abracadabra' },
  )
)
.then((ret) => console.log(ret))
.catch((err) => console.error('Error: %s', err))
```

=>
```
{
  ref: Ref(Tokens(), "268283157930836480"),
  ts: 1592113607250000,
  instance: Ref(Collection("characters"), "181388642114077184"),
  secret: 'fnEDuSIcV7ACAAO5IhwXkAIAMQbrsrZaHs1cUWnligxyD5kUAPE'
}
```


-------------------------------------------------


https://docs.fauna.com/fauna/current/tutorials/authentication/user?lang=javascript

> When a user wants to login, they would provide their email address and password. Then we use the Login function to authenticate their access, and if valid, provide them with a token that they can use to access resources.


> The token provided for a successful login is all that is required to perform authenticated queries;

> Your app should use the value in the secret field to create another client instance, which should be used to perform queries as that user.

> If your application is using HTTP requests to interact with Fauna, you can use the token as a username+password via the Basic-Auth header, for every query made by that specific user.



Is the pw ok?

```
Login(
  Match(Index("users_by_email"), "alice@site.example"),
  { password: "secret password" },
)
```

yes? then send back the secrets



-----------------------------------------------


Create a collection `secrets` with an index/field `login-name`

Be sure to use a field `credentials` when you create things in the `secrets` collection
```
Create(
  Collection("secrets"),
  {
    credentials: { password: "secret password" },
    data: {
      loginName: 'alice',
      email: "alice@site.example",
      secrets: { a: 'a', b: 'b' }
    },
  }
)
```

Then when someone logs in

```
Login(
  Match(Index("login-name"), "alice"),
  { password: "secret password" },
)
```

```
=> {
  ref: Ref(Ref("tokens"), "299424734057071112"),
  ts: 1621812528630000,
  instance: Ref(Collection("secrets"), "299424683622662664"),
  secret: "fnEEJ8U1jnACCAPrTEeO4AYITP3bXyUgfJIWARTyzJ9HANnSdY8"
}
```

The token is the `secret`

We just need to check that the login call returns alright (no error), then can serve the document referenced by `secrets/login-name`


----------------------------------------------------------------

## 5-24-2021

The id server is working.

Need a way to create new id's


--------------------------------------------------------------

## 5-29-2020

Need to make a 'key' index for the posts

--------------------------------------------------

## 5-31-2020

https://github.com/auditdrivencrypto/private-box

https://github.com/ssb-js/ssb-keys#boxcontent-recipients--boxed

https://github.com/ssbc/ssb-db/search?p=2&q=private


----------------------------------------------------

## 6-5-2021

Working on avatars

[Does fauna supports Upserts?](https://forums.fauna.com/t/does-fauna-supports-upserts/208)

Now need to fetch an avatar when the app loads


