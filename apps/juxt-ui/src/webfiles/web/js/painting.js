const c = document.getElementById('painting');
const ctx = c.getContext('2d');

// eslint-disable-next-line prefer-const -- Modified in web.js
let scale = c.getBoundingClientRect().width / 320;
let isPainting = false;
let currentPen = drawPen1;
let oldCursorPosition = null;
let penColor = '#000';

clearCanvas();

ctx.imageSmoothingEnabled = false;

function drawPen1(ctx, x, y, style) {
	ctx.fillStyle = style;
	ctx.fillRect(x, y, 1, 1);
}

function drawPen2(ctx, x, y, style) {
	ctx.fillStyle = style;
	ctx.fillRect(x - 1, y, 3, 1);
	ctx.fillRect(x, y - 1, 1, 3);
}

function drawPen3(ctx, x, y, style) {
	ctx.fillStyle = style;
	ctx.fillRect(x - 3, y - 3, 7, 7);
	ctx.fillRect(x - 4, y - 1, 9, 3);
	ctx.fillRect(x - 1, y - 4, 3, 9);
}

function clearCanvas() {
	ctx.clearRect(0, 0, c.width, c.height);
	ctx.fillStyle = '#fff';
	ctx.fillRect(0, 0, 320, 120);
}

// eslint-disable-next-line no-unused-vars -- Used in src/webfiles/web/message_thread.ejs
function setPen(number) {
	setTool(number, '#000');
}

// eslint-disable-next-line no-unused-vars -- Used in src/webfiles/web/message_thread.ejs
function setEraser(number) {
	setTool(number, '#fff');
}

function setTool(number, color) {
	penColor = color;
	switch (number) {
		case 0:
			currentPen = drawPen1;
			break;
		case 1:
			currentPen = drawPen2;
			break;
		case 2:
			currentPen = drawPen3;
			break;
	}
}

function getCursorPosition(e) {
	const paintingBounds = c.getBoundingClientRect();
	const currentPosition = { x: 0, y: 0 };

	if (e.type.indexOf('touch') !== -1) {
		currentPosition.x = e.touches[0].clientX;
		currentPosition.y = e.touches[0].clientY;
	} else {
		currentPosition.x = e.clientX;
		currentPosition.y = e.clientY;
	}

	return {
		x: Math.round((currentPosition.x - paintingBounds.left) / scale) - 2,
		y: Math.round((currentPosition.y - paintingBounds.top) / scale) - 2
	};
}

function draw(e) {
	if (!isPainting) {
		return;
	}

	const currentCursorPosition = getCursorPosition(e);

	if (!currentCursorPosition) {
		return;
	}

	if (oldCursorPosition === null) {
		oldCursorPosition = getCursorPosition(e);
	}

	const points = calcStraightLine(currentCursorPosition, oldCursorPosition);

	for (const point of points) {
		currentPen(ctx, point.x, point.y, penColor);
	}

	oldCursorPosition = getCursorPosition(e);
}

function calcStraightLine(startCoordinates, endCoordinates) {
	const coordinatesArray = [];
	// Translate coordinates
	let x1 = startCoordinates.x;
	let y1 = startCoordinates.y;
	const x2 = endCoordinates.x;
	const y2 = endCoordinates.y;

	if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) {
		return;
	}

	// Define differences and error check
	const dx = Math.abs(x2 - x1);
	const dy = Math.abs(y2 - y1);
	const sx = x1 < x2 ? 1 : -1;
	const sy = y1 < y2 ? 1 : -1;
	let err = dx - dy;
	// Set first coordinates
	coordinatesArray.push({ x: x1, y: y1 });
	// Main loop
	while (!(x1 == x2 && y1 == y2)) {
		const e2 = err << 1;
		if (e2 > -dy) {
			err -= dy;
			x1 += sx;
		}
		if (e2 < dx) {
			err += dx;
			y1 += sy;
		}
		// Set coordinates
		coordinatesArray.push({ x: x1, y: y1 });
	}
	// Return the result
	return coordinatesArray;
}

c.addEventListener('mousedown', (e) => {
	oldCursorPosition = null;
	isPainting = true;
	draw(e);
});

c.addEventListener(
	'touchstart',
	(e) => {
		oldCursorPosition = null;
		isPainting = true;
		draw(e);
	},
	{ passive: false }
);

c.addEventListener('mouseup', () => {
	isPainting = false;
	oldCursorPosition = null;
});

c.addEventListener('touchend', () => {
	isPainting = false;
	oldCursorPosition = null;
});

c.addEventListener('mousemove', draw);
c.addEventListener('touchmove', draw);
