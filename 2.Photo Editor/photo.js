const canvas = document.getElementById('photo-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth - 280;
canvas.height = window.innerHeight;

let currentTool = 'move';
let isDrawing = false;
let lastX = 0, lastY = 0;

// Tool selection
document.querySelectorAll('#photo-toolbar button').forEach(btn => {
  btn.addEventListener('click', () => {
    currentTool = btn.dataset.tool;
    document.querySelectorAll('#photo-toolbar button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// Brush / Eraser Drawing
canvas.addEventListener('mousedown', (e) => {
  if (currentTool === 'brush' || currentTool === 'eraser') {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
  }
});

canvas.addEventListener('mousemove', (e) => {
  if (!isDrawing) return;
  if (currentTool === 'brush' || currentTool === 'eraser') {
    ctx.lineWidth = document.getElementById('brush-size').value;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.offsetX, e.offsetY);

    if (currentTool === 'brush') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = document.getElementById('color-picker').value;
    } else if (currentTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    }

    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
    [lastX, lastY] = [e.offsetX, e.offsetY];
  }
});

canvas.addEventListener('mouseup', () => isDrawing = false);
canvas.addEventListener('mouseleave', () => isDrawing = false);

// Load image
document.getElementById('image-loader').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const img = new Image();
  img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  img.src = URL.createObjectURL(file);
});

// Adjustments
function applyAdjustments() {
  const brightness = parseInt(document.getElementById('brightness').value);
  const contrast = parseInt(document.getElementById('contrast').value);
  const saturation = parseInt(document.getElementById('saturation').value);

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    data[i] += brightness;
    data[i + 1] += brightness;
    data[i + 2] += brightness;

    data[i] = ((((data[i] / 255) - 0.5) * (contrast / 100 + 1)) + 0.5) * 255;
    data[i + 1] = ((((data[i + 1] / 255) - 0.5) * (contrast / 100 + 1)) + 0.5) * 255;
    data[i + 2] = ((((data[i + 2] / 255) - 0.5) * (contrast / 100 + 1)) + 0.5) * 255;

    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    data[i] += (data[i] - avg) * (saturation / 100);
    data[i + 1] += (data[i + 1] - avg) * (saturation / 100);
    data[i + 2] += (data[i + 2] - avg) * (saturation / 100);
  }

  ctx.putImageData(imgData, 0, 0);
}

['brightness', 'contrast', 'saturation'].forEach(id => {
  document.getElementById(id).addEventListener('input', applyAdjustments);
});
