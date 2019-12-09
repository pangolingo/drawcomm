import { Color, ColorId, BrushSize } from './types';

export default class Palette {
  // http://perfectionkills.com/exploring-canvas-drawing-techniques/
  public readonly brushAngle: number = 1/2;

  public readonly colors: Array<Color> = [Color.Red, Color.Green, Color.Blue, Color.White];
  // readonly brushSizes: Array<BrushSize> = [2, 5, 30];
  private currentColor: ColorId = 0;
  private currentBrushSize: number = 5;

  private colorButtons: NodeListOf<HTMLElement>;
  private brushSizeButtons: NodeListOf<HTMLElement>;

  constructor() {
    this.colorButtons = document.querySelectorAll('.color-button');
    this.brushSizeButtons = document.querySelectorAll('.size-button');

    this.colorButtons.forEach((item: HTMLElement) => {
      item.addEventListener('click', this.onColorSelect.bind(this))
    });
    this.brushSizeButtons.forEach((item: HTMLElement) => {
      item.addEventListener('click', this.onBrushSizeSelect.bind(this))
    });
  }

  setColor(colorId: ColorId) {
    console.log('setting color', colorId, this.colors[colorId])
    if(colorId < 0 || colorId >= this.colors.length) {
      throw new Error(`Invalid color id ${colorId}`)
    }
    this.currentColor = colorId;
  }
  
  setBrushSize(brushSizeId: number) {
    // console.log('setting brush size', brushSizeId, this.brushSizes[brushSizeId])
    // if(brushSizeId < 0 || brushSizeId >= this.brushSizes.length) {
    //   throw new Error(`Invalid brush size id ${brushSizeId}`)
    // }
    this.currentBrushSize = brushSizeId;
  }

  onColorSelect (e: Event) {
    const target = <HTMLElement>e.currentTarget;
    const colorId = parseInt(target.dataset.color);
    this.setColor(colorId);
  }
  
  onBrushSizeSelect (e: Event) {
    const target = <HTMLElement>e.currentTarget;
    const brushSize: number = parseInt(target.dataset.size);
    this.setBrushSize(brushSize);
  }

  getColor(colorId: ColorId): Color {
    return this.colors[colorId];
  }

  getCurrentColor(): Color {
    return this.colors[this.currentColor];
  }

  getCurrentColorId(): ColorId {
    return this.currentColor;
  }

  getCurrentBrushSize(): BrushSize {
    return this.currentBrushSize;
  }
}