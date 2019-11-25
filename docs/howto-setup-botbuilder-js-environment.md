# Set up botbuilder-js environment using npm

After setting up botbuilder-js environment, you can create a bot with js version in Composer.

## Use npm to install published myget packages

1. `npm config set registry https://www.myget.org/F/botbuilder-js-future/npm/`

2. `npm install`

3. `npm config set registry https://registry.npmjs.org/`


## Publish packages to myget

1. open [myget](https://www.myget.org/)

2.  create a feed according to [document 1](https://docs.myget.org/docs/walkthrough/getting-started-with-npm) and [document 2](https://docs.myget.org/docs/reference/myget-npm-support)

3. set proxy of npmjs.org in feed's upstream sources to ON.

4. log in
```
npm login --registry=https://www.myget.org/F/your-feed-name/npm/
npm config set always-auth true 
```

5. run `npm publish`

## Install published packages

1. register the feed

if the feed is public:

```
// npm config set registry https://www.myget.org/F/your-feed-name/npm/
npm config set registry https://www.myget.org/F/botbuilder-js-future/npm/
```

if the feed is private:

```
npm login --registry=https://www.myget.org/F/your-feed-name/npm/
npm config set always-auth true 
```

2. run `npm install`

## References

- [Getting started with npm](https://docs.myget.org/docs/walkthrough/getting-started-with-npm)

- [Myget npm support](https://docs.myget.org/docs/reference/myget-npm-support)