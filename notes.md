# the log

## 5-13-2022

*linking profiles*




I send a request to server1, that says "I'm requesting to link IDs. This is my DID"

On server1 I am logged in, and I click "link an ID"

On server1 I must enter the DID from server2, to do a search for it amongst the
pending link requests
  * it would be nice to have a search/autocomplete situation here

Once I enter the DID from server2, then the DID on server1 will create a UCAN
that says, "I am the same as person2"

The pending request from server2 could be a signed UCAN stating, "person2 is the same as person1"

So to link, each server needs a UCAN from each party. 
Each server needs to have *both UCANs* for it to view the link as valid.


UCAN from person1 to person2 alleging identity

UCAN from person2 to person1 alleging identity




----------------------------------------------------------------


What happens if I *only* link from server2???

Write a message to the DB on server2 that says, "I am the same as person1"???







from alice2's perspective

We can host an endpoint, like `/link-id` or something on alice2's primary server. Requests to that endpoint should have a UCAN from alice to alice2. 

Once we get that request, with a UCAN linking alice -> alice2, then we record the UCAN in our DB, and import the profile info.


this makes me think of an ID server. A network just for DIDs and UCANs




------------------------------------------------------------


## 5-10-2022

**Playwright always starts the tests with a new DID**

but, **cypress starts with the same DID every time**

*cypress DID:*
did:key:z82T5ZsScqa5WWLLN2cHwZgxV4kcmxVLxXro3XZTopxoE4i154mhNEmxcxX9cAgMfFL4MrSAkj2q3kHxQke6GeaWQe4j2



----------------------------------------------------------


* DID1 signs a UCAN that says it is the same as DID2
  - DID1 needs to know DID2 somehow.
      + Could use an input with the format `foo@server2.com`.
        server1 then calls server2 and gets the profile info
      + or could have an input that just takes a DID from server2.
        server1 would still need the address of server2 to get the assets for profile.
        So two inputs -- one for DID and one for address.
  - must record the DID and also the domain that it is from (as a `fact` in the UCAN)

* DID1 needs to fetch the avatar and username from server2

Can use the format `nichoth@server1.com`. The server *must return the first* user with that username. That way it wont break if additional users use the same name.



## 5-9-2022

**sharing an ID**
How to handle repeating the same ID across multiple servers?

**Need to use UCAN to sign a new DID for another domain**, because you can't share IDs across domains.

----------------------------------------

