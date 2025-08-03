
// TEXT PANEL CONTROL ......................................................

// ----------------------
// TEXT PANEL CONTROLS
// ----------------------
const fontFamilySelect = document.getElementById('fontFamily');
const fontSizeInput = document.getElementById('fontSize');
const boldBtn = document.getElementById('boldBtn');
const italicBtn = document.getElementById('italicBtn');
const underlineBtn = document.getElementById('underlineBtn');
const strikeBtn = document.getElementById('strikeBtn');

const alignLeftBtn = document.getElementById('alignLeft');
const alignCenterBtn = document.getElementById('alignCenter');
const alignRightBtn = document.getElementById('alignRight');

// Helper to update selected text object
function updateTextProperty(property, value) {
  const obj = canvas.getActiveObject();
  if (obj && obj.type === 'i-text') {
    obj.set(property, value);
    canvas.renderAll();
  }
}

// Font family change
fontFamilySelect.addEventListener('change', () => {
  updateTextProperty('fontFamily', fontFamilySelect.value);
});

// Font size change
fontSizeInput.addEventListener('input', () => {
  updateTextProperty('fontSize', parseInt(fontSizeInput.value));
});

// Bold toggle
boldBtn.addEventListener('click', () => {
  const obj = canvas.getActiveObject();
  if (obj && obj.type === 'i-text') {
    obj.set('fontWeight', obj.fontWeight === 'bold' ? 'normal' : 'bold');
    canvas.renderAll();
  }
});

// Italic toggle
italicBtn.addEventListener('click', () => {
  const obj = canvas.getActiveObject();
  if (obj && obj.type === 'i-text') {
    obj.set('fontStyle', obj.fontStyle === 'italic' ? 'normal' : 'italic');
    canvas.renderAll();
  }
});

// Underline toggle
underlineBtn.addEventListener('click', () => {
  const obj = canvas.getActiveObject();
  if (obj && obj.type === 'i-text') {
    obj.set('underline', !obj.underline);
    canvas.renderAll();
  }
});

// Strikethrough toggle
strikeBtn.addEventListener('click', () => {
  const obj = canvas.getActiveObject();
  if (obj && obj.type === 'i-text') {
    obj.set('linethrough', !obj.linethrough);
    canvas.renderAll();
  }
});

// Alignment
alignLeftBtn.addEventListener('click', () => {
  updateTextProperty('textAlign', 'left');
});
alignCenterBtn.addEventListener('click', () => {
  updateTextProperty('textAlign', 'center');
});
alignRightBtn.addEventListener('click', () => {
  updateTextProperty('textAlign', 'right');
});






// ----------------------
// OPTIONAL: Auto-update panel when selecting text..............................................
// ----------------------
canvas.on('selection:created', syncTextPanel);
canvas.on('selection:updated', syncTextPanel);



function syncTextPanel(obj) {
  if (obj && obj.type === 'i-text') {
    fontFamilySelect.value = obj.fontFamily || 'Arial';
    fontSizeInput.value = obj.fontSize || 32;
    boldBtn.classList.toggle('active', obj.fontWeight === 'bold');
    italicBtn.classList.toggle('active', obj.fontStyle === 'italic');
    underlineBtn.classList.toggle('active', !!obj.underline);
    strikeBtn.classList.toggle('active', !!obj.linethrough);

    alignLeftBtn.classList.toggle('active', obj.textAlign === 'left');
    alignCenterBtn.classList.toggle('active', obj.textAlign === 'center');
    alignRightBtn.classList.toggle('active', obj.textAlign === 'right');
  }
}

// Update when selecting
canvas.on('selection:created', (e) => {
  const obj = e.selected[0];
  syncTextPanel(obj);
});
canvas.on('selection:updated', (e) => {
  const obj = e.selected[0];
  syncTextPanel(obj);
});

// Update live while typing
canvas.on('text:changed', (e) => {
  syncTextPanel(e.target);
});






// ----------------------
// BLEND MODE CONTROL............................................................
// ----------------------
const blendModeSelect = document.getElementById('blendMode');

function updateBlendMode(mode) {
  const obj = canvas.getActiveObject();
  if (obj) {
    obj.globalCompositeOperation = mode;
    canvas.renderAll();
  }
}

// Sync blend mode panel when selecting objects
canvas.on('selection:created', (e) => {
  const obj = e.selected[0];
  if (obj && obj.globalCompositeOperation) {
    blendModeSelect.value = obj.globalCompositeOperation;
  } else {
    blendModeSelect.value = 'normal';
  }
});

canvas.on('selection:updated', (e) => {
  const obj = e.selected[0];
  if (obj && obj.globalCompositeOperation) {
    blendModeSelect.value = obj.globalCompositeOperation;
  } else {
    blendModeSelect.value = 'normal';
  }
});








