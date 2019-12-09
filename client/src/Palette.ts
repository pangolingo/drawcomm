import { Color, ColorId, BrushSize } from './types';

export default class Palette {
  // http://perfectionkills.com/exploring-canvas-drawing-techniques/
  public readonly brushAngle: number = 1 / 2;

  public readonly colors: Array<Color> = [Color.Red, Color.Green, Color.Blue, Color.White];

  private currentColor: ColorId = 0;

  private currentBrushSize: number = 5;

  private colorButtons: NodeListOf<HTMLElement>;

  private brushSizeButtons: NodeListOf<HTMLElement>;

  private el: HTMLElement;

  constructor(paletteEl: HTMLElement) {
    this.el = paletteEl;
    this.colorButtons = this.el.querySelectorAll('.color-button');
    this.brushSizeButtons = this.el.querySelectorAll('.size-button');

    this.colorButtons.forEach((item: HTMLElement) => {
      item.addEventListener('click', this.onColorSelect.bind(this));
    });
    this.brushSizeButtons.forEach((item: HTMLElement) => {
      item.addEventListener('click', this.onBrushSizeSelect.bind(this));
    });
  }

  public setColor(colorId: ColorId) {
    if (colorId < 0 || colorId >= this.colors.length) {
      throw new Error(`Invalid color id ${colorId}`);
    }
    this.currentColor = colorId;
  }

  public setBrushSize(brushSizeId: number) {
    this.currentBrushSize = brushSizeId;
  }

  private onColorSelect(e: Event) {
    const target = <HTMLElement>e.currentTarget;
    const colorId = parseInt(target.dataset.color, 10);
    this.setColor(colorId);
  }

  private onBrushSizeSelect(e: Event) {
    const target = <HTMLElement>e.currentTarget;
    const brushSize: number = parseInt(target.dataset.size, 10);
    this.setBrushSize(brushSize);
  }

  public getColor(colorId: ColorId): Color {
    return this.colors[colorId];
  }

  public getCurrentColor(): Color {
    return this.colors[this.currentColor];
  }

  public getCurrentColorId(): ColorId {
    return this.currentColor;
  }

  public getCurrentBrushSize(): BrushSize {
    return this.currentBrushSize;
  }
}
