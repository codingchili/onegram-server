# Onegram NodeJS Server
NodeJS / Express Server for the Onegram image sharing application. [YouTube demo](https://www.youtube.com/watch?v=86SiHCIcKv0)

<p align="center">
  <img src="onegram.png">
</p>

# Features
- authentication
- image repository
- persistent storage with MongoDB

# Running the server
Make sure to install NodeJS and MongoDB.

```console
# 1. start mongodb with
mongod --dbpath "/path/to/db"

# 2. add keypair to certificate/
openssl req -newkey rsa:2048 -nodes -keyout certificates/server.key -x509 -days 365 -out certificates/server.crt

# 3. configure smtp service in bin/mail.js
# 4. start the server

node ./bin/www
```

# Configuration

- registation email in bin/mail.js
- website in /views and /public

# Running tests
Requires a running server and configured SMTP.

```console
mocha test --exit
```

If tests fails due to gmail authentication please check the following
1. login to the mailer account
2. open this link and click the button https://accounts.google.com/DisplayUnlockCaptcha
3. make sure to enable access for "less secure applications" on the google account under security.

# Available clients
- [Android](https://github.com/codingchili/onegram-android)
