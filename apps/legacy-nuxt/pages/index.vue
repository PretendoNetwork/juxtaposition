<script setup>
import { ref } from 'vue'

const counter = ref(0);
const message = ref('Hello 3DS!');
const theme = ref('blue');

function setTheme(newTheme) {
	theme.value = newTheme;
}

function inc() {
	console.log('before')
	counter.value += 10;
	alert('inced')
}

const dec = () => {
	alert('deced')
	counter.value -= 10;
	console.log('after')
}
</script>

<template>
	<div id="app" class="container" :class="theme">
		<div class="header">
			<h1 class="title">Miiverse Vue</h1>
		</div>

		<div class="section">
			<h2>Counter</h2>
			<div class="counter-wrapper">
				<button class="counter-button" @click="counter--">-</button>
				<span class="counter">{{ counter }}</span>
				<button class="counter-button" @click="counter++">+</button>
			</div>
			<div>
				<button @click="inc">Big inc</button>
				<button @click="dec">Big dec</button>
			</div>
		</div>

		<div class="section">
			<h2>Message</h2>
			<input class="input" v-model="message">
			<div class="message-box">{{ message }}</div>
		</div>

		<div class="section">
			<h2>Theme</h2>
			<div class="theme-wrapper">
				<button class="theme-button" id="blue-button" @click="setTheme('blue')">Blue</button>
				<button class="theme-button" id="red-button" @click="setTheme('red')">Red</button>
				<button class="theme-button" id="green-button" @click="setTheme('green')">Green</button>
			</div>
		</div>
	</div>
</template>

<style>
body {
	margin: 0;
	padding: 5px;
	font-family: sans-serif;
	font-size: 14px;
}

.container {
	padding: 5px;
	width: 300px;
	margin: 0 auto;
}

/* Themes */
.blue {
	background-color: #e6f7ff;
	color: #0066cc;
}

.red {
	background-color: #ffe6e6;
	color: #cc0000;
}

.green {
	background-color: #e6ffe6;
	color: #006600;
}

.header {
	text-align: center;
}

.title {
	font-size: 16px;
	margin: 0 0 10px 0;
}

.section {
	background-color: white;
	margin-bottom: 10px;
	padding: 8px;
	border: 1px solid #ccc;
}

h2 {
	font-size: 14px;
	margin: 0 0 5px 0;
}

.counter-wrapper {
	text-align: center;
}

.counter {
	font-size: 20px;
	font-weight: bold;
	margin: 0 10px;
	display: inline-block;
	width: 30px;
}

.counter-button {
	width: 30px;
	height: 30px;
	font-size: 16px;
	background-color: #4a90e2;
	color: white;
	border: none;
}

.input {
	width: 95%;
	padding: 5px;
	margin-bottom: 5px;
	border: 1px solid #ccc;
}

.message-box {
	background-color: #f5f5f5;
	padding: 5px;
	border: 1px solid #ddd;
	min-height: 20px;
	overflow: hidden;
}

.theme-wrapper {
	text-align: center;
}

.theme-button {
	margin: 0 5px;
	padding: 5px;
	border: none;
	color: white;
	font-weight: bold;
	width: 70px;
}

#blue-button {
	background-color: #0066cc;
}

#red-button {
	background-color: #cc0000;
}

#green-button {
	background-color: #006600;
}
</style>