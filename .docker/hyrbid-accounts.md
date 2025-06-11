For 3DS testing, "hybrid accounts" are often needed. This is where the same account information is accepted on both
prod and local servers. If you see 002-0102 on the proxy, this is likely the issue.

You need:
- Any NASC request blob (copy this from mitmproxy). Starts with "gameid="...
- Your NEX password (https://9net.org/~stary/get_3ds_pid_password.3dsx)
- Your 3DS friend code (you can click past the ban message to see this)
- The PID for your linked PNID (https://pnidlt.gab.net.eu.org/)
- The password for your linked PNID

First, register a PNID with the same username as your linked PNID. The password will be overwritten later.
```shell
# REGISTER
https_proxy=http://localhost:8888 curl -k -v -X POST -H "Content-Type: application/json" --data '{"email":"ash@heyquark.com", "username":"PN_quarky", "mii_name":"Luca", "password":"letm3in", "password_confirm":"letm3in"}'  https://api.pretendo.cc/v1/register/
```

Then, run `hybrid-account.py` and provide the information it asks for. It will give:
- A `nexaccounts` record (JSON, `device_type`, `access_level`...)
- A `devices` record (JSON, `model`, `serial`...)
- The PNID PID and hashed password

Your best bet is to insert these into the database using MongoDB Compass. Connect to `localhost` then in `account/nexaccounts`, Add Data->Insert Document, paste the output from the script. Same for `account/devices`.

Locate your newly-registered PNID in `account/pnids` and overwrite the `pid` and `password` fields with the values provided by the script.