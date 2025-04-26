[Miiverse_ProxOverride]
moduleMatches = 0x41681a2b
.origin = codecave
GetProxHost:
lis r4, ProxHost@ha
ori r4, r4, ProxHost@l
blr

ProxHost:
.string "localhost"

0x02165cf8 = nop ; proxy always enabled
0x02165d08 = bla GetProxHost
0x02165d18 = li r0, 8888 ; port number

.origin = 0x1000bd28 ; http://.account.nintendo.net
.string ".pretendo.cc"

.origin = 0x1000be3d ; https://.nintendo.net
.string ".pretendo.cc"

[Miiverse_SSLPatch]
moduleMatches = 0xfe9f7df0
.origin = 0x02043c54
li r3, 1
blr
