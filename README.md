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



