This describes a development setup for Juxtaposition. All the Juxt code will run on your host, with the dependencies running in Docker.

Make sure you're using *rootful* docker/podman. On SELinux systems, `setenforce permissive`.

The basic idea is straightforward - `docker compose up`. However, some extra initialisation is needed. First, configure the account and discovery endpoints:

```js
// docker exec -it juxtaposition-dev-mongo-1 mongosh account
db.servers.insertOne({ip: '127.0.0.1', port: 80, service_name: 'miiverse', service_type: 'service', game_server_id: '', title_ids: [], access_mode: 'prod', maintenance_mode: false, device: 1, aes_key: '1234567812345678123456781234567812345678123456781234567812345678', client_id: '87cd32617f1985439ea608c2746e4610'})

// docker exec -it juxtaposition-dev-mongo-1 mongosh miiverse
db.endpoints.insertOne({status: 0, server_access_level: 'prod', topics: true, guest_access: true, host: "api.olv.pretendo.cc", api_host: "api.olv.pretendo.cc", portal_host: "portal.olv.pretendo.cc", n3ds_host: "ctr.olv.pretendo.cc"})
```

A HTTP proxy is running on `localhost:8888`. You can view the proxy's web panel on `localhost:8081`; password "letmein".
Now, create a PNID on your new account server and configure Cemu. Alternatively, you could also set the proxy on a real console (also using Inkay and Meowth) and make an account that way. 

Assuming you're in a usual Linux environment and shell:
```shell
# REGISTER
https_proxy=http://localhost:8888 curl -k -v -X POST -H "Content-Type: application/json" --data '{"email":"ash@heyquark.com", "username":"PN_quarky_dev", "mii_name":"Luca", "password":"letm3in", "password_confirm":"letm3in"}'  https://api.pretendo.cc/v1/register/

# LOGIN (get tokens for user info)
https_proxy=http://localhost:8888 curl -k -v -X POST -H 'Content-Type: application/json' --data '{"grant_type": "password", "username":"PN_quarky_dev", "password":"letm3in"}' https://api.pretendo.cc/v1/login

# USER INFO (pid number etc)
https_proxy=http://localhost:8888 curl -k -v -X GET -H "Authorization: Bearer <access_token_here>"  https://api.pretendo.cc/v1/user

# Cemu
# Edit PrincipalId StickyPrincipalId AccountId StickyAccountId
# AccountPasswordHash: https://gbtptc.isledelfino.net/pass-hash/
nano /some/path/mlc/usr/save/system/act/80000001/account.dat
# Running:
http_proxy=http://localhost:8888 https_proxy=http://localhost:8888 ~/Apps/Cemu-2.6-x86_64.AppImage -mlc /some/path/mlc
```

For Cemu, you will also want the `Miiverse_Proxy` graphics pack from this folder to redirect the applet. On hardware, the system proxy is adequate.

To make yourself a developer/level3 account:

```js
// docker exec -it juxtaposition-dev-mongo-1 mongosh account
db.pnids.updateOne({'username':'PN_quarky_dev'}, {$set: {access_level:3}})
```

To run Chromium through the proxy (e.g. to access the Juxt Web UI):

```shell
chromium-browser --proxy-server="http=localhost:8888;https=localhost:8888"
```

You can then run according to the [README](../README.md). Remember to use the `PN_JUXTAPOSITION_UI_USE_PRESETS=docker` and `PN_MIIVERSE_API_USE_PRESETS=docker` environment variables.
