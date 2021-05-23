// var jwt = require('jsonwebtoken');
// var jwks = require('jwks-rsa');

var config = require('../../../src/auth_config.json')
var { clientId } = config


const { NetlifyJwtVerifier } = require('@serverless-jwt/netlify');

const verifyJwt = NetlifyJwtVerifier({
    issuer: 'https://dev-pbbq06so.auth0.com',
    // audience: 'https://ssc-server.netlify.app'
    audience: clientId
});
  
const handler = async (event, context) => {
    // var { headers } = ev

    var { authorization } = headers
    // var token = authorization
    console.log('****auth', authorization)

    // The user information is available here
    const { claims } = context.identityContext;

    return {
        statusCode: 200,
        body: JSON.stringify({ profile: claims })
    };
};
  
exports.handler = verifyJwt(handler);









// exports.handler = async function (ev, ctx, cb) {

//     var { headers } = ev

//     var { authorization } = headers
//     var token = authorization
//     console.log('****auth', authorization)




//     var kid = 'RUUyQTZEQzYxRjg4MjM3QzJENzdGN0U4OTZGNzVCM0E0MjYyRjg1OQ'
//     // var kid = 'S-gKrpfQcAsYJSpiIbBzL'

//     const client = jwks({
//         cache: true, // Default Value
//         cacheMaxEntries: 5, // Default value
//         cacheMaxAge: 1,
//         // cacheMaxAge: 600000, // Defaults to 10m
//         jwksUri: 'https://dev-pbbq06so.auth0.com/.well-known/jwks.json',
//         // requestHeaders: {}, // Optional
//         // timeout: 30000 // Defaults to 30s
//     });

//     const key = await client.getSigningKey(kid);
//     const signingKey = key.getPublicKey();

//     console.log('***signingKey***', signingKey)

//     // var secret = jwks.expressJwtSecret({
//     //     cache: true,
//     //     rateLimit: true,
//     //     jwksRequestsPerMinute: 5,
//     //     jwksUri: 'https://dev-pbbq06so.auth0.com/.well-known/jwks.json'
//     // })

//     jwt.verify(token, signingKey, {}, (err, res) => {
//         if (err) return console.log('**verified errrr***', err, res)
//         console.log('****verified', err, res)
//     })
//     // jwt.verify(token, secretOrPublicKey, [options, callback])



    


//     return {
//         statusCode: 200,
//         body: JSON.stringify({ message: "Hello World" })
//     };

//     // try {
//     //     var { foo } = JSON.parse(ev.body)
//     // } catch (err) {
//     //     return cb(null, {
//     //         statusCode: 422,
//     //         body: JSON.stringify({
//     //             ok: false,
//     //             error: 'invalid json',
//     //             message: err.message
//     //         })
//     //     })
//     // }
// }
