// Export as SVG
document.getElementById('export-svg').addEventListener('click', () => {
  const svgData = canvas.toSVG();
  const blob = new Blob([svgData], { type: 'image/svg+xml' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'vector_drawing.svg';
  link.click();
});

// Export as PNG
document.getElementById('export-png').addEventListener('click', () => {
  const dataURL = canvas.toDataURL({ format: 'png' });
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = 'vector_drawing.png';
  link.click();
});

// Export as JPEG
document.getElementById('export-jpeg').addEventListener('click', () => {
  const dataURL = canvas.toDataURL({ format: 'jpeg', quality: 0.9 });
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = 'vector_drawing.jpg';
  link.click();
});

// Import SVG
document.getElementById('import-svg').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (event) {
    fabric.loadSVGFromString(event.target.result, (objects, options) => {
      const obj = fabric.util.groupSVGElements(objects, options);
      canvas.add(obj).renderAll();
    });
  };
  reader.readAsText(file);
});





// SHAPE TOOLS...........................................................................

document.querySelectorAll('.tool-dropdown-item').forEach(item => {
  item.addEventListener('click', () => {
    const shapeType = item.dataset.shape;
    addShape(shapeType);
  });
});

function addShape(type) {
let isDrawingShape = false;
let startX, startY;
let tempShape = null;


// When picking a shape from the menu.......................................................

document.querySelectorAll('.tool-dropdown-item').forEach(item => {
  item.addEventListener('click', () => {
    const shapeType = item.dataset.shape;
    currentTool = shapeType;
    shapesList.style.display = 'none';
  });
});


// Mouse down: start drawing shape .........................................................

canvas.on('mouse:down', function(opt) {
  if (!['rectangle','circle','ellipse','line','triangle','polygon'].includes(currentTool)) return;
  
  isDrawingShape = true;
  const pointer = canvas.getPointer(opt.e);
  startX = pointer.x;
  startY = pointer.y;

  const fill = document.getElementById('fill-color').value;
  const stroke = document.getElementById('stroke-color').value;

  if (currentTool === 'rectangle') {
    tempShape = new fabric.Rect({ left: startX, top: startY, width: 0, height: 0, fill, stroke });
  }
  else if (currentTool === 'circle') {
    tempShape = new fabric.Circle({ left: startX, top: startY, radius: 0, fill, stroke });
  }
  else if (currentTool === 'ellipse') {
    tempShape = new fabric.Ellipse({ left: startX, top: startY, rx: 0, ry: 0, fill, stroke });
  }
  else if (currentTool === 'line') {
    tempShape = new fabric.Line([startX, startY, startX, startY], { stroke, strokeWidth: 2 });
  }
  else if (currentTool === 'triangle') {
    tempShape = new fabric.Triangle({ left: startX, top: startY, width: 0, height: 0, fill, stroke });
  }
  else if (currentTool === 'polygon') {
    // Simple 5-point polygon as placeholder
    tempShape = new fabric.Polygon([
      { x: 0, y: -50 },
      { x: 47, y: -15 },
      { x: 29, y: 40 },
      { x: -29, y: 40 },
      { x: -47, y: -15 }
    ], { left: startX, top: startY, scaleX: 0, scaleY: 0, fill, stroke });
  }

  if (tempShape) canvas.add(tempShape);
});



// Mouse move: resize shape dynamically.........................................

canvas.on('mouse:move', function(opt) {
  if (!isDrawingShape || !tempShape) return;
  const pointer = canvas.getPointer(opt.e);

  if (currentTool === 'rectangle' || currentTool === 'triangle') {
    tempShape.set({ width: pointer.x - startX, height: pointer.y - startY });
  }
  else if (currentTool === 'circle') {
    const radius = Math.sqrt(Math.pow(pointer.x - startX, 2) + Math.pow(pointer.y - startY, 2)) / 2;
    tempShape.set({ radius });
  }
  else if (currentTool === 'ellipse') {
    tempShape.set({ rx: Math.abs(pointer.x - startX) / 2, ry: Math.abs(pointer.y - startY) / 2 });
  }
  else if (currentTool === 'line') {
    tempShape.set({ x2: pointer.x, y2: pointer.y });
  }
  else if (currentTool === 'polygon') {
    tempShape.set({ scaleX: (pointer.x - startX) / 100, scaleY: (pointer.y - startY) / 100 });
  }

  canvas.renderAll();
});


// Mouse up: finish shape.........................................................

canvas.on('mouse:up', function() {
  if (isDrawingShape) {
    isDrawingShape = false;
    tempShape = null;
    // Automatically go back to Select tool
    currentTool = 'select';
    document.querySelectorAll('#vector-toolbar .tool').forEach(b => b.classList.remove('active'));
    document.querySelector('#vector-toolbar .tool[data-tool="select"]').classList.add('active');
  }
});


}








