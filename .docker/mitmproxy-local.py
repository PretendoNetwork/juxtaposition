from mitmproxy import http
from mitmproxy.proxy import server_hooks

account_domains = [
    "conntest.pretendo.cc",
    "cbvc.cdn.pretendo.cc",
    'c.account.pretendo.cc', 'account.pretendo.cc',
    "nasc.pretendo.cc",
    "datastore.pretendo.cc",
    "api.pretendo.cc",
    "local-cdn.pretendo.cc",
    "assets.pretendo.cc",
]

miiverse_domains = [
    "discovery.olv.nintendo.net",
    "discovery.olv.pretendo.cc",
    "api.olv.pretendo.cc",
]

juxt_domains = [
    "juxt.pretendo.network",
    "portal.olv.pretendo.cc",
    "ctr.olv.pretendo.cc",
]

s3_domains = [
    "cdn.pretendo.cc",
]

def request(flow: http.HTTPFlow):
    # redirect to different host
    if flow.request.pretty_host in account_domains:
        old = flow.request.host
        flow.request.host = "account"
        flow.request.scheme = "http"
        flow.request.port = 8000
        flow.request.host_header = old
    elif flow.request.pretty_host in miiverse_domains:
        old = flow.request.host
        flow.request.host = "host.docker.internal"
        flow.request.scheme = "http"
        flow.request.port = 8080
        flow.request.host_header = old
    elif flow.request.pretty_host in juxt_domains:
        old = flow.request.host
        flow.request.host = "host.docker.internal"
        flow.request.scheme = "http"
        flow.request.port = 5173
        flow.request.host_header = old
    elif flow.request.pretty_host in s3_domains:
        old = flow.request.host
        flow.request.host = "minio"
        flow.request.scheme = "http"
        flow.request.port = 9000
        #flow.request.host_header = old
