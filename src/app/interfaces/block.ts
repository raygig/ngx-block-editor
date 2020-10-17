import { FsBlockComponent } from './../components/block/block.component';

export type Block<T = {}> = BlockBase & T;

export interface BlockBase {
  reference: any;
  type: 'image' | 'text';
  width?: number;
  height?: number;
  top?: number;
  left?: number;
  rotate?: number;
  horizontalAlign?: 'left' | 'right' | 'center';
  verticalAlign?: 'top' | 'center' | 'bottom';
  borderColor?: string;
  fontColor?: string;
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  backgroundColor?: string;
  shapeRadius?: number;
  lineHeight?: number;
  shapeTopRight?: string;
  shapeTopLeft?: string;
  shapeBottomRight?: string;
  shapeBottomLeft?: string;
  paddingTop?: number;
  paddingLeft?: number;
  paddingBottom?: number;
  paddingRight?: number;
  content?: string;
  blockComponent?: FsBlockComponent;
  index?: number;
  imageUrl?: string;
  clipPath?: string;
}
