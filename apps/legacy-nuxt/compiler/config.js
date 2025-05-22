const path = require('node:path');

const PATHS = {
	app: path.resolve(__dirname, '../app.vue'),
	pages: path.resolve(__dirname, '../pages'),
	layouts: path.resolve(__dirname, '../layouts'),
	components: path.resolve(__dirname, '../components'),
	runtime: path.resolve(__dirname, '../runtime'),
	server: path.resolve(__dirname, '../server'),
	dist: path.resolve(__dirname, '../dist'),
	public: path.resolve(__dirname, '../public')
};

const PAGE_SCAFFOLD = `
<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<title>{{ title }}</title>
		{{ head }}
		<style>{{ style }}</style>
	</head>
	<body>
		<div id="__nuxt">
			<NuxtPage />
		</div>
		<script src="/runtime/reactivity.js"></script>
		<script>
			window.onerror = function(message) { alert('JS error: ' + message); };
			{{ component_script }}
		</script>
	</body>
</html>`.trim();

module.exports = {
	PATHS,
	PAGE_SCAFFOLD
};
