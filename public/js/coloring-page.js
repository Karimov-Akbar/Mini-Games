class ColoringPage {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.mode = 'draw';
    this.currentColor = '#000000';
    this.brushSize = 5;
    this.isDrawing = false;
    this.lastX = 0;
    this.lastY = 0;

    this.width = 600;
    this.height = 450;

    this.shapes = [
      { type: 'circle', x: 100, y: 100, radius: 50 },
      { type: 'rectangle', x: 200, y: 200, width: 100, height: 80 },
      { type: 'triangle', points: [[400, 100], [350, 200], [450, 200]] }
    ];

    this.setupUI();
  }

  setupUI() {
    // Create UI container
    const uiContainer = document.createElement('div');
    uiContainer.className = 'coloring-ui';
    this.container.appendChild(uiContainer);

    // Create canvas container
    const canvasContainer = document.createElement('div');
    canvasContainer.className = 'canvas-container';
    uiContainer.appendChild(canvasContainer);

    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.ctx = this.canvas.getContext('2d');
    canvasContainer.appendChild(this.canvas);

    // Create controls container
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'controls-container';
    uiContainer.appendChild(controlsContainer);

    // Mode selection
    const modeSelection = document.createElement('div');
    modeSelection.className = 'mode-selection';
    controlsContainer.appendChild(modeSelection);

    this.drawModeBtn = document.createElement('button');
    this.drawModeBtn.textContent = 'Free Draw';
    this.drawModeBtn.addEventListener('click', () => this.setMode('draw'));
    modeSelection.appendChild(this.drawModeBtn);

    this.shapesModeBtn = document.createElement('button');
    this.shapesModeBtn.textContent = 'Color Shapes';
    this.shapesModeBtn.addEventListener('click', () => this.setMode('shapes'));
    modeSelection.appendChild(this.shapesModeBtn);

    // Drawing tools
    const drawingTools = document.createElement('div');
    drawingTools.className = 'drawing-tools';
    controlsContainer.appendChild(drawingTools);

    // Color picker
    const colorPicker = document.createElement('input');
    colorPicker.type = 'color';
    colorPicker.id = 'color-picker';
    colorPicker.addEventListener('change', (e) => this.setColor(e.target.value));
    drawingTools.appendChild(colorPicker);

    // Brush size
    const brushSize = document.createElement('input');
    brushSize.type = 'range';
    brushSize.id = 'brush-size';
    brushSize.min = '1';
    brushSize.max = '50';
    brushSize.value = '5';
    brushSize.addEventListener('input', (e) => this.setBrushSize(e.target.value));
    drawingTools.appendChild(brushSize);

    // Clear button
    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Clear';
    clearBtn.id = 'clear-btn';
    clearBtn.addEventListener('click', () => this.clearCanvas());
    drawingTools.appendChild(clearBtn);

    // Save button
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save';
    saveBtn.id = 'save-btn';
    saveBtn.addEventListener('click', () => this.saveImage());
    drawingTools.appendChild(saveBtn);

    // Set initial state
    this.clearCanvas();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Mouse events
    this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
    this.canvas.addEventListener('mousemove', (e) => this.draw(e));
    this.canvas.addEventListener('mouseup', () => this.stopDrawing());
    this.canvas.addEventListener('mouseout', () => this.stopDrawing());

    // Touch events
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      this.startDrawing(mouseEvent);
    }, { passive: false });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      this.draw(mouseEvent);
    }, { passive: false });

    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.stopDrawing();
    }, { passive: false });

    this.canvas.addEventListener('touchcancel', (e) => {
      e.preventDefault();
      this.stopDrawing();
    }, { passive: false });
  }

  getCanvasPoint(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  startDrawing(e) {
    this.isDrawing = true;
    const point = this.getCanvasPoint(e.clientX, e.clientY);
    this.lastX = point.x;
    this.lastY = point.y;
    this.draw(e);
  }

  draw(e) {
    if (!this.isDrawing) return;

    const point = this.getCanvasPoint(e.clientX, e.clientY);
    const x = point.x;
    const y = point.y;

    this.ctx.lineWidth = this.brushSize;
    this.ctx.lineCap = 'round';
    this.ctx.strokeStyle = this.currentColor;

    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();

    this.lastX = x;
    this.lastY = y;
  }

  stopDrawing() {
    this.isDrawing = false;
    this.ctx.beginPath();
  }

  setColor(color) {
    this.currentColor = color;
  }

  setBrushSize(size) {
    this.brushSize = size;
  }

  setMode(mode) {
    this.mode = mode;
    this.clearCanvas();
    if (mode === 'shapes') {
      this.drawShapes();
    }
  }

  drawShapes() {
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 2;

    this.shapes.forEach(shape => {
      this.ctx.beginPath();
      if (shape.type === 'circle') {
        this.ctx.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
      } else if (shape.type === 'rectangle') {
        this.ctx.rect(shape.x, shape.y, shape.width, shape.height);
      } else if (shape.type === 'triangle') {
        this.ctx.moveTo(shape.points[0][0], shape.points[0][1]);
        this.ctx.lineTo(shape.points[1][0], shape.points[1][1]);
        this.ctx.lineTo(shape.points[2][0], shape.points[2][1]);
        this.ctx.closePath();
      }
      this.ctx.stroke();
    });
  }

  clearCanvas() {
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, this.width, this.height);
    if (this.mode === 'shapes') {
      this.drawShapes();
    }
  }

  saveImage() {
    const link = document.createElement('a');
    link.download = 'coloring-page.png';
    link.href = this.canvas.toDataURL();
    link.click();
  }

  start() {
    
  }
}

export default ColoringPage;