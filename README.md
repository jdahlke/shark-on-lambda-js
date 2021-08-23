# Shark on Lambda

Basic shared functionality for AWS Lambda + API-Gateway projects.
Only use in `node.js` applications.


### Installation

```
npm install bima-shark-on-lambda
```

### Configuration

Use environment variables in `process.env`.

Key | Description
---- | ----
`STAGE` | (`String`) The service environment; usually `integration`, `staging` or `production`.
`HONEYBADGER_API_KEY` | (`String`) The Honeybadger API key.
`DOORKEEPER_BASE_URL` | (`String`) The doorkeeper url for token validation; just protocol + host.
`HMAC_ACCESS_KEY` | (`String`) The HMAC access key.
`HMAC_SECRET_KEY` | (`String`) The HMAC secret key.


### Usage

```js
const {
  ApiResponse,
  RequestHandlerBuilder
  authenticate,
  buildHandler
} = require('bima-shark-on-lambda')

// IMPORTANT Only use named functions as in
//  function name () { ... }
// or
//  const name = () => { ... }
async function create (event, context, callback) {
  // your business logic
  return new ApiResponse(201, body)
}

async function customBeforeAction(event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false
  event.shark.foo = await yourOwnAsynchronousBusinessLogic()
}

//
// Option 1
//

const builder = new RequestHandlerBuilder()
builder.addHandlers({ create, show, update, delete })

builder.addBeforeAction(authenticate) // adds function for every handler

builder.addBeforeAction(authenticate, { only: ['create', 'update', 'delete'] })
builder.addBeforeAction(customBeforeActionA, { only: ['update', 'delete'] })
builder.addBeforeAction(customBeforeActionB, { except: ['create'] })

module.exports = builder.handlers()

//
// or Option 2
//

module.exports.create = buildHandler(create, { before: [authenticate, customBeforeAction, ...] })
```

Before actions will be executed in the same order they were added.

#### Authorization

```js
// handler.js
const { authorize } = require('bima-shark-on-lambda')

function show (event, context, callback) {
  const user = event.shark.user
  const id = event.pathParameters.id
  const resource = loadResourceFromWherever(id)

  authorize(user, userPolicy => {
   if (user.id === resource.ownerId) {
     return true
   }
   if (userPolicy.isAuthorized('foo::bar', ['admin', 'editor'])) {
     return true
   }
   return userPolicy.isAuthorized('baz', ['admin'])
  })
  return new ApiResponse(200, 'Resource body...')
}
```


### Test

```
npm test
```