// SHAPES DROP DOWN............................

const shapesButton = document.getElementById('shapes-button');
const shapesList = document.getElementById('shapes-list');

shapesButton.addEventListener('click', (e) => {
  e.stopPropagation(); // prevent closing instantly
  shapesList.style.display = shapesList.style.display === 'block' ? 'none' : 'block';
});


// Close dropdown if clicking elsewhere...........................

document.addEventListener('click', () => {
  shapesList.style.display = 'none';
});



// Shape click handler ......................................

document.querySelectorAll('.tool-dropdown-item').forEach(item => {
  item.addEventListener('click', () => {
    const shapeType = item.dataset.shape;
    currentTool = shapeType;
    shapesList.style.display = 'none';
  });
});









// PEN TOOL LOGIC........................................................

let penPoints = [];
let tempPath = null;
let isDrawingPath = false;
let handleLines = [];
let previewLine = null;

canvas.on('mouse:down', function(opt) {
  if (currentTool === 'pen') {
    const pointer = canvas.getPointer(opt.e);

    // Add point
    penPoints.push([pointer.x, pointer.y]);
    isDrawingPath = true;

    // Remove preview line once clicked
    if (previewLine) {
      canvas.remove(previewLine);
      previewLine = null;
    }

    // Draw permanent path
    if (penPoints.length > 1) {
      const pathData = penPoints.reduce((acc, point, i) => {
        if (i === 0) {
          return `M ${point[0]} ${point[1]}`;
        } else {
          return acc + ` L ${point[0]} ${point[1]}`;
        }
      }, '');
      if (tempPath) canvas.remove(tempPath);
      tempPath = new fabric.Path(pathData, {
        fill: '',
        stroke: document.getElementById('stroke-color').value,
        strokeWidth: parseInt(document.getElementById('stroke-width').value)
      });
      canvas.add(tempPath);
    }
  }
});

// LIVE PREVIEW OF NEXT SEGMENT.........................................
canvas.on('mouse:move', function(opt) {
  if (currentTool === 'pen' && isDrawingPath && penPoints.length > 0) {
    const pointer = canvas.getPointer(opt.e);
    const lastPoint = penPoints[penPoints.length - 1];

    // Remove old preview line
    if (previewLine) {
      canvas.remove(previewLine);
    }

    // Create new preview line
    previewLine = new fabric.Line([lastPoint[0], lastPoint[1], pointer.x, pointer.y], {
      stroke: '#8888ff',
      strokeWidth: 1,
      selectable: false,
      evented: false
    });
    canvas.add(previewLine);
    canvas.renderAll();
  }
});

// Finish path on double click........................................
canvas.on('mouse:dblclick', function() {
  if (currentTool === 'pen' && tempPath) {
    tempPath.set({ objectCaching: false });
    penPoints = [];
    tempPath = null;
    previewLine && canvas.remove(previewLine);
    previewLine = null;
    isDrawingPath = false;
    currentTool = 'select';
    document.querySelectorAll('#vector-toolbar .tool').forEach(b => b.classList.remove('active'));
    document.querySelector('#vector-toolbar .tool[data-tool="select"]').classList.add('active');
  }
});


// PATH EDITING MODE...................................................

let editAnchors = [];
let editingPath = null;

function enterEditPathMode(pathObj) {
  if (!pathObj.path) return;
  editingPath = pathObj;
  editAnchors.forEach(a => canvas.remove(a));
  editAnchors = [];

  pathObj.path.forEach((cmd, i) => {
    if (cmd[0] === 'M' || cmd[0] === 'L') {
      const anchor = new fabric.Circle({
        left: cmd[1],
        top: cmd[2],
        radius: 5,
        fill: 'red',
        hasBorders: false,
        hasControls: false,
        originX: 'center',
        originY: 'center'
      });
      anchor.on('moving', function() {
        cmd[1] = anchor.left;
        cmd[2] = anchor.top;
        pathObj.set({ path: [...pathObj.path] });
        canvas.renderAll();
      });
      editAnchors.push(anchor);
      canvas.add(anchor);
    }
  });
}

function exitEditPathMode() {
  editAnchors.forEach(a => canvas.remove(a));
  editAnchors = [];
  editingPath = null;
}

// Activate Edit Path Tool
document.querySelector('#vector-toolbar .tool[data-tool="edit-path"]').addEventListener('click', () => {
  currentTool = 'edit-path';
  if (canvas.getActiveObject() && canvas.getActiveObject().type === 'path') {
    enterEditPathMode(canvas.getActiveObject());
  }
});

canvas.on('selection:created', function(e) {
  if (currentTool === 'edit-path' && e.target.type === 'path') {
    enterEditPathMode(e.target);
  }
});

canvas.on('selection:cleared', function() {
  if (currentTool === 'edit-path') exitEditPathMode();
});
