# Authentication in Composer

> #### Work in Progress
>
> This is still a work in progress and currently only supports authentication through Azure Bot Service Hosted (ABS-H).

### Prequisites

You must have a bot created in a Bot Service Azure subscription (i.e `Bot Service Testing (Scratch)`) and configured with the correct messaging endpoint (must be https).
If running locally, you can use `ngrok` to create a https tunnel.

### Configuring Composer for Authentication

The server and client are configured via environment variables. In production environments, the client must be built with the environment variable set.

##### Server

```bash
COMPOSER_AUTH_PROVIDER=abs-h
COMPOSER_AUTH_CLIENT_ID=<Microsoft App Id for Authenticating App> # provided by the ABS-H host machine
COMPOSER_AUTH_REDIRECT_URI=<a redirect uri to complete oauth2 authentication> # provided by the ABS-H host machine
COMPOSER_BOT_ID=<botId> # provided by the ABS-H host machine
COMPOSER_AUTH_JWKS_URL=<a public url that provides keys for verifying auth token> # provided by the ABS-H host machine
```

##### Client

```bash
COMPOSER_REQUIRE_AUTH=true
```

> To test locally, reach out to @a-b-r-o-w-n for help configuring your environment.
