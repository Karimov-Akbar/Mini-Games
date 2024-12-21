class ColoringPage {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.container.appendChild(this.canvas);

    this.width = 600;
    this.height = 400;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.currentColor = '#000000';
    this.brushSize = 5;
    this.isDrawing = false;
    this.shapes = [];
    this.mode = null;

    this.setupUI();
    this.setupEventListeners();
    this.clearCanvas();
  }

  setupUI() {
    const uiContainer = document.createElement('div');
    uiContainer.className = 'coloring-ui';
    uiContainer.innerHTML = `
      <div class="canvas-container">
        <canvas id="drawing-canvas"></canvas>
      </div>
      <div class="controls-container">
        <div class="mode-selection">
          <button id="draw-mode-btn">Free Drawing</button>
          <button id="shapes-mode-btn">Decorate Shapes</button>
        </div>
        <div class="drawing-tools" style="display: none;">
          <input type="color" id="color-picker" value="#000000">
          <input type="range" id="brush-size" min="1" max="20" value="5">
          <button id="clear-btn">Clear</button>
          <button id="save-btn">Save</button>
        </div>
      </div>
    `;
    this.container.innerHTML = '';
    this.container.appendChild(uiContainer);

    this.canvas = document.getElementById('drawing-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.drawModeBtn = document.getElementById('draw-mode-btn');
    this.shapesModeBtn = document.getElementById('shapes-mode-btn');
    this.drawingTools = document.querySelector('.drawing-tools');
    this.colorPicker = document.getElementById('color-picker');
    this.brushSizeInput = document.getElementById('brush-size');
    this.clearBtn = document.getElementById('clear-btn');
    this.saveBtn = document.getElementById('save-btn');
  }

  setupEventListeners() {
    this.drawModeBtn.addEventListener('click', () => this.setMode('draw'));
    this.shapesModeBtn.addEventListener('click', () => this.setMode('shapes'));

    this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
    this.canvas.addEventListener('mousemove', (e) => this.draw(e));
    this.canvas.addEventListener('mouseup', () => this.stopDrawing());
    this.canvas.addEventListener('mouseout', () => this.stopDrawing());

    this.colorPicker.addEventListener('change', (e) => this.setColor(e.target.value));
    this.brushSizeInput.addEventListener('input', (e) => this.setBrushSize(e.target.value));
    this.clearBtn.addEventListener('click', () => this.clearCanvas());
    this.saveBtn.addEventListener('click', () => this.saveImage());
  }

  setMode(mode) {
    this.mode = mode;
    this.clearCanvas();
    this.drawingTools.style.display = 'flex';
    if (mode === 'shapes') {
      this.createShapes();
    }
  }

  createShapes() {
    this.shapes = [
      { type: 'circle', x: 100, y: 100, radius: 50 },
      { type: 'rectangle', x: 200, y: 200, width: 100, height: 80 },
      { type: 'triangle', points: [[400, 100], [350, 200], [450, 200]] }
    ];
    this.drawShapes();
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

  startDrawing(e) {
    this.isDrawing = true;
    this.draw(e);
  }

  draw(e) {
    if (!this.isDrawing) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    this.ctx.lineWidth = this.brushSize;
    this.ctx.lineCap = 'round';
    this.ctx.strokeStyle = this.currentColor;

    this.ctx.lineTo(x, y);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
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

  clearCanvas() {
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, this.width, this.height);
    if (this.mode === 'shapes') {
      this.drawShapes();
    }
  }

  saveImage() {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = this.width;
    tempCanvas.height = this.height;
    const tempCtx = tempCanvas.getContext('2d');

    tempCtx.fillStyle = 'white';
    tempCtx.fillRect(0, 0, this.width, this.height);

    tempCtx.drawImage(this.canvas, 0, 0);

    const link = document.createElement('a');
    link.download = 'coloring-page.png';
    link.href = tempCanvas.toDataURL();
    link.click();
  }

  start() {
    this.clearCanvas();
  }
}

export default ColoringPage;