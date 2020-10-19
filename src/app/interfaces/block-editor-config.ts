import { Observable } from 'rxjs';
import { Block } from './block';

export interface BlockEditorConfig {
  unit?: 'in' | 'px';
  width?: number;
  height?: number;
  blocks?: Block<any>[],
  blockChanged?: (block: Block<any>) => void;
  blockAdded?: (block: Block<any>) => void;
  blocksRemoved?: (block: Block<any>[]) => void;
  blocksLevelChanged?: (blocks: Block<any>[]) => void;
  blocksSelected?: (blocks: Block<any>[]) => void;
  fileUpload?: (file: Blob) => Observable<string>;
}