* Can do [cross tab communication](https://blog.bitsrc.io/4-ways-to-communicate-across-browser-tabs-in-realtime-e4f5f6cbedca)
* can use a query param on a link if opening the page via link
* can do WebRTC or WSS between machines
* QR code

-------------------------------

Could have a route like `/link-id?did=123abc`

Every domain has a "primary" DID. The primary must sign a UCAN linking a second DID to the first. If you sign that UCAN, the signing key is the *originating* ID

* signs a UCAN that means this other DID is me too.

* when you visit that link, the primary DID signs a doc meaning DID2 is equivalent

as an example,
server 2 creates a link like `hermes.com/link-id?myDID=123abc`

You need to visit the link to sign the UCAN client-side. the page at `hermes.com` gets loaded and it signs a UCAN delegating to server2's ID. `hermes.com` returns a new UCAN doc meaning that server2 is equivalent. And also saves the UCAN to the DB.

**Need to give that UCAN to server2 somehow.**

You could serve the UCANs from `hermes.com` somehow: `hermes.com/ucan?did=123abc`
`did` there is the DID for server2. (the DID that the UCAN is signed to)


How does that help us? We want to share the *profile* info across multiple domains.

* can record the originating domain per DID in a `fact` in the UCAN


Need to get the *root* UCAN

Could have a server-side route that records the UCAN and also transfers profile data to itself

server 2 has a UCAN that means 'this is proof that this DID is the same as this DID from server 1'. and it's signed by ID 1



---------------------------------------------------------------------



[the interactive demo](https://cloudinary.com/documentation/resizing_and_cropping#resizing_and_cropping_interactive_demo) -- kind of cool

[cloudingary browser API / chaining transformations](https://cloudinary.com/documentation/javascript_image_transformations#chaining_transformations)

[cloudinary resizing cropping](https://cloudinary.com/documentation/resizing_and_cropping)

[cloudinary 'fill' example](https://cloudinary.com/documentation/resizing_and_cropping#fill)

### JS 'fill' example
```js
new CloudinaryImage("docs/models.jpg").resize(fill().width(250).height(250));
```

### chaining transformations example
```js
import {Cloudinary} from "@cloudinary/url-gen";

// Import required actions.
import {fill} from "@cloudinary/url-gen/actions/resize";
import {source} from "@cloudinary/url-gen/actions/overlay";
import {byAngle} from "@cloudinary/url-gen/actions/rotate"
import {sepia} from "@cloudinary/url-gen/actions/effect";
import {byRadius} from "@cloudinary/url-gen/actions/roundCorners";

// Import required values.
import {text} from "@cloudinary/url-gen/qualifiers/source";
import {Position} from "@cloudinary/url-gen/qualifiers/position";
import {TextStyle} from "@cloudinary/url-gen/qualifiers/textStyle";
import {compass} from "@cloudinary/url-gen/qualifiers/gravity";


// Create and configure your Cloudinary instance.
const cld = new Cloudinary({
  cloud: {
    cloudName: 'demo'
  }
}); 

// Use the image with public ID, 'sample'.
const myImage = cld.image('sample');

// Transform the image.
myImage
  .resize(fill(150, 150))
  .roundCorners(byRadius(20))
  .effect(sepia())
  .overlay(   
    source(
      text('This is my picture', new TextStyle('arial',18))
      .textColor('white')      
    )
    .position(new Position().gravity(compass('north')).offsetY(20)))
  .rotate(byAngle(20))
  .format('png');

  // Return the delivery URL
  const myUrl = myImage.toURL();
```


### example bad URL
```
https://res.cloudinary.com/nichoth/image/upload/v1652065651/%255Bobject%2520Object%255D.jpg
```



The old admin DID
```js
{
    "admins": [
        {
            "did": "did:key:z82T5XeMUNk67GZtcQ2pYnc34ZyUnMrE1YC1bHQAveSZn7oHAz2xyouSRLYo5FYsi2LD9wGmMBQcobhT3JbKPDfhVF5D4"
        }
      ],
      "appName": "ssc-demo"
}

```




## 5-1-2022

Netlify *does* run the _deploy-succeeded_ function the first time you deploy.



```
May 1, 11:27:46 AM: 2022-05-01T18:27:46.966Z	undefined	INFO	aaaaaaaaaaaaaaaaaaa
May 1, 11:27:46 AM: 6d3e31e8 INFO   wooooooooooooooooooooo
May 1, 11:27:46 AM: 6d3e31e8 INFO   deploy success
May 1, 11:27:46 AM: 6d3e31e8 INFO   ev {
  rawUrl: 'https://graceful-wisp-359c55.netlify.app/.netlify/functions/deploy-succeeded',
  rawQuery: '',
  path: '/.netlify/functions/deploy-succeeded',
  httpMethod: 'POST',
  headers: {
    'content-length': '18621',
    'content-type': 'application/json',
    host: 'graceful-wisp-359c55.netlify.app',
    'x-country': 'US',
    'x-datadog-parent-id': '4231537931052800892',
    'x-datadog-sampling-priority': '1',
    'x-datadog-trace-id': '4311760837849700768',
    'x-forwarded-for': '3.143.196.177, 100.64.0.231',
    'x-forwarded-proto': 'https',
    'x-netlify-event': 'deploy_succeeded',
    'x-nf-client-connection-ip': '3.143.196.177',
    'x-nf-request-id': '01G20E1VFRG2D1KA7JP3XK7J4Q',
    'x-webhook-signature': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJuZXRsaWZ5Iiwic2hhMjU2IjoiNTZkMGFjMjEyNmRiZjY3M2FlM2ExNjU5YzA5YTcxZmNjODhhMDc5NmY0MTBkNjdjMTVjZTJjMzllOGMwYzliNCJ9.BIEUy68dIa1v4912SgYP1OKuj1rpWN4DGoEf_CXCR38'
  },
  multiValueHeaders: {
    'Content-Length': [ '18621' ],
    'Content-Type': [ 'application/json' ],
    'X-Country': [ 'US' ],
    'X-Datadog-Parent-Id': [ '4231537931052800892' ],
    'X-Datadog-Sampling-Priority': [ '1' ],
    'X-Datadog-Trace-Id': [ '4311760837849700768' ],
    'X-Forwarded-For': [ '3.143.196.177, 100.64.0.231' ],
    'X-Forwarded-Proto': [ 'https' ],
    'X-Netlify-Event': [ 'deploy_succeeded' ],
    'X-Nf-Client-Connection-Ip': [ '3.143.196.177' ],
    'X-Nf-Request-Id': [ '01G20E1VFRG2D1KA7JP3XK7J4Q' ],
    'X-Webhook-Signature': [
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJuZXRsaWZ5Iiwic2hhMjU2IjoiNTZkMGFjMjEyNmRiZjY3M2FlM2ExNjU5YzA5YTcxZmNjODhhMDc5NmY0MTBkNjdjMTVjZTJjMzllOGMwYzliNCJ9.BIEUy68dIa1v4912SgYP1OKuj1rpWN4DGoEf_CXCR38'
    ],
    host: [ 'graceful-wisp-359c55.netlify.app' ]
  },
  queryStringParameters: {},
  multiValueQueryStringParameters: {},
  body: `{"payload":{"id":"626ed0d19e49500009e61604","site_id":"52c67516-248d-49cd-8144-b55dd6909859","build_id":"626ed0d19e49500009e61602","state":"ready","name":"graceful-wisp-359c55","url":"http://graceful-wisp-359c55.netlify.app","ssl_url":"https://graceful-wisp-359c55.netlify.app","admin_url":"https://app.netlify.com/sites/graceful-wisp-359c55","deploy_url":"http://main--graceful-wisp-359c55.netlify.app","deploy_ssl_url":"https://main--graceful-wisp-359c55.netlify.app","created_at":"2022-05-01T18:26:25.827Z","updated_at":"2022-05-01T18:27:45.936Z","user_id":"56ca60b9d6865d0ac7000001","error_message":null,"required":[],"required_functions":[],"commit_ref":"5439163e121a40b209cf40745e3d2a4e83756394","review_id":null,"branch":"main","commit_url":"https://github.com/nichoth/foooo/commit/5439163e121a40b209cf40745e3d2a4e83756394","skipped":null,"locked":null,"log_access_attributes":{"type":"firebase","url":"https://netlify-builds7.firebaseio.com/builds/626ed0d19e49500009e61602/log","endpoint":"https://netlify-builds7.firebaseio.com","path":"/builds/626ed0d19e49500009e61602/log","token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ2IjowLCJpYXQiOjE2NTE0Mjk2NjYsImQiOnsidWlkIjoiIn19.GNIlrFS-iudEngs_0MlWCvnRH5fkNjbAN8lDZyuWl6w"},"title":"test","review_url":null,"published_at":"2022-05-01T18:27:45.815Z","context":"production","deploy_time":77,"available_functions":[{"n":"about-by-name","d":"6f6a68cec20dc971075a50e47ad0a7dc74c813316d1b2fc2099380fbae4ea58b","id":"9bd8ee75ecb369a0e7e7c417f1a3272b693b0d6c90d163ea291861ad4dd922eb","a":"554605863837","c":"2022-05-01T18:09:10.640Z","r":"nodejs14.x","s":6959577},{"n":"abouts","d":"16e1930f62fe44524a67125782547199b39815651678ecc619f7bc61ff55f694","id":"959a02261203b5f98ab329b0947881a7f3abdc5eb649b2cce22569a6dd8c5923","a":"727469385251","c":"2022-05-01T18:09:10.564Z","r":"nodejs14.x","s":6972861},{"n":"avatar","d":"088621837de55321f769da289185747d6c5de397cc743a7052619c7e40af3d32","id":"f5793012e396fd905641b61dc3e29cd71a8fd6ef2517b6ded79155e39c6bec9d","a":"985391956463","c":"2022-05-01T18:09:10.209Z","r":"nodejs14.x","s":2463439},{"n":"create-hash","d":"e45939e4bfa775439930e2e45800b62bd3850896fbf62229648669e6aec40e9d","id":"278cb1af97d37e9352b30ed5d031bc21792b2bf9889b16be4558d12e888c2b8b","a":"650953327525","c":"2022-05-01T18:09:09.994Z","r":"nodejs14.x","s":35882},{"n":"create-invitation","d":"d3d5bb4bf4707dda5fc4d6209aab6611613bb557af10bd1e5d50a5e1c5d02afe","id":"7c6f7633051bb8650f701e75fb323139eeab477f9bcf2e646f72e2aa37b87c35","a":"547386967757","c":"2022-05-01T18:09:10.390Z","r":"nodejs14.x","s":4985210},{"n":"deploy-succeeded","d":"3568c19fde3b0441de2b871a376127d0d87b14ed599af3a4d7996a5d47d8c155","id":"0e2d369e205d9fdd681f68ad22466deffb56c1f1dbe74fc6f1fd5582b031e9ce","a":"256666722258","c":"2022-05-01T18:09:15.615Z","r":"nodejs14.x","s":260},{"n":"feed","d":"20d8d472d718f7001a250a978f4c42a41ec0a9000f87bce79b164d815757a3a0","id":"bdec363c4a8bf7012678563cd3ffea24bf213881e10eae948f6469c8802b61c4","a":"776892189363","c":"2022-05-01T18:09:16.128Z","r":"nodejs14.x","s":2465961},{"n":"feed-by-name","d":"4fd852b7432cbb4d0134379b34061b91cc356a43089c718e90648305e7922a56","id":"a076fb5a2464d4985a9248fa8aaa46cb63cf69cb4587eaf6ca437bf4853efac9","a":"970120212037","c":"2022-05-01T18:09:16.635Z","r":"nodejs14.x","s":6960056},{"n":"follow-me","d":"576f882d02e8cd02569ce3addfdbb0a822bd78ef5f4db653205d94e6ccefe37d","id":"b9e8ed6c5527ed1715980e637383b37e34e9b628942aaeee192432e6c112603a","a":"364863647476","c":"2022-05-01T18:09:16.320Z","r":"nodejs14.x","s":1259187},{"n":"following","d":"daf54374a21e508f4f596ab0d087c60b4828ab81bc920d007ec26dc75aee2883","id":"550f57c9c95d3f2eefe6b49e0d8a511d30a594c565b7780ee99db5725fa23f7c","a":"089772552642","c":"2022-05-01T18:09:16.852Z","r":"nodejs14.x","s":6959987},{"n":"get-file-hash","d":"d0a1239c0a822de19886fe8817e803c0da44f7366e83590caaf9c870ab9f833a","id":"2a53be5919c5e724486d1d134fa8e884b5bebe37b30da5f847adbc4dc7270e50","a":"335368946494","c":"2022-05-01T18:09:21.220Z","r":"nodejs14.x","s":285},{"n":"get-relevant-posts","d":"13aa10c5637bad70df79d4f6b592e7d2cef1e5d52acf27bfad6e8d792fc87115","id":"b5acddc4a2b49216a3e036639e833fea6595f391472e58793837d7d219bfcb5a","a":"070800196974","c":"2022-05-01T18:09:22.274Z","r":"nodejs14.x","s":6960283},{"n":"id","d":"442e34d1a9aef05dc3a0c4c247878851c0c907d6fb84ae0de6441b2ff5aae96d","id":"5137a8a40509dc4f40f1cc8a0a8949e8738ad5a0c4989ccec7767cc77bad4c4f","a":"070800196974","c":"2022-05-01T18:09:22.123Z","r":"nodejs14.x","s":558309},{"n":"post-one-message","d":"01f99808f046a563520ddb3c3baa49dd57645eedd439a9c88eb82cbdfb450e72","id":"4276d3129819a32b50d85737e6c44d4426aec12298cc87805e03c4f905ebe096","a":"892891066531","c":"2022-05-01T18:09:22.841Z","r":"nodejs14.x","s":6930138},{"n":"profile","d":"7e46ee38a379ac4a5ce3c166f92ca55a1e831011c59ac88a94dc12350f65e8f1","id":"eef2bbec930ffbdc679dcc6afaec17294ac549fc392b8e2665b243d90f92e9c3","a":"770208316574","c":"2022-05-01T18:09:22.993Z","r":"nodejs14.x","s":6972583},{"n":"redeem-invitation","d":"925c6b0d3e70c944cf7b2e22747c5f09406885ee60b25e41542c0d19d8ad80ea","id":"d8a0dc0a6d0055ee06bc09e5663c84fc45e75069fd5923c10d0186eedbd2fdc4","a":"985391956463","c":"2022-05-01T18:09:27.306Z","r":"nodejs14.x","s":5683453},{"n":"server-following","d":"d3f86885831a3766dbb4daed49418f2bab72d051e96c1d40d962cca3cf74c664","id":"62396233ab978c274f99a92df513b13c4a0863ade483c4bcc4398c4ef4daead1","a":"673769985865","c":"2022-05-01T18:09:27.965Z","r":"nodejs14.x","s":558245},{"n":"set-name","d":"b4ac52aba30c203b067ca675f6b78e72dc5ed8416db41a1dd823d10ba3d745ab","id":"800ee89ecbf0cec682227bd72e8fca91c2aacff56443f21860350c107bb566ec","a":"547386967757","c":"2022-05-01T18:09:28.261Z","r":"nodejs14.x","s":4984760},{"n":"single-post","d":"575fa023f62154bae9b497834b5a2fa7cbcc88be6d8b71a3e03807db0c57601d","id":"50f78fe00e80ef5f013e44a09eb79493f55e9f28f01a40eb37a37559d4dc9183","a":"272797940975","c":"2022-05-01T18:09:28.731Z","r":"nodejs14.x","s":2465627},{"n":"test","d":"ed5f5960b4e2b993731e02083d9991154fee44bac54f7d0f7dd8f003986d9da6","id":"588e5362971fc3e0ba6dcc9194d67bf3d3ac2e8fdc751ff41516e7c61844b424","a":"697151303520","c":"2022-05-01T18:09:28.725Z","r":"nodejs14.x","s":561981},{"n":"unfollow","d":"41ec5bf4a379fb9817373682f55adfe177d9a787bb8680899a10a30d4d3885d3","id":"d57dc0c4eb6e1164210809cd2a622e0b499f1468cdf218d9dc6ce62cc29c40c3","a":"365020585580","c":"2022-05-01T18:09:33.582Z","r":"nodejs14.x","s":6972422},{"n":"upload","d":"0f75ca5587cb75cbd486735744f26e8099fb2aae62401a6105781816a20cebdd","id":"f497aac56517d9c320ac378cf2f3a9fb20e600bd636403f9826b1b35bab5b8e8","a":"375708248955","c":"2022-05-01T18:09:33.961Z","r":"nodejs14.x","s":1904202},{"n":"upload-image","d":"d962210deb012eb187a778bd8c85770cd90a48c037d93841180dd6a8e4f188a4","id":"a8f042ad979eb074d389d8f14bedd098e5b7d090f60662e37a2baee017c6286d","a":"085473816981","c":"2022-05-01T18:09:34.110Z","r":"nodejs14.x","s":1904393}],"screenshot_url":null,"site_capabilities":{"title":"Netlify Team Free","asset_acceleration":true,"form_processing":true,"cdn_propagation":"partial","domain_aliases":true,"secure_site":false,"prerendering":true,"proxying":true,"ssl":"custom","rate_cents":0,"yearly_rate_cents":0,"ipv6_domain":"cdn.makerloop.com","branch_deploy":true,"managed_dns":true,"geo_ip":true,"split_testing":true,"id":"nf_team_dev","cdn_tier":"reg","functions":{"invocations":{"included":125000,"unit":"requests","used":0},"runtime":{"included":360000,"unit":"seconds","used":0}}},"committer":"nichoth","skipped_log":null,"manual_deploy":false,"file_tracking_optimization":true,"plugin_state":"none","lighthouse_plugin_scores":null,"links":{"permalink":"https://626ed0d19e49500009e61604--graceful-wisp-359c55.netlify.app","alias":"https://graceful-wisp-359c55.netlify.app","branch":null},"framework":"unknown","entry_path":null,"views_count":null,"function_schedules":[],"public_repo":true,"pending_review_reason":null},"site":{"id":"52c67516-248d-49cd-8144-b55dd6909859","site_id":"52c67516-248d-49cd-8144-b55dd6909859","plan":"nf_team_dev","ssl_plan":null,"premium":false,"claimed":true,"name":"graceful-wisp-359c55","custom_domain":null,"domain_aliases":[],"password":null,"notification_email":null,"url":"http://graceful-wisp-359c55.netlify.app","admin_url":"https://app.netlify.com/sites/graceful-wisp-359c55","deploy_id":"626ed0d19e49500009e61604","build_id":"","deploy_url":"http://main--graceful-wisp-359c55.netlify.app","state":"current","screenshot_url":null,"created_at":"2022-05-01T18:06:24.010Z","updated_at":"2022-05-01T18:27:45.933Z","user_id":"56ca60b9d6865d0ac7000001","error_message":null,"ssl":false,"ssl_url":"https://graceful-wisp-359c55.netlify.app","force_ssl":null,"ssl_status":null,"max_domain_aliases":100,"build_settings":{"cmd":"npm run build","dir":"public","branch":"main","base":null,"env":{"FAUNA_DB_SECRET":"fuana-secret","CLOUDINARY_SECRET":"cloud-sec","PUBLIC_KEY":"pub-key","SECRET_KEY":"sec-key"},"allowed_branches":["main"],"skip_prs":false,"untrusted_flow":"review","private_logs":false,"functions_dir":"netlify/functions","stop_builds":false},"processing_settings":{"css":{"bundle":true,"minify":true},"js":{"bundle":true,"minify":true},"images":{"optimize":true},"html":{"pretty_urls":true},"skip":true,"ignore_html_forms":false},"prerender":null,"prerender_headers":null,"deploy_hook":"https://api.netlify.com/hooks/github","published_deploy":{"id":"626ed0d19e49500009e61604","site_id":"52c67516-248d-49cd-8144-b55dd6909859","build_id":"626ed0d19e49500009e61602","state":"ready","name":"graceful-wisp-359c55","url":"http://graceful-wisp-359c55.netlify.app","ssl_url":"https://graceful-wisp-359c55.netlify.app","admin_url":"https://app.netlify.com/sites/graceful-wisp-359c55","deploy_url":"http://main--graceful-wisp-359c55.netlify.app","deploy_ssl_url":"https://main--graceful-wisp-359c55.netlify.app","created_at":"2022-05-01T18:26:25.827Z","updated_at":"2022-05-01T18:27:45.936Z","user_id":"56ca60b9d6865d0ac7000001","error_message":null,"required":[],"required_functions":[],"commit_ref":"5439163e121a40b209cf40745e3d2a4e83756394","review_id":null,"branch":"main","commit_url":"https://github.com/nichoth/foooo/commit/5439163e121a40b209cf40745e3d2a4e83756394","skipped":null,"locked":null,"log_access_attributes":{"type":"firebase","url":"https://netlify-builds7.firebaseio.com/builds/626ed0d19e49500009e61602/log","endpoint":"https://netlify-builds7.firebaseio.com","path":"/builds/626ed0d19e49500009e61602/log","token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ2IjowLCJpYXQiOjE2NTE0Mjk2NjYsImQiOnsidWlkIjoiIn19.GNIlrFS-iudEngs_0MlWCvnRH5fkNjbAN8lDZyuWl6w"},"title":"test","review_url":null,"published_at":"2022-05-01T18:27:45.815Z","context":"production","deploy_time":77,"available_functions":[{"n":"about-by-name","d":"6f6a68cec20dc971075a50e47ad0a7dc74c813316d1b2fc2099380fbae4ea58b","id":"9bd8ee75ecb369a0e7e7c417f1a3272b693b0d6c90d163ea291861ad4dd922eb","a":"554605863837","c":"2022-05-01T18:09:10.640Z","r":"nodejs14.x","s":6959577},{"n":"abouts","d":"16e1930f62fe44524a67125782547199b39815651678ecc619f7bc61ff55f694","id":"959a02261203b5f98ab329b0947881a7f3abdc5eb649b2cce22569a6dd8c5923","a":"727469385251","c":"2022-05-01T18:09:10.564Z","r":"nodejs14.x","s":6972861},{"n":"avatar","d":"088621837de55321f769da289185747d6c5de397cc743a7052619c7e40af3d32","id":"f5793012e396fd905641b61dc3e29cd71a8fd6ef2517b6ded79155e39c6bec9d","a":"985391956463","c":"2022-05-01T18:09:10.209Z","r":"nodejs14.x","s":2463439},{"n":"create-hash","d":"e45939e4bfa775439930e2e45800b62bd3850896fbf62229648669e6aec40e9d","id":"278cb1af97d37e9352b30ed5d031bc21792b2bf9889b16be4558d12e888c2b8b","a":"650953327525","c":"2022-05-01T18:09:09.994Z","r":"nodejs14.x","s":35882},{"n":"create-invitation","d":"d3d5bb4bf4707dda5fc4d6209aab6611613bb557af10bd1e5d50a5e1c5d02afe","id":"7c6f7633051bb8650f701e75fb323139eeab477f9bcf2e646f72e2aa37b87c35","a":"547386967757","c":"2022-05-01T18:09:10.390Z","r":"nodejs14.x","s":4985210},{"n":"deploy-succeeded","d":"3568c19fde3b0441de2b871a376127d0d87b14ed599af3a4d7996a5d47d8c155","id":"0e2d369e205d9fdd681f68ad22466deffb56c1f1dbe74fc6f1fd5582b031e9ce","a":"256666722258","c":"2022-05-01T18:09:15.615Z","r":"nodejs14.x","s":260},{"n":"feed","d":"20d8d472d718f7001a250a978f4c42a41ec0a9000f87bce79b164d815757a3a0","id":"bdec363c4a8bf7012678563cd3ffea24bf213881e10eae948f6469c8802b61c4","a":"776892189363","c":"2022-05-01T18:09:16.128Z","r":"nodejs14.x","s":2465961},{"n":"feed-by-name","d":"4fd852b7432cbb4d0134379b34061b91cc356a43089c718e90648305e7922a56","id":"a076fb5a2464d4985a9248fa8aaa46cb63cf69cb4587eaf6ca437bf4853efac9","a":"970120212037","c":"2022-05-01T18:09:16.635Z","r":"nodejs14.x","s":6960056},{"n":"follow-me","d":"576f882d02e8cd02569ce3addfdbb0a822bd78ef5f4db653205d94e6ccefe37d","id":"b9e8ed6c5527ed1715980e637383b37e34e9b628942aaeee192432e6c112603a","a":"364863647476","c":"2022-05-01T18:09:16.320Z","r":"nodejs14.x","s":1259187},{"n":"following","d":"daf54374a21e508f4f596ab0d087c60b4828ab81bc920d007ec26dc75aee2883","id":"550f57c9c95d3f2eefe6b49e0d8a511d30a594c565b7780ee99db5725fa23f7c","a":"089772552642","c":"2022-05-01T18:09:16.852Z","r":"nodejs14.x","s":6959987},{"n":"get-file-hash","d":"d0a1239c0a822de19886fe8817e803c0da44f7366e83590caaf9c870ab9f833a","id":"2a53be5919c5e724486d1d134fa8e884b5bebe37b30da5f847adbc4dc7270e50","a":"335368946494","c":"2022-05-01T18:09:21.220Z","r":"nodejs14.x","s":285},{"n":"get-relevant-posts","d":"13aa10c5637bad70df79d4f6b592e7d2cef1e5d52acf27bfad6e8d792fc87115","id":"b5acddc4a2b49216a3e036639e833fea6595f391472e58793837d7d219bfcb5a","a":"070800196974","c":"2022-05-01T18:09:22.274Z","r":"nodejs14.x","s":6960283},{"n":"id","d":"442e34d1a9aef05dc3a0c4c247878851c0c907d6fb84ae0de6441b2ff5aae96d","id":"5137a8a40509dc4f40f1cc8a0a8949e8738ad5a0c4989ccec7767cc77bad4c4f","a":"070800196974","c":"2022-05-01T18:09:22.123Z","r":"nodejs14.x","s":558309},{"n":"post-one-message","d":"01f99808f046a563520ddb3c3baa49dd57645eedd439a9c88eb82cbdfb450e72","id":"4276d3129819a32b50d85737e6c44d4426aec12298cc87805e03c4f905ebe096","a":"892891066531","c":"2022-05-01T18:09:22.841Z","r":"nodejs14.x","s":6930138},{"n":"profile","d":"7e46ee38a379ac4a5ce3c166f92ca55a1e831011c59ac88a94dc12350f65e8f1","id":"eef2bbec930ffbdc679dcc6afaec17294ac549fc392b8e2665b243d90f92e9c3","a":"770208316574","c":"2022-05-01T18:09:22.993Z","r":"nodejs14.x","s":6972583},{"n":"redeem-invitation","d":"925c6b0d3e70c944cf7b2e22747c5f09406885ee60b25e41542c0d19d8ad80ea","id":"d8a0dc0a6d0055ee06bc09e5663c84fc45e75069fd5923c10d0186eedbd2fdc4","a":"985391956463","c":"2022-05-01T18:09:27.306Z","r":"nodejs14.x","s":5683453},{"n":"server-following","d":"d3f86885831a3766dbb4daed49418f2bab72d051e96c1d40d962cca3cf74c664","id":"62396233ab978c274f99a92df513b13c4a0863ade483c4bcc4398c4ef4daead1","a":"673769985865","c":"2022-05-01T18:09:27.965Z","r":"nodejs14.x","s":558245},{"n":"set-name","d":"b4ac52aba30c203b067ca675f6b78e72dc5ed8416db41a1dd823d10ba3d745ab","id":"800ee89ecbf0cec682227bd72e8fca91c2aacff56443f21860350c107bb566ec","a":"547386967757","c":"2022-05-01T18:09:28.261Z","r":"nodejs14.x","s":4984760},{"n":"single-post","d":"575fa023f62154bae9b497834b5a2fa7cbcc88be6d8b71a3e03807db0c57601d","id":"50f78fe00e80ef5f013e44a09eb79493f55e9f28f01a40eb37a37559d4dc9183","a":"272797940975","c":"2022-05-01T18:09:28.731Z","r":"nodejs14.x","s":2465627},{"n":"test","d":"ed5f5960b4e2b993731e02083d9991154fee44bac54f7d0f7dd8f003986d9da6","id":"588e5362971fc3e0ba6dcc9194d67bf3d3ac2e8fdc751ff41516e7c61844b424","a":"697151303520","c":"2022-05-01T18:09:28.725Z","r":"nodejs14.x","s":561981},{"n":"unfollow","d":"41ec5bf4a379fb9817373682f55adfe177d9a787bb8680899a10a30d4d3885d3","id":"d57dc0c4eb6e1164210809cd2a622e0b499f1468cdf218d9dc6ce62cc29c40c3","a":"365020585580","c":"2022-05-01T18:09:33.582Z","r":"nodejs14.x","s":6972422},{"n":"upload","d":"0f75ca5587cb75cbd486735744f26e8099fb2aae62401a6105781816a20cebdd","id":"f497aac56517d9c320ac378cf2f3a9fb20e600bd636403f9826b1b35bab5b8e8","a":"375708248955","c":"2022-05-01T18:09:33.961Z","r":"nodejs14.x","s":1904202},{"n":"upload-image","d":"d962210deb012eb187a778bd8c85770cd90a48c037d93841180dd6a8e4f188a4","id":"a8f042ad979eb074d389d8f14bedd098e5b7d090f60662e37a2baee017c6286d","a":"085473816981","c":"2022-05-01T18:09:34.110Z","r":"nodejs14.x","s":1904393}],"screenshot_url":null,"site_capabilities":{"title":"Netlify Team Free","asset_acceleration":true,"form_processing":true,"cdn_propagation":"partial","domain_aliases":true,"secure_site":false,"prerendering":true,"proxying":true,"ssl":"custom","rate_cents":0,"yearly_rate_cents":0,"ipv6_domain":"cdn.makerloop.com","branch_deploy":true,"managed_dns":true,"geo_ip":true,"split_testing":true,"id":"nf_team_dev","cdn_tier":"reg","functions":{"invocations":{"included":125000,"unit":"requests","used":0},"runtime":{"included":360000,"unit":"seconds","used":0}}},"committer":"nichoth","skipped_log":null,"manual_deploy":false,"file_tracking_optimization":true,"plugin_state":"none","lighthouse_plugin_scores":null,"links":{"permalink":"https://626ed0d19e49500009e61604--graceful-wisp-359c55.netlify.app","alias":"https://graceful-wisp-359c55.netlify.app","branch":null},"framework":"unknown","entry_path":null,"views_count":null,"function_schedules":[],"public_repo":true,"pending_review_reason":null},"managed_dns":true,"jwt_secret":null,"jwt_roles_path":"app_metadata.authorization.roles","account_slug":"nichoth","account_name":"nichoth's team","account_type":"Starter","capabilities":{"title":"Netlify Team Free","asset_acceleration":true,"form_processing":true,"cdn_propagation":"partial","domain_aliases":true,"secure_site":false,"prerendering":true,"proxying":true,"ssl":"custom","rate_cents":0,"yearly_rate_cents":0,"ipv6_domain":"cdn.makerloop.com","branch_deploy":true,"managed_dns":true,"geo_ip":true,"split_testing":true,"id":"nf_team_dev","cdn_tier":"reg","functions":{"invocations":{"included":125000,"unit":"requests","used":0},"runtime":{"included":360000,"unit":"seconds","used":0}}},"dns_zone_id":null,"identity_instance_id":null,"use_functions":true,"use_edge_handlers":null,"parent_user_id":null,"automatic_tls_provisioning":null,"disabled":null,"lifecycle_state":"active","id_domain":"52c67516-248d-49cd-8144-b55dd6909859.netlify.app","use_lm":null,"build_image":"focal","automatic_tls_provisioning_expired":false,"analytics_instance_id":null,"functions_region":null,"functions_config":{"site_created_at":"2022-05-01T18:06:24.010Z"},"plugins":[],"account_subdomain":null,"functions_env":{},"cdp_enabled":true,"authlify_token_id":null,"use_scheduled_functions":false,"build_timelimit":null,"default_domain":"graceful-wisp-359c55.netlify.app"}}`,
  isBase64Encoded: false
}
May 1, 11:27:46 AM: 6d3e31e8 INFO   ctx {
  callbackWaitsForEmptyEventLoop: [Getter/Setter],
  succeed: [Function (anonymous)],
  fail: [Function (anonymous)],
  done: [Function (anonymous)],
  functionVersion: '$LATEST',
  functionName: '0e2d369e205d9fdd681f68ad22466deffb56c1f1dbe74fc6f1fd5582b031e9ce',
  memoryLimitInMB: '1024',
  logGroupName: '/aws/lambda/0e2d369e205d9fdd681f68ad22466deffb56c1f1dbe74fc6f1fd5582b031e9ce',
  logStreamName: '2022/05/01/[$LATEST]d08b11ea33104c00bd8e8a42eeb9801d',
  clientContext: {
    custom: {
      netlify: 'eyJzaXRlX3VybCI6Imh0dHBzOi8vZ3JhY2VmdWwtd2lzcC0zNTljNTUubmV0bGlmeS5hcHAifQ=='
    }
  },
  identity: undefined,
  invokedFunctionArn: 'arn:aws:lambda:us-east-1:256666722258:function:0e2d369e205d9fdd681f68ad22466deffb56c1f1dbe74fc6f1fd5582b031e9ce',
  awsRequestId: '6d3e31e8-66c9-4167-8569-a80092745986',
  getRemainingTimeInMillis: [Function: getRemainingTimeInMillis]
}
May 1, 11:27:47 AM: 6d3e31e8 Duration: 29.71 ms	Memory Usage: 56 MB	Init Duration: 165.42 ms
```







## deploy to netlify button

### Pre-fill environment variables
https://docs.netlify.com/site-deploys/create-deploys/#pre-fill-environment-variables

```
https://app.netlify.com/start/deploy?repository=https://github.com/myworkspace/sweetkittentemplate#SECRET_TOKEN=specialuniquevalue&CUSTOM_LOGO=https://placekitten.com/100/100
```

> Passing environment variable values in the hash ensures that they’re processed on the client side only. You can can create custom Deploy to Netlify buttons for your users with tokens and other secure data, and they won’t appear in Netlify logs.

## boostrap example

[bootstrap example](https://github.com/netlify/netlify-faunadb-example/blob/master/scripts/bootstrap-fauna-database.js)










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
