# ssc server

[![Netlify Status](https://api.netlify.com/api/v1/badges/ae03a3bc-b5a6-4fb8-b9dc-d95cc4606ca1/deploy-status)](https://app.netlify.com/sites/ssc-server/deploys)

[https://ssc-server.netlify.app/](https://ssc-server.netlify.app/)

-----------------------------------------------

## what is this?

This is a server/social-network for hosting images. `ssc-server` because it is based on `ssb`, and c comes after b in the alphabet. `ssc` stands for nothing. 

This uses a 'federated' server model, which means that anyone can host a server that participates in the network. SSB was an experiment with database replication and with using a merkle-dag in a more general and replicable way. As such, some issues around p2p nerworking were never addressed. Like for example every peer in the network is a 'full' peer, or 'thick' style client. This means that every peer stores the full merkle-list for everyone that the peer is following. So when a new peer joins the network and follows some people, there is a long waiting time while the database downloads and indexes *all the messages* from peers that you follow. Also your client machine must have enough storage space for everything. And it is a direct one to one relationship of users:machine. There's no using the same account on your laptop and phone.

The ssc model makes that part better because it does assume *some trust* between you and a server. This means that your browser is once again a 'thin' client, just *browsing* a collection of data that the server stores (the server has a full merkle-log of data).

Because servers are *still useful* -- it's a peer that is always online. Now we are at a point where making an application is about deciding *how much* you want to depend on servers. On one end you have something like *instagram* where the server controls your posts and identity. Your instagram identity means nothing to a different server. At the other end you have a *fully p2p* network. This is maybe like bittorrent clients. It *relies* on a peer being online at the same time, if there is not a peer then you're out of luck.

This is the one place where trust is significantly different than `ssb`. Thinking about an evil server operator, if you know that clients request like 20 messages at a time, you could return a bogus message for message 1/20, then the following merkle list could still match up and it could be whatever I want since the browser doesn't have a full merkle-list. (The browser is able to independently verify the merkle-list on it's own, but starts with the earliest message that it knows about, not the absolute first message)

Messages here look like

```js
{
     previous: null,
     sequence: 1,
     author: '@IGrkmx/GjfzaOLNjTpdmmPWuTj5xeSv/2pCP+yUI8eo=.ed25519',
     timestamp: 1608054728047,
     hash: 'sha256',
     content: {
        type: 'post',
        text: 'woooo',
        mentions: ['my-hash']
    },
     signature: 'LJUQXvR6SZ9lQSlF1w1RFQi3GFIU4B/Cc1sP6kjxnMZn3YW8X7nj9/hlWiTF3cJbWkc9xHvApJ+9uRtHxicXAQ==.sig.ed25519'
}
```

The `mentions` array in the message is the hash of an image file. The `author` is the ID of a user, and user IDs are just a public key string prepended with `@`. The `previous` field is the hash of the immediately preceeding message (forming a merkle-list). `signature` is the signature of this message made from the user's private key, after the message has been stringified.

This is how blobs are incorporated into the ssb merkle-list -- they are referenced by a unique hash, and must be stored somewhere that is addressed by hash that the application knows about. SSB uses [multiblob](https://github.com/ssbc/multiblob).

I thought it would be easier to keep things 'serverless', so I've used something called [cloudinary](https://cloudinary.com/) as an image host. Images are saved using their hash as a name, so it's still functionally a content addressable store. Then the client uses the hash of the image to construct a `src` url for the image file, similar to what you would do on ssb, where an image would be hosted on `localhost`.

One of the cool things about ssb is that it uses a database that was more-or-less custom written for the application -- [flume db](https://github.com/flumedb/flumedb). Again in the interest of doing things 'serverlessly', I've used [fauna db](https://fauna.com/).

That's another questionable decision I've made. I think it would be cooler if this used a *local* DB, then the local DB synchronized with the server DB. That's a drawback of my setup -- there is no offline first, or use without internet. I did make [another version](https://nichoth.com/projects/dev-diary-ssc-flume/) of the DB behind this, using flume & muxrpc. That could be worthwhile if you were wanting to do more with the DB side of things.

A setup like that -- local first -- means that you are almost certain to encounter merge conflicts if you are using multiple machines. So that makes this more an exercise in CRDT or merge resolution. Which is also interesting, but it seems like it could be it's own task, meaning we could make a working version of this app, and then add local-first as a feature later. As it is the server just rejects forks in a merkle list. This means if you are using a node that is older than the latest one the server knows about, the server will just reject your update request.

That's a workng idea that I have upheld throughout this -- just make something that works before making something as cool as possible. And that's still where I am with this -- just trying to make something that works. It's comparable to ssb actually -- many usability issues were just put on the back burner as it was an experiment with DB replication & p2p networking. And a little community of users grew around it nonetheless.

So, how does a server know who to accept `posts` from? The server is like a 'pub' in traditional ssb, meaning that the server has it's own identity, and it keeps a list of people that it follows.

In order for a server to follow you, you must be invited by someone who is already followed by the server. There are several ways to do the invitations. 

The simplest is to just have a passward that is hashed (so it is secret) then saved to a text file in the repo. When the server gets a request to redeem an invitation, it checks if the request contains the right password. The drawback of this is that regular users cannot invite others. Only the server owner would be able to create a password in a file in the repo.

You could create a record in the database with a hashed password. Then you would be able to record additional information like who invited who. This is necessary if you want to enable users to invite other users, vs just people the server operator chooses to invite.

Users with a valid password then get saved to a list of allowed people. (You save the person's DID, which would need to be in the request).

If the server has its own identity (an identity is a keypair) then it could create a UCAN for the invited user, but that means you need to store a private key for the server, whereas you don't need to if you are using the password method.

### how it's made

I used [preact](https://preactjs.com/) (a small react-like library) and [htm](https://github.com/developit/htm) as a view layer. A nice thing about `htm` is that it obviates the need for `babel`, but still allows you to use an `html`-like syntax.

Another key element is that it depends on Netlify's lambda functions. These are in the folder [netlify/functions](https://github.com/nichoth/ssc-server/tree/main/netlify/functions). 

Also we are using [faunaDB](https://fauna.com/) to store messages.

-------------------------------------------------


## start a local server
```
npm start
```

## run one test

The `post` test:
```
NODE_ENV=test node test/post/ | tap-spec
```

## run all tests

```
$ npm test
```

## configure things

### Add passwords that can be used to make the server follow you
Edit `/netlify/functions/passwords.json`. The value in this file should be a
password that has been hashed with `bcrypt`. See `/hash.js` for a node CLI that
will hash a string.

### block a user ID from posting
Edit `/netlify/functions/block.json`. This is a JSON array of public keys
(IDs) that the server should block.

Being on the block list means you can't do anything on this server.

------------------------------------------

## util

Create some keys and print them to stdout
```
$ ./util.js keys

{
  "curve": "ed25519",
  "public": "B7gtQEIH7jTlroscM0WJflfdvwYww72ThqMtoz0B57c=.ed25519",
  "private": "OpwS91tI7yXkilysrjGgnyGHm//AaxjsNnVVDYJuaAIHuC1AQgfuNOWuixwzRYl+V92/BjDDvZOGoy2jPQHntw==.ed25519",
  "id": "@B7gtQEIH7jTlroscM0WJflfdvwYww72ThqMtoz0B57c=.ed25519"
}
```

I'm using those keys in the `test/invitation/` file to test blocked users
incidentally.

------------------------------------------------

## add invitation passwords
You need to edit `/netlify/functions/passwords.json`, and add the hashed version of a password; the plaintext version is kept secret. You can use the script `/hash.js` to hash a password --

```
$ ./hash.js myPassword
$2b$10$G8uSW1rs3JZS2YGjJLRbeekjmPwCWf0dQ6L37rFjCEIIKNvVyF97u
```

or

```
$ echo "myPassword" | ./hash.js | pbcopy
```

----------------------------

The invite passwords are used with the `/follow-me` endpoint. You send a POST request like `{ user: userId, password }`. After doing that the server will save your posts to a DB.

---------------------------------

## invitations
It's like a country club -- you need to be invited by a member.

### create an invitation
Call `/.netlify/functions/create-invitation`. Send a message like this:

```js
body: JSON.stringify({
    publicKey: keys.public,
    msg: ssc.createMsg(keys, null, {
        type: 'invitation',
        from: keys.id
    })
})
```
The server will check it's DB to make sure that the given id is being followed
by the server.

Get back:
```js
{ code: '123' }
```

Then the person you are inviting needs to send a message like this:
```js
var redeemer = ssc.createKeys()
var signature = ssc.sign(redeemer, code)

body: JSON.stringify({
    publicKey: redeemer.public,
    code: code,
    signature: signature
})
```

Visit this URL to send such a message: `/invitation?code=abc`

### foafs
When the app starts, you call `/.netlify/get-relevant-posts` with a
query parameter of `foafs=true`

```js
var foafs = ev.queryStringParameters.foafs
if (foafs) {
  // return posts with foafs
}
```


----------------------------------------------------------------


## start a local server, with test data
```
$ npm run start-test
```

This creates some functions on `window`

`window.testStuff` -- will create a second user and some test data

* `window.userOneKeys`
* `window.userTwoKeys`


## cypress tests
Run tests with the cypress GUI

```
$ npm run cypress-test
```

## test
Start some tests in a node environment

```
$ npm test
```

--------------------------------------------------------------


The plan for now is just to make something that works for basic crud and stuff


----------------------------------------------------------------

There are no invite codes because we want to follow anyone/everyone. 

Another way to do it is to treat the server as a peer, & decide who they are following.

On the server, could keep a list of who you are following. That lets you revoke access also.

An invite system + REST would mean that we verify that a write request is from our list of allowed users before writing it to the DB.

Then replication requests would happen periodically since this is not using websockets.

----------------------------------------------------------------

## forks

What happens if you fork your feed? This server doesn not allow you to fork your feed. I could imagine implementing something like [forkdb](https://github.com/substack/forkdb), where there could be multiple 'heads' of a feed that you would then need to 'merge' into one. But for now the server will just reject any write with the wrong 'previous' message in the merkle-list. 

-------------------------------------

## the log
Just nonsense below vvvvvvvvvvvvv here vvvvvvvvvvv

---------------------------------------------------------

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


-----------------------------------------------------------

## cloudinary

### upload from the browser

if you wish to upload files with a direct call to the API from within your own custom code you can send an HTTPS POST request to the following Cloudinary URL:

https://api.cloudinary.com/v1_1/<cloud name>/<resource_type>/upload

Where:

`cloud name` is the name of your Cloudinary account.
`resource_type` is the type of file to upload. Valid values: `image`, `raw`, `video`, and `auto` to automatically detect the file type.
For example, to upload an image file to the Cloudinary 'demo' account, send an HTTPS POST request to the following URL:

```
https://api.cloudinary.com/v1_1/demo/image/upload
```

-----------------------------------------------------------------

https://cloudinary.com/documentation/node_image_and_video_upload#server_side_upload

> The file to upload can be specified as a local path, a remote HTTP or HTTPS URL, a whitelisted storage bucket (S3 or Google Storage) URL, a base64 data URI, or an FTP URL. 

**not a blob apparently**

Maybe you should upload to cloudinary first, from the browser, then save a msg to fauna/our-server. There would be no way of knowing if the save to fauna failed, but maybe that's ok. Meaning there could be lingering images in cloudinary if the save to fauna fails after the image upload completes.

It's worth noting that if you do the image upload server-side, it is still not an atomic transaction; it could still fail after the image upload is complete.

* [md5-hex](https://github.com/sindresorhus/md5-hex)
* [hasha](https://github.com/sindresorhus/hasha)
