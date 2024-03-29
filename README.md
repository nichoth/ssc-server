# ssc server

[![Netlify Status](https://api.netlify.com/api/v1/badges/ae03a3bc-b5a6-4fb8-b9dc-d95cc4606ca1/deploy-status)](https://app.netlify.com/sites/ssc-server/deploys)

* [Join the discord](https://discord.gg/SxWNsDMxT4)
* Read more about deployment here -- [nichoth.com/ssc](https://nichoth.com/ssc/)

----------------------------------------------

This is the frontend and also server-side code for ssc, a deployable netlify
website. This uses netlify lambda functions to call a faunaDB. As such, it is "serverless", and only requires lambda functions, not a dedicated server.

-----------------------------------------------

## what is this?

This is a server/social-network for hosting images. `ssc-server` because it is based on `ssb`, and c comes after b in the alphabet. `ssc` stands for nothing. 

This uses a 'federated' server model, which means that anyone can host a server that participates in the network. SSB was an experiment with database replication and with using a merkle-dag in a more general and replicable way. As such, some issues around p2p networking were never addressed.

Like for example every peer in the network is a 'full' peer, or 'thick' style client. This means that every peer stores the full merkle-list for everyone that the peer is following. So when a new peer joins the network and follows some people, there is a long waiting time while the database downloads and indexes *all the messages* from peers that you follow. Also your client machine must have enough storage space for everything. And it is a direct one to one relationship of users:machine. There's no using the same account on your laptop and phone.

The ssc model makes that part better. Your browser is once again a 'thin' client, just *browsing* a collection of data that the server stores (the server has a full merkle-log of data).

The good news is that you don't need to trust this server at all, because you are able to verify messages in the browser, because each message is signed by the author. A server just relays messages between different browsers.

Because servers are *still useful* -- it's a peer that is always online. We are at a point where making an application is about deciding *how much* you want to depend on servers. On one end you have something like *instagram* where the server controls your posts and identity. Your instagram identity means nothing to a different server. At the other end you have a *fully p2p* network. This is maybe like bittorrent clients. It *relies* on a peer being online at the same time, if there is not a peer then you're out of luck.

## messages
Messages here look like

```js
{
  previous: null,
  sequence: 1,
  author: 'did:key:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH',
  // author: '@IGrkmx/GjfzaOLNjTpdmmPWuTj5xeSv/2pCP+yUI8eo=.ed25519',
  timestamp: 1608054728047,
  hash: 'sha256',
  content: {
    type: 'post',
    text: 'woooo',
    mentions: ['&my-hash.sha256']
  },
  signature: 'LJUQXvR6SZ9lQSlF1w1RFQi3GFIU4B/Cc1sP6kjxnMZn3YW8X7nj9/hlWiTF3cJbWkc9xHvApJ+9uRtHxicXAQ==.sig.ed25519'
}
```

The `mentions` array in the message is the hash of an image file. The `author` is the ID of a user, and user IDs are [base64 encoded public keys](https://whitepaper.fission.codes/authorization/did-doc). Notice the original format of author IDs -- a base64 encoded public key string prepended with `@`. The `previous` field is the hash of the immediately preceeding message (forming a merkle-list). `signature` is the signature of this message made from the user's private key, after the message has been stringified.

This is how blobs are incorporated into the ssb merkle-list -- they are referenced by a unique hash, and must be stored somewhere that is addressed by hash that the application knows about. SSB uses [multiblob](https://github.com/ssbc/multiblob).

I thought it would be easier to keep things 'serverless', so I've used something called [cloudinary](https://cloudinary.com/) as an image host. Images are saved using their hash as a name, so it's still functionally a content addressable store. Then the client uses the hash of the image to construct a `src` url for the image file, similar to what you would do on ssb, where an image would be hosted on `localhost`.

## database
One of the cool things about ssb is that it uses a database that was more-or-less custom written for the application -- [flume db](https://github.com/flumedb/flumedb). Again in the interest of doing things 'serverlessly', I've used [fauna db](https://fauna.com/).

That's another questionable decision I've made. I think it would be cooler if this used a *local* DB, then the local DB synchronized with the server DB. That's a drawback of my setup -- there is no offline first, or use without internet. I did make [another version](https://nichoth.com/projects/dev-diary-ssc-flume/) of the DB behind this, using flume & muxrpc. That could be worthwhile if you were wanting to do more with the DB side of things.

A setup like that -- local first -- means that you are almost certain to encounter merge conflicts if you are using multiple machines. So that makes this more an exercise in CRDT or merge resolution. Which is also interesting, but it seems like it could be it's own task, meaning we could make a working version of this app, and then add local-first as a feature later. As it is the server just rejects forks in a merkle list. This means if you are using a node that is older than the latest one the server knows about, the server will just reject your update request.

That's a workng idea that I have upheld throughout this -- just make something that works before making something as cool as possible. And that's still where I am with this -- just trying to make something that works. It's comparable to ssb actually -- many usability issues were just put on the back burner as it was an experiment with DB replication & p2p networking. And a little community of users grew around it nonetheless.

So, how does a server know who to accept `posts` from? The server is like a 'pub' in traditional ssb, meaning that the server has it's own identity, and it keeps a list of people that it follows.

I like doing things country club style, meaning that in order for a server to follow you, you must be invited by someone who is already followed by the server.

For the initial version, only the server operator is able to invite new users. How this works is that the site admin (the DID listed in the config file) writes an 'invitation' document to the DB. This works because the server checks that the invitation is signed and valid from the admin. The invitation contains a unique code, and the new user must enter the code. Then the server writes the new user's DID to a DB, and it will save any posts from them in the future.

## how it's made

I used [preact](https://preactjs.com/) (a small react-like library) and [htm](https://github.com/developit/htm) as a view layer. A nice thing about `htm` is that it obviates the need for `babel`, but still allows you to use an `html`-like syntax.

Another key element is that it depends on Netlify's lambda functions. These are in the folder [netlify/functions](https://github.com/nichoth/ssc-server/tree/main/netlify/functions). 

Also we are using [faunaDB](https://fauna.com/) to store messages.

## admin users

There are special users that are defined in the `admins` field inside the JSON file `src/config.json`.

What happens if you delete the admin user from the `config.json` file?

You would be using a standard 'new' user with the app. It would prompt you to input an invitation. To have admin privilege, you must copy and paste the default DID for your machine into the `config.admins` array inside `src/config.json`.

-------------------------------------------------------------------------

## new users
What do you see when you visit the home page as a new user?

New users see the `/hello` page. It asks for an invitation code.

When a user enters an invitation code, the server will start following them,
which allows them to save posts here. And the new user will start by following
the person who invited them, and the inviter will follow the new user.


--------------------------------------------------------------------------


## ipfs
What to do about blobs?

Should hash them in a good way. Meaning no characters that are bad for URLs. see https://www.npmjs.com/package/urlsafe-base64

I think they use`'hex'` encoding in ssb -- see https://github.com/ssbc/multiblob/blob/master/index.js#L31

-----------------------------------------------
Or you could use IPFS — I assume that would return a good hash. You lose the `cloudinary` functions if you use a different (ipfs) host 🙁

----------------------------------------------

## note

Netlify *does* run the _deploy-succeeded_ function the first time you deploy. Meaning after you click the _deploy to netlify_ button.

This is a good way to create indexes and collections in the DB.

-----------------------------------------

* currently using the `test` DB in fauna

-------------------------------------------------

## dev instructions

### start a local server
```
npm start
```

### run one test
The `alternate` test:

```
NODE_ENV=test node test/alternate.js | npx tap-arc
```

### run all tests

```
$ npm test
```

------------------------------------------

## cloudinary API

* [upload API](https://cloudinary.com/documentation/node_asset_administration#upload_api)

* [upload API](https://cloudinary.com/documentation/image_upload_api_reference#upload)

* [assign a public ID](https://cloudinary.com/documentation/upload_images#public_id)

* [cloudinary browser API](https://cloudinary.com/documentation/javascript_integration#get_started_with_the_javascript_sdk)


------------------------------------------

## storage

* [storj](https://www.storj.io/)
* [cloudinary](https://cloudinary.com/)
* [web3.storage](https://web3.storage/)

-------------------------------------------------------

## misc notes

### node version in lambda functions

[netlify lambda node version](https://docs.netlify.com/functions/optional-configuration/?fn-language=js)

Set the env variable
```
AWS_LAMBDA_JS_RUNTIME="nodejs16.x"
```

------------------------------

dev server's public key
```
did:key:z82T5ZbpFp9b6nbTVJDTwU7CX8FU3tsiV4mXRkaarHsmXpzWGC4EgJNFLM4CDJrS8HRb3zTXQY1YdzuHo4rMCC9ke3tPT
```

--------------------------------


### PWA things

* [How to make PWAs installable](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Installable_PWAs)

* [Add to Home screen](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Add_to_home_screen)

needs the following things:
  - [a webmanifest](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Add_to_home_screen#manifest)
  - [a service worker](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
  - [link in html](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Add_to_home_screen#link_the_html_to_the_manifest)

### cloudinary + PWA

* see https://cloudinary.com/labs/cloudinary-serviceworker
* https://gist.github.com/ukmadlz/5d55ca5f6c0d4233e193caad47403fe4


---------------------------------------


### tests

The post tests get wonky because `relevant-posts` and `posts` both post
with the same profile, so the sequence/previous gets messed up

this is only relevant if you run the `test/index.js` file, since it creates
posts with the same admin key
