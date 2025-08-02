const canvas = new fabric.Canvas('vector-canvas', {
  backgroundColor: '#fff',
  width: window.innerWidth - 260,
  height: window.innerHeight
});

let currentTool = 'select';

// Tool selection.........................................................................

document.querySelectorAll('#vector-toolbar .tool').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#vector-toolbar .tool').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentTool = btn.dataset.tool;
    activateTool(currentTool);
  });
});

// Color changes............................................................................

document.getElementById('fill-color').addEventListener('input', (e) => {
  const obj = canvas.getActiveObject();
  if (obj) {
    obj.set('fill', e.target.value);
    canvas.renderAll();
  }
});

document.getElementById('stroke-color').addEventListener('input', (e) => {
  const obj = canvas.getActiveObject();
  if (obj) {
    obj.set('stroke', e.target.value);
    canvas.renderAll();
  }
});

// Tool activation................................................................................

function activateTool(tool) {
  canvas.isDrawingMode = false;
  if (tool === 'pencil') {
    canvas.isDrawingMode = true;
    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush.color = document.getElementById('stroke-color').value;
    canvas.freeDrawingBrush.width = 2;
  }
  if (tool === 'brush') {
    canvas.isDrawingMode = true;
    canvas.freeDrawingBrush = new fabric.CircleBrush(canvas);
    canvas.freeDrawingBrush.color = document.getElementById('stroke-color').value;
    canvas.freeDrawingBrush.width = 10;
  }
  if (tool === 'shape') {
    canvas.on('mouse:down', function opt(e) {
      const pointer = canvas.getPointer(e.e);
      const rect = new fabric.Rect({
        left: pointer.x,
        top: pointer.y,
        width: 100,
        height: 80,
        fill: document.getElementById('fill-color').value,
        stroke: document.getElementById('stroke-color').value
      });
      canvas.add(rect);
      canvas.off('mouse:down', opt);
    });
  }
  if (tool === 'text') {
    canvas.on('mouse:down', function opt(e) {
      const pointer = canvas.getPointer(e.e);
      const text = new fabric.IText('Text', {
        left: pointer.x,
        top: pointer.y,
        fill: document.getElementById('fill-color').value
      });
      canvas.add(text);
      canvas.off('mouse:down', opt);
    });
  }
}

activateTool('select');




// Stroke width.............................................................................

document.getElementById('stroke-width').addEventListener('input', (e) => {
  const obj = canvas.getActiveObject();
  if (obj) {
    obj.set('strokeWidth', parseInt(e.target.value));
    canvas.renderAll();
  }
});


// Opacity.....................................................................................

document.getElementById('opacity').addEventListener('input', (e) => {
  const obj = canvas.getActiveObject();
  if (obj) {
    obj.set('opacity', parseFloat(e.target.value));
    canvas.renderAll();
  }
});


// Apply Gradient Fill........................................................................

document.getElementById('apply-gradient').addEventListener('click', () => {
  const obj = canvas.getActiveObject();
  if (obj) {
    const grad = new fabric.Gradient({
      type: 'linear',
      gradientUnits: 'percentage',
      coords: { x1: 0, y1: 0, x2: 1, y2: 0 },
      colorStops: [
        { offset: 0, color: document.getElementById('grad-start').value },
        { offset: 1, color: document.getElementById('grad-end').value }
      ]
    });
    obj.set('fill', grad);
    canvas.renderAll();
  }
});





// Gradient dropdown toggle.................................................

const gradientButton = document.getElementById('gradient-button');
const gradientList = document.getElementById('gradient-list');

gradientButton.addEventListener('click', (e) => {
  e.stopPropagation();
  gradientList.style.display = gradientList.style.display === 'block' ? 'none' : 'block';
});


// Close dropdown when clicking outside........................................
document.addEventListener('click', (e) => {
  if (!gradientList.contains(e.target) && e.target !== gradientButton) {
    gradientList.style.display = 'none';
  }
});





// Apply gradient fill.......................................................

document.getElementById('apply-gradient').addEventListener('click', () => {
  const obj = canvas.getActiveObject();
  if (obj) {
    const startColor = document.getElementById('grad-start').value;
    const endColor = document.getElementById('grad-end').value;
    const direction = document.getElementById('grad-direction').value;

    let coords;
    if (direction === 'horizontal') {
      coords = { x1: 0, y1: 0, x2: 1, y2: 0 };
    } else if (direction === 'vertical') {
      coords = { x1: 0, y1: 0, x2: 0, y2: 1 };
    } else if (direction === 'diagonal') {
      coords = { x1: 0, y1: 0, x2: 1, y2: 1 };
    }

    const grad = new fabric.Gradient({
      type: 'linear',
      gradientUnits: 'percentage',
      coords: coords,
      colorStops: [
        { offset: 0, color: startColor },
        { offset: 1, color: endColor }
      ]
    });

    obj.set('fill', grad);
    canvas.renderAll();
  }
  gradientList.style.display = 'none';
});








