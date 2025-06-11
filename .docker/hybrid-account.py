from urllib.parse import parse_qsl
from base64 import b64decode, b64encode
from hashlib import sha256
import bcrypt
import json

request = input("NASC request blob:")

parts = parse_qsl(request)

def decode_base64(enc: str):
    enc = enc.replace('.', '+').replace('-', '/').replace('*', '=')
    return b64decode(enc)
parts = dict(((key, decode_base64(val)) for key, val in parts))

pid = int(parts['userid'].decode('ascii'))
fcdcert_hash = sha256(parts['fcdcert']).digest()

print("OK.")
password = input(f"NEX Password for {pid}:")
fc = input("FC (XXXX-XXXX-XXXX):")
pnidpid = int(input("PNID PID:"))
pnidpassword = input("PNID password:")

def nintendo_password(password: str, pid: int):
    buf = pid.to_bytes(4, 'little')
    buf += b'\x02\x65\x43\x46'
    buf += password.encode('ascii')
    return sha256(buf).digest().hex()

print(json.dumps({
    'device_type': '3ds',
    'access_level': 0,
    'server_access_level': "prod",
    'pid': pid,
    'password': password,
    'friend_code': fc,
}))

print(json.dumps({
    'model': "ctr",
    'serial': parts['csnum'].decode('ascii'),
    'access_level': 0,
    'server_access_level': 'prod',
    'certificate_hash': b64encode(fcdcert_hash).decode('ascii'),
    'fcdcert_hash': b64encode(fcdcert_hash).decode('ascii'),
    'device_attributes': [],
}))

pwhash = nintendo_password(pnidpassword, pnidpid)
bpwsalt = bcrypt.gensalt(10)
bpwhash = bcrypt.hashpw(pwhash.encode('ascii'), bpwsalt)
print(f"{pnidpid}: {bpwhash.decode('ascii')}")
