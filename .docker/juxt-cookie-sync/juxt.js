/* When developing github.com/PretendoNetwork/juxtaposition, it's useful to open
 * the embedded frontends in a standard browser. There's a hack in the auth code to
 * allow for this, where developer/admin accounts can set an access_token cookie.
 * This extension slurps that cookie from the normal website and sets it on the
 * embedded frontend domains so that we can see both.
 * The cookie does nothing for normal users, so only Juxt developers should use
 * this extension. */

console.log("OOMG HAIIIII x3 x3");

const pick = (obj, ...keys) => Object.fromEntries(
  keys
  .filter(key => key in obj)
  .map(key => [key, obj[key]])
);

browser.cookies.onChanged.addListener(async (ev) => {
	if (ev.cause !== 'explicit') return;
	if (ev.cookie.domain !== '.pretendo.network') return;
	if (ev.cookie.name !== 'access_token') return;

	const cookie = {
		... pick(ev.cookie,
				"expirationDate",
				"firstPartyDomain",
				"httpOnly",
				"name",
				"partitionKey",
				"sameSite",
				"secure",
				"storeId",
				"value"
			),
		domain: ".olv.pretendo.cc",
		url: "https://portal.olv.pretendo.cc"
	}
	browser.cookies.set(cookie);
	console.log("Synced access_token for .olv.pretendo.cc!");

	const sessions = await browser.cookies.getAll({
		domain: ".olv.pretendo.cc",
		firstPartyDomain: null,
		name: "connect.sid",
		partitionKey: {},
	});
	for (const sess of sessions) {
		browser.cookies.remove({
			name: sess.name,
			url: `https://${sess.domain}${sess.path}`,

			firstPartyDomain: sess.firstPartyDomain,
			partitionKey: sess.partitionKey,
			storeId: sess.storeId,
		})
		console.log(`Removed session cookie for ${sess.domain}`)
	}
});
