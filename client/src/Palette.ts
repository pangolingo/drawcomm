import { ColorId, BrushSize } from './types';

export default class Palette {
  // http://perfectionkills.com/exploring-canvas-drawing-techniques/
  public readonly brushAngle: number = 1 / 2;

  // https://colorhunt.co/
  public readonly colors: Array<string> = ["#f65c78", "#ffd271", "#fff3af", "#c3f584", "#ffffff"];

  private currentColor: ColorId = 0;

  private currentBrushSize: number = 5;

  private colorButtons: NodeListOf<HTMLElement>;

  private brushSizeButtons: NodeListOf<HTMLElement>;

  private el: HTMLElement;

  constructor(paletteEl: HTMLElement) {
    this.el = paletteEl;
    this.colorButtons = this.el.querySelectorAll('.color-palette__swatch');
    this.brushSizeButtons = this.el.querySelectorAll('.brush-size-palette__swatch');

    this.colorizeSwatches();
    this.scaleBrushSizeSwatches();
    this.setCurrentColor(this.currentColor);
    this.setCurrentBrushSize(this.currentBrushSize);

    this.colorButtons.forEach((item: HTMLElement) => {
      item.addEventListener('click', this.onColorSelect.bind(this));
    });
    this.brushSizeButtons.forEach((item: HTMLElement) => {
      item.addEventListener('click', this.onBrushSizeSelect.bind(this));
    });
  }

  private colorizeSwatches() {
    this.colorButtons.forEach((item: HTMLElement) => {
      const colorId = parseInt(item.dataset.color, 10);
      item.style.backgroundColor = this.colors[colorId];
    });
  }

  private scaleBrushSizeSwatches() {
    this.brushSizeButtons.forEach((item: HTMLElement) => {
      const brushSize: string = item.dataset.size;
      const demo: HTMLElement = item.querySelector('.brush-size-palette__swatch__demo');
      demo.style.width = `${brushSize}px`;
      demo.style.height = `${brushSize}px`;
    });
  }

  public setCurrentColor(colorId: ColorId) {
    if (colorId < 0 || colorId >= this.colors.length) {
      throw new Error(`Invalid color id ${colorId}`);
    }
    this.currentColor = colorId;

    // select the swatch
    this.colorButtons.forEach((item: HTMLElement) => {
      if(item.dataset.color === this.currentColor.toString()){
        item.classList.add('color-palette__swatch--selected');
        return;
      }
      item.classList.remove('color-palette__swatch--selected');
    });
  }

  public setCurrentBrushSize(brushSizeId: number) {
    this.currentBrushSize = brushSizeId;

    // select the swatch
    this.brushSizeButtons.forEach((item: HTMLElement) => {
      if(item.dataset.size === this.currentBrushSize.toString()){
        item.classList.add('brush-size-palette__swatch--selected');
        return;
      }
      item.classList.remove('brush-size-palette__swatch--selected');
    });
  }

  private onColorSelect(e: Event) {
    const target = <HTMLElement>e.currentTarget;
    const colorId = parseInt(target.dataset.color, 10);
    this.setCurrentColor(colorId);
  }

  private onBrushSizeSelect(e: Event) {
    const target = <HTMLElement>e.currentTarget;
    const brushSize: number = parseInt(target.dataset.size, 10);
    this.setCurrentBrushSize(brushSize);
  }

  public getColorValue(colorId: ColorId): string {
    return this.colors[colorId];
  }

  public getCurrentColorValue(): string {
    return this.colors[this.currentColor];
  }

  public getCurrentColorId(): ColorId {
    return this.currentColor;
  }

  public getCurrentBrushSize(): BrushSize {
    return this.currentBrushSize;
  }
}