// Layers dropdown toggle......................................................

const layersButton = document.getElementById('layers-button');
const layersList = document.getElementById('layers-list');
const layersContainer = document.getElementById('layers-container');

layersButton.addEventListener('click', (e) => {
  e.stopPropagation();
  updateLayersPanel();
  layersList.style.display = layersList.style.display === 'block' ? 'none' : 'block';
});

document.addEventListener('click', (e) => {
  if (!layersList.contains(e.target) && e.target !== layersButton) {
    layersList.style.display = 'none';
  }
});



// Update layers panel.........................................................

function updateLayersPanel() {
  layersContainer.innerHTML = '';
  const objects = canvas.getObjects().slice().reverse(); // topmost first

  objects.forEach((obj, index) => {
    const layerDiv = document.createElement('div');
    layerDiv.className = 'layer-item';
    if (obj === canvas.getActiveObject()) {
      layerDiv.classList.add('active');
    }

    // Drag attributes

    
    layerDiv.draggable = true;
    layerDiv.dataset.index = index; // index in reversed list

    layerDiv.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', index);
      layerDiv.classList.add('dragging');
    });

    layerDiv.addEventListener('dragend', () => {
      layerDiv.classList.remove('dragging');
    });

    layerDiv.addEventListener('dragover', (e) => {
      e.preventDefault();
      layerDiv.style.borderTop = '2px solid yellow';
    });

    layerDiv.addEventListener('dragleave', () => {
      layerDiv.style.borderTop = '';
    });

    layerDiv.addEventListener('drop', (e) => {
      e.preventDefault();
      layerDiv.style.borderTop = '';
      const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
      const toIndex = parseInt(layerDiv.dataset.index, 10);
      reorderLayers(fromIndex, toIndex);
    });



    // Name
    const name = obj.layerName || `Layer ${objects.length - index}`;
    layerDiv.textContent = name;



    // Actions
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'layer-actions';

    const renameBtn = document.createElement('button');
    renameBtn.textContent = '✏️';
    renameBtn.onclick = (e) => {
      e.stopPropagation();
      const newName = prompt('Enter new layer name:', name);
      if (newName) {
        obj.layerName = newName;
        updateLayersPanel();
      }
    };

    const lockBtn = document.createElement('button');
    lockBtn.textContent = obj.selectable ? '🔓' : '🔒';
    lockBtn.onclick = (e) => {
      e.stopPropagation();
      obj.selectable = !obj.selectable;
      lockBtn.textContent = obj.selectable ? '🔓' : '🔒';
    };

    const eyeBtn = document.createElement('button');
    eyeBtn.textContent = obj.visible ? '👁' : '🚫';
    eyeBtn.onclick = (e) => {
      e.stopPropagation();
      obj.visible = !obj.visible;
      eyeBtn.textContent = obj.visible ? '👁' : '🚫';
      canvas.renderAll();
    };

    const topBtn = document.createElement('button');
    topBtn.textContent = '⬆️';
    topBtn.onclick = (e) => {
      e.stopPropagation();
      canvas.bringToFront(obj);
      updateLayersPanel();
    };

    const bottomBtn = document.createElement('button');
    bottomBtn.textContent = '⬇️';
    bottomBtn.onclick = (e) => {
      e.stopPropagation();
      canvas.sendToBack(obj);
      updateLayersPanel();
    };

    const delBtn = document.createElement('button');
    delBtn.textContent = '🗑';
    delBtn.onclick = (e) => {
      e.stopPropagation();
      canvas.remove(obj);
      updateLayersPanel();
    };

    actionsDiv.append(renameBtn, lockBtn, eyeBtn, topBtn, bottomBtn, delBtn);
    layerDiv.appendChild(actionsDiv);

    layerDiv.addEventListener('click', () => {
      canvas.setActiveObject(obj);
      canvas.renderAll();
      updateLayersPanel();
    });

    layersContainer.appendChild(layerDiv);
  });
}



// Add new blank layer (empty rect for demo)..............................................................

document.getElementById('add-layer').addEventListener('click', () => {
  const rect = new fabric.Rect({
    left: 100, top: 100,
    width: 100, height: 60,
    fill: '#cccccc',
    stroke: '#000000',
    strokeWidth: 1
  });
  rect.layerName = `Layer ${canvas.getObjects().length + 1}`;
  canvas.add(rect);
  updateLayersPanel();
});



// REORDER LAYERS..............................................

function reorderLayers(fromIndex, toIndex) {
  const objects = canvas.getObjects().slice().reverse(); // UI list
  const movingObj = objects[fromIndex];
  objects.splice(fromIndex, 1);
  objects.splice(toIndex, 0, movingObj);

  // Rebuild canvas stacking order from rearranged list
  canvas._objects = objects.reverse(); // put back in Fabric's order
  canvas.renderAll();
  updateLayersPanel();
}