// ----------------------
// PROPERTIES PANEL..................................................................
// ----------------------
const propLeft = document.getElementById('propLeft');
const propTop = document.getElementById('propTop');
const propWidth = document.getElementById('propWidth');
const propHeight = document.getElementById('propHeight');
const propAngle = document.getElementById('propAngle');

// Update object when property changes
function updateProperty(prop) {
  const obj = canvas.getActiveObject();
  if (!obj) return;

  const value = parseFloat(document.getElementById(`prop${capitalize(prop)}`).value) || 0;

  if (prop === 'width') {
    obj.set({ scaleX: value / obj.width });
  } 
  else if (prop === 'height') {
    obj.set({ scaleY: value / obj.height });
  } 
  else if (prop === 'angle') {
    obj.rotate(value);
  } 
  else {
    obj.set(prop, value);
  }

  canvas.renderAll();
}

// Capitalize helper
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Update panel fields
function updatePropertiesPanel(obj) {
  if (!obj) return;
  propLeft.value = Math.round(obj.left || 0);
  propTop.value = Math.round(obj.top || 0);
  propWidth.value = Math.round(obj.width * obj.scaleX || 0);
  propHeight.value = Math.round(obj.height * obj.scaleY || 0);
  propAngle.value = Math.round(obj.angle || 0);
}

// Sync when selecting an object
canvas.on('selection:created', (e) => updatePropertiesPanel(e.selected[0]));
canvas.on('selection:updated', (e) => updatePropertiesPanel(e.selected[0]));

// 🔹 Live update while moving, scaling, or rotating
canvas.on('object:moving', (e) => updatePropertiesPanel(e.target));
canvas.on('object:scaling', (e) => updatePropertiesPanel(e.target));
canvas.on('object:rotating', (e) => updatePropertiesPanel(e.target));






// ----------------------
// EFFECTS PANEL...............................................................................

// ----------------------
const dropShadowToggle = document.getElementById('dropShadowToggle');
const glowToggle = document.getElementById('glowToggle');
const outerGlowToggle = document.getElementById('outerGlowToggle');

const blurSlider = document.getElementById('blurSlider');
const offsetXSlider = document.getElementById('offsetXSlider');
const offsetYSlider = document.getElementById('offsetYSlider');
const opacitySlider = document.getElementById('opacitySlider');
const shadowColorPicker = document.getElementById('shadowColorPicker');

// Apply shadow effect
function applyShadowEffect() {
  const obj = canvas.getActiveObject();
  if (!obj) return;

  if (dropShadowToggle.checked || glowToggle.checked || outerGlowToggle.checked) {
    obj.set('shadow', {
      color: shadowColorPicker.value,
      blur: parseFloat(blurSlider.value),
      offsetX: parseFloat(offsetXSlider.value),
      offsetY: parseFloat(offsetYSlider.value),
      opacity: parseFloat(opacitySlider.value)
    });
  } else {
    obj.set('shadow', null);
  }

  canvas.renderAll();
}

// Event listeners
[dropShadowToggle, glowToggle, outerGlowToggle, blurSlider, offsetXSlider, offsetYSlider, opacitySlider, shadowColorPicker]
.forEach(input => {
  input.addEventListener('input', applyShadowEffect);
});

// Sync panel when selecting an object
canvas.on('selection:created', syncEffectsPanel);
canvas.on('selection:updated', syncEffectsPanel);

function syncEffectsPanel(e) {
  const obj = e.selected[0];
  if (!obj) return;

  const shadow = obj.shadow;
  if (shadow) {
    blurSlider.value = shadow.blur || 0;
    offsetXSlider.value = shadow.offsetX || 0;
    offsetYSlider.value = shadow.offsetY || 0;
    opacitySlider.value = shadow.opacity || 1;
    shadowColorPicker.value = shadow.color || '#000000';
    dropShadowToggle.checked = true;
  } else {
    dropShadowToggle.checked = false;
    glowToggle.checked = false;
    outerGlowToggle.checked = false;
  }
}



//

document.addEventListener('DOMContentLoaded', () => {
  const option1Btn = document.getElementById('option1-btn');
  const option2Btn = document.getElementById('option2-btn');
  const panel1 = document.getElementById('vector-properties1');
  const panel2 = document.getElementById('vector-properties2');

  // Start: Panel 1 visible, Panel 2 hidden
  panel1.classList.remove('hidden');
  panel2.classList.add('hidden');

  // Option 1 button
  option1Btn.addEventListener('click', () => {
    panel1.classList.remove('hidden');
    panel2.classList.add('hidden');
  });

  // Option 2 button
  option2Btn.addEventListener('click', () => {
    panel2.classList.remove('hidden');
    panel1.classList.add('hidden');
  });
});

