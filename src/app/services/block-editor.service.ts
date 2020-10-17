import { BlockScrollStrategy } from '@angular/cdk/overlay';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FsBlockComponent } from '../components/block/block.component';

@Injectable()
export class BlockEditorService {

  public container;

  public blocks: FsBlockComponent[] = [];

  private _selectionRange;
  private _selectedBlocks$ = new BehaviorSubject<FsBlockComponent[]>([]);

  constructor() {}

  public get elementGuidelines() {
    return [
      ...this.blocks.map((block) => {
        return block.el;
      }),
      this.container,
    ];
  }

  public isSelectedBlock(block) {
    return this.selectedBlocks.indexOf(block) !== -1;
  }

  public set selectedBlocks(blocks) {
    this.blocks.forEach((block) => {
      block.editable = false;
      block.transformable = blocks.indexOf(block) !== -1;
    });
    this._selectedBlocks$.next(blocks);
  }

  public get selectedBlocks() {
    return this._selectedBlocks$.getValue();
  }

  public get selectedBlocks$() {
    return this._selectedBlocks$;
  }

  public saveSelection(): void {
    const selection: any = window.getSelection();
    this._selectionRange = selection.getRangeAt(0);
  }

  public restoreSelection(): void {
    if (this._selectionRange) {
      const selection: any = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(this._selectionRange);
    }
  }

  public hasSelectionRange(): boolean {
    return this._selectionRange && (this._selectionRange.baseOffset - this._selectionRange.focusOffset) > 0;
  }

  public registerBlock(block: FsBlockComponent) {

    this.blocks.push(block);

    this.blocks.forEach((item: FsBlockComponent) => {

      const blocks = this.elementGuidelines
        .filter((el) => {
          return !el.isSameNode(item.el);
        });

      item.elementGuidelines = blocks;
    });
  }

  public registerContainer(container) {
    this.container = container;
  }
}
