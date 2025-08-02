const canvas = document.getElementById('photo-canvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

let currentTool = 'move';
let isDrawing = false;
let lastX = 0, lastY = 0;
let imageData = null;

const tools = document.querySelectorAll('#toolbar button');
tools.forEach(btn => {
  btn.addEventListener('click', () => {
    currentTool = btn.dataset.tool;
    tools.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// Brush Tool Drawing
canvas.addEventListener('mousedown', (e) => {
  if (currentTool === 'brush') {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
  }
});

canvas.addEventListener('mousemove', (e) => {
 if (isDrawing && (currentTool === 'brush' || currentTool === 'eraser')) {
  ctx.lineWidth = 5;
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

// Load Image
const loader = document.getElementById('image-loader');
loader.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const img = new Image();
  img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  img.src = URL.createObjectURL(file);
});

// Brightness/Contrast/Saturation Adjustments
const brightnessInput = document.getElementById('brightness');
const contrastInput = document.getElementById('contrast');
const saturationInput = document.getElementById('saturation');

function applyAdjustments() {
  const brightness = parseInt(brightnessInput.value);
  const contrast = parseInt(contrastInput.value);
  const saturation = parseInt(saturationInput.value);
  
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    // Brightness
    data[i] += brightness;     // R
    data[i + 1] += brightness; // G
    data[i + 2] += brightness; // B

    // Contrast
    data[i] = ((((data[i] / 255) - 0.5) * (contrast / 100 + 1)) + 0.5) * 255;
    data[i + 1] = ((((data[i + 1] / 255) - 0.5) * (contrast / 100 + 1)) + 0.5) * 255;
    data[i + 2] = ((((data[i + 2] / 255) - 0.5) * (contrast / 100 + 1)) + 0.5) * 255;

    // Saturation (simple approximation)
    let avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    data[i] += (data[i] - avg) * (saturation / 100);
    data[i + 1] += (data[i + 1] - avg) * (saturation / 100);
    data[i + 2] += (data[i + 2] - avg) * (saturation / 100);
  }

  ctx.putImageData(imgData, 0, 0);
}

[brightnessInput, contrastInput, saturationInput].forEach(input => {
  input.addEventListener('input', applyAdjustments);
});
