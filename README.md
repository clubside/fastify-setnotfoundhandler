# fastify-setnotfoundhandler

This is a simple repo to show a bug in [Fastify](https://fastify.dev/)'s `setNotFoundHandler` when using [fastify-secure-session](https://github.com/fastify/fastify-secure-session).

## Steps to reproduce

- Clone repo.
- `npm i`
- `npm start`
- Open this `URL`: [http://localhost:3600/](http://localhost:3600/)
- Click "Login" and use default credentials. You will be taken to a profile page with the "Login" button replace with an avatar. You can now navigate the few sample pages.
- Now change the `URL` page to any random word like [http://localhost:3600/test](http://localhost:3600/test) and you will get a 404 page but instead of the avatar to indicate you're logged in you get the "Login" button.

## Example Console Error

```js
{
  debug: 'buildPageInfo',
  session: undefined,
  error: TypeError: Cannot read properties of undefined (reading 'user')
      at buildPageInfo (V:\dev\fastify-setnotfoundhandler\generator.js:119:47)
      at exports.returnNotFound (V:\dev\fastify-setnotfoundhandler\generator.js:140:11)
      at Object.<anonymous> (V:\dev\fastify-setnotfoundhandler\index.js:37:3)
      at preHandlerCallback (V:\dev\fastify-setnotfoundhandler\node_modules\fastify\lib\handleRequest.js:138:37)
      at next (V:\dev\fastify-setnotfoundhandler\node_modules\fastify\lib\hooks.js:233:9)
      at handleResolve (V:\dev\fastify-setnotfoundhandler\node_modules\fastify\lib\hooks.js:250:7)
}
```
