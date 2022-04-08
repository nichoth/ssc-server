# ssc server

[![Netlify Status](https://api.netlify.com/api/v1/badges/ae03a3bc-b5a6-4fb8-b9dc-d95cc4606ca1/deploy-status)](https://app.netlify.com/sites/ssc-server/deploys)

[https://ssc-server.netlify.app/](https://ssc-server.netlify.app/)

-----------------------------------------------

This is the frontend and also server-side code for ssc. A deployable netlify
website. This uses netlify lambda functions to call a faunaDB. As such, it is "serverless", and only requires lambda functions, not a dedicated server.

-----------------------------------------------


[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/nichoth/ssc-server)


--------------------------------------------

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

