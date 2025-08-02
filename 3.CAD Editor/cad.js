const canvas = document.getElementById('cad-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth - 280;
canvas.height = window.innerHeight;

let currentTool = 'select';
let isDrawing = false;
let startX = 0, startY = 0;
let shapes = [];

let gridSize = parseInt(document.getElementById('grid-size').value);
let snapGrid = document.getElementById('snap-grid').checked;

// Tool selection
document.querySelectorAll('#cad-toolbar .tool').forEach(btn => {
  btn.addEventListener('click', () => {
    currentTool = btn.dataset.tool;
    document.querySelectorAll('#cad-toolbar .tool').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// Grid toggle and size
document.getElementById('snap-grid').addEventListener('change', e => {
  snapGrid = e.target.checked;
  drawAll();
});

document.getElementById('grid-size').addEventListener('input', e => {
  gridSize = parseInt(e.target.value);
  drawAll();
});

function snap(value) {
  return snapGrid ? Math.round(value / gridSize) * gridSize : value;
}

// Drawing
canvas.addEventListener('mousedown', e => {
  const rect = canvas.getBoundingClientRect();
  startX = snap(e.clientX - rect.left);
  startY = snap(e.clientY - rect.top);
  isDrawing = true;
});

canvas.addEventListener('mouseup', e => {
  if (!isDrawing) return;
  const rect = canvas.getBoundingClientRect();
  const endX = snap(e.clientX - rect.left);
  const endY = snap(e.clientY - rect.top);

  if (currentTool === 'line') shapes.push({ type: 'line', x1: startX, y1: startY, x2: endX, y2: endY });
  else if (currentTool === 'rectangle') shapes.push({ type: 'rectangle', x: startX, y: startY, w: endX - startX, h: endY - startY });
  else if (currentTool === 'circle') shapes.push({ type: 'circle', x: startX, y: startY, r: Math.hypot(endX - startX, endY - startY) });
  else if (currentTool === 'ellipse') shapes.push({ type: 'ellipse', x: startX, y: startY, rx: Math.abs(endX - startX), ry: Math.abs(endY - startY) });
  else if (currentTool === 'arc') shapes.push({ type: 'arc', x: startX, y: startY, r: Math.hypot(endX - startX, endY - startY), startAngle: 0, endAngle: Math.PI });
  else if (currentTool === 'polyline') shapes.push({ type: 'line', x1: startX, y1: startY, x2: endX, y2: endY }); // Simple polyline for now

  isDrawing = false;
  drawAll();
});

canvas.addEventListener('mousemove', e => {
  if (!isDrawing) return;
  drawAll();
  const rect = canvas.getBoundingClientRect();
  const x = snap(e.clientX - rect.left);
  const y = snap(e.clientY - rect.top);

  if (currentTool === 'line') drawLine(startX, startY, x, y, true);
  else if (currentTool === 'rectangle') drawRect(startX, startY, x - startX, y - startY, true);
  else if (currentTool === 'circle') drawCircle(startX, startY, Math.hypot(x - startX, y - startY), true);
  else if (currentTool === 'ellipse') drawEllipse(startX, startY, Math.abs(x - startX), Math.abs(y - startY), true);
  else if (currentTool === 'arc') drawArc(startX, startY, Math.hypot(x - startX, y - startY), 0, Math.PI, true);
});

function drawAll() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  shapes.forEach(s => drawShape(s));
}

function drawGrid() {
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 0.5;
  for (let x = 0; x < canvas.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function drawShape(s) {
  if (s.type === 'line') drawLine(s.x1, s.y1, s.x2, s.y2);
  else if (s.type === 'rectangle') drawRect(s.x, s.y, s.w, s.h);
  else if (s.type === 'circle') drawCircle(s.x, s.y, s.r);
  else if (s.type === 'ellipse') drawEllipse(s.x, s.y, s.rx, s.ry);
  else if (s.type === 'arc') drawArc(s.x, s.y, s.r, s.startAngle, s.endAngle);
}

function drawLine(x1, y1, x2, y2, preview = false) {
  ctx.strokeStyle = preview ? '#888' : '#fff';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawRect(x, y, w, h, preview = false) {
  ctx.strokeStyle = preview ? '#888' : '#fff';
  ctx.strokeRect(x, y, w, h);
}

function drawCircle(x, y, r, preview = false) {
  ctx.strokeStyle = preview ? '#888' : '#fff';
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
}

function drawEllipse(x, y, rx, ry, preview = false) {
  ctx.strokeStyle = preview ? '#888' : '#fff';
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();
}

function drawArc(x, y, r, start, end, preview = false) {
  ctx.strokeStyle = preview ? '#888' : '#fff';
  ctx.beginPath();
  ctx.arc(x, y, r, start, end);
  ctx.stroke();
}

// Init
drawAll();
