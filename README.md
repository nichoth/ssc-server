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
GET locahost:8888/.netlify/functions/feed/123456
```








