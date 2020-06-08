## Changelog

#### 1.0.4
- [fix] [`isAuthorized` should behave same as in Ruby](https://www.pivotaltracker.com/story/show/170028385)
  * [changes](https://github.com/infopark-customers/bima-serverless/commit/675483adb9734ed94b49af20633d7c563a081a15) might be rolled back with doorkeeper permission cleanup

#### 1.0.3
- more detailed authentication error logs

#### 1.0.2
- [new] updated `bima-shark-sdk` package

#### 1.0.1
- [story] [`isAuthorized` respects parent resources](https://www.pivotaltracker.com/story/show/169675983)

#### 1.0.0
- [new] created `authorize` function
- [new] add before actions with `SharkOnLambda.buildHandler`
- [new] add `RequestHandlerBuilder` for ease-of-use
- [new] pre-build before action `authenticate`

#### 0.2.1
- [fix] `ApiResponse.body` is a buffer and not a string
- [new] log responses

#### 0.1.0
- use `SLS_SERVICE`, `SLS_STAGE` and `HB_API_KEY` in environment
