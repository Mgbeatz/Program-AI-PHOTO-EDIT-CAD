
// Update layers items to support multi-select




let selectedLayerIndices = [];

function updateLayersPanel() {
  layersContainer.innerHTML = '';
  const objects = canvas.getObjects().slice().reverse();

  objects.forEach((obj, index) => {
    const layerDiv = document.createElement('div');
    layerDiv.className = 'layer-item';
    layerDiv.dataset.index = index;

    if (selectedLayerIndices.includes(index)) {
      layerDiv.classList.add('active');
    }

    layerDiv.draggable = true;
    layerDiv.dataset.index = index;


    // Drag events same as before.................
    
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

    const name = obj.layerName || `Layer ${objects.length - index}`;
    const nameSpan = document.createElement('span');
    nameSpan.textContent = name;
    layerDiv.appendChild(nameSpan);





    // Clicking selects/deselects.......................................

    layerDiv.addEventListener('click', (e) => {
      if (e.ctrlKey || e.metaKey) {
        // Toggle selection
        if (selectedLayerIndices.includes(index)) {
          selectedLayerIndices = selectedLayerIndices.filter(i => i !== index);
        } else {
          selectedLayerIndices.push(index);
        }
      } else {
        // Single select
        selectedLayerIndices = [index];
      }
      updateLayersPanel();
    });

    layersContainer.appendChild(layerDiv);
  });
}


// Bulk Actions Logic..............................................


function getSelectedObjects() {
  const objects = canvas.getObjects().slice().reverse();
  return selectedLayerIndices.map(i => objects[i]);
}

document.getElementById('lock-selected').addEventListener('click', () => {
  getSelectedObjects().forEach(obj => obj.selectable = false);
  updateLayersPanel();
});

document.getElementById('unlock-selected').addEventListener('click', () => {
  getSelectedObjects().forEach(obj => obj.selectable = true);
  updateLayersPanel();
});

document.getElementById('hide-selected').addEventListener('click', () => {
  getSelectedObjects().forEach(obj => obj.visible = false);
  canvas.renderAll();
  updateLayersPanel();
});

document.getElementById('show-selected').addEventListener('click', () => {
  getSelectedObjects().forEach(obj => obj.visible = true);
  canvas.renderAll();
  updateLayersPanel();
});

document.getElementById('delete-selected').addEventListener('click', () => {
  getSelectedObjects().forEach(obj => canvas.remove(obj));
  selectedLayerIndices = [];
  updateLayersPanel();
});
