import { guid } from '@firestitch/common';
import { BlockEditorConfig } from './../../interfaces/block-editor-config';
import { FsBlockComponent } from './../block/block.component';
import {
  AfterContentInit, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component,
  ContentChildren, ElementRef, Input, IterableChangeRecord, IterableDiffer, IterableDiffers,
  OnDestroy, OnInit, QueryList, TemplateRef, ViewChild, ViewChildren
} from '@angular/core';
import { fromEvent, Subject } from 'rxjs';
import { filter, take, takeUntil } from 'rxjs/operators';

import { BlockEditorService } from './../../services/block-editor.service';
import { Block } from './../../interfaces/block';
import { FsBlockEditorSidebarPanelDirective } from './../../directives/block-editor-sidebar-panel.directive';
import { FsFile } from '@firestitch/file';

@Component({
  selector: 'fs-block-editor',
  templateUrl: 'block-editor.component.html',
  styleUrls: [ 'block-editor.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    BlockEditorService,
  ]
})
export class FsBlockEditorComponent implements OnInit, AfterViewInit, OnDestroy {

  @ContentChildren(FsBlockEditorSidebarPanelDirective)
  public sidebarPanels: QueryList<FsBlockEditorSidebarPanelDirective>;

  @ViewChildren(FsBlockComponent)
  public blockComponents: QueryList<FsBlockComponent>;

  @ViewChild('artboard', { static: true })
  public artboard: ElementRef;

  @ViewChild('artboardContainer', { static: true })
  public artboardContainer: ElementRef;

  @Input() public config: BlockEditorConfig;

  public block: Block<any>;
  public clippable = false;
  public blocks: Block<any>[];

  private _destroy$ = new Subject();
  private _differ: IterableDiffer<FsBlockComponent>;

  constructor(
    private _el: ElementRef,
    private _service: BlockEditorService,
    private _cdRef: ChangeDetectorRef,
    private differs: IterableDiffers,
  ) {
    this._differ = this.differs.find([]).create(null);
  }

  public get el(): any {
    return this._el.nativeElement;
  }

  public ngOnInit(): void {
    this._service.registerContainer(this.artboard.nativeElement);

    this.blocks = this.config.blocks;
    this._updateIndexes();

    this._service.selectedBlocks$
      .pipe(
        takeUntil(this._destroy$),
    ).subscribe((blocks: FsBlockComponent[]) => {
      this.clippable = false;

      this._service.blocks.forEach((block) => {
        block.clippable = false;
      });

      if (blocks[0]) {
        this.block = blocks[0].block;
      } else {
        this.block = null;
      }
      this._cdRef.markForCheck();

      if (this.config.blocksSelected) {
        this.config.blocksSelected(blocks.map((block) => block.block));
      }
    });

    fromEvent(this.artboardContainer.nativeElement, 'mousedown')
      .pipe(
        takeUntil(this._destroy$),
      ).subscribe((e: any) => {

        const path = e.path || (e.composedPath && e.composedPath());
        const isBlock = path.some((el) => {
          return el.classList && ['moveable-control', 'block']
            .some((name) => el.classList.contains(name));
        });

        if (!isBlock) {
          this._service.selectedBlocks = [];
        }
      });
  }

  public verticalAlignClick(value): void {
    this._service.selectedBlocks.forEach((block) => {
      block.verticalAlign = value;
    });
  }

  public boldClick(): void {
    this._service.selectedBlocks.forEach((block) => {
      block.bold = !block.bold;
    });
  }

  public fontColorChange(value): void {
    this._service.selectedBlocks.forEach((block) => {
      block.fontColor = value;
    });
  }

  public lineHeightChange(value): void {
    this._service.selectedBlocks.forEach((block) => {
      block.lineHeight = parseInt(value) || '';
    });
  }

  public fontSizeChange(value): void {
    this._service.selectedBlocks.forEach((block) => {
      block.fontSize = parseInt(value) || '';
    });
  }

  public italicClick(): void {
    this._service.selectedBlocks.forEach((block) => {
      block.italic = !block.italic;
    });
  }

  public underlineClick(): void {
    this._service.selectedBlocks.forEach((block) => {
      block.underline = !block.underline;
    });
  }

  public backgroundColorChange(value): void {
    this._service.selectedBlocks.forEach((block) => {
      block.backgroundColor = value;
    });
  }

  public paddingChange(value): void {
    this._service.selectedBlocks.forEach((block) => {
      block.padding(name, parseInt(value) || 0);
    });
  }

  public borderColorChange(value): void {
    this._service.selectedBlocks.forEach((block) => {
      block.borderColor = value;
    });
  }

  public horizontalAlignClick(value): void {
    this._service.selectedBlocks.forEach((block) => {
      block.horizontalAlign = value;
    });
  }

  public shapeRound(value): void {
    this._service.selectedBlocks.forEach((block) => {
      block.shapeRound(value, block.block[value] === 'round' ? 'square' : 'round');
    });
  }

  public imageRemove(): void {
    this._service.selectedBlocks.forEach((block) => {
      block.imageUrl = null;
    });
  }

  public imageClip(value): void {
    this.clippable = !this.clippable;
    this._service.selectedBlocks.forEach((block) => {
      block.clippable = this.clippable;
    });
  }

  public shapeRadiusChange(value): void {
    this._service.selectedBlocks.forEach((block) => {
      block.shapeRadius = value;
    });
  }

  public fileSelect(fsFile: FsFile): void {
    if (this.config.fileUpload) {
      this.config.fileUpload(fsFile.file)
        .subscribe((value) => {
          this._service.selectedBlocks.forEach((block) => {
            block.imageUrl = value;
          });
        });
    }
  }

  public blockAddClick() {

    const reference = guid();
    const block: Block<any> = {
      type: 'text',
      reference,
      top: 100,
      left: 100,
      width: 300,
      height: 300,
    };

    this.addBlock(block);

    this.blockComponents.changes
      .pipe(
        take(1),
        takeUntil(this._destroy$),
       )
       .subscribe((queryList: QueryList<FsBlockComponent>) => {
          const blockComponent = queryList.find((item) => {
            return item.block.reference === reference;
          });

         if (blockComponent) {
           blockComponent.transformable = true;
           blockComponent.markForCheck();
            if (this.config.blockAdded) {
              this.config.blockAdded(blockComponent.block);
            }
         }
      });
  }

  public addBlock(block: Block<any>): void {
    this.blocks.push(block);
    this._updateIndexes();
  }

  private _updateIndexes(): void {

    const sort = this.blocks.slice().sort((a, b) => {
      return a.index > b.index ? 1 : -1;
    })

    sort.forEach((block, index) => {
      this.blocks.find((item) => {
        return block.reference === item.reference;
      }).index = index;
    });
  }

  public layerMove(direction): void {
    const items = this._service.blocks.map((blockComponent) => {
      const index = this._service.isSelectedBlock(blockComponent) ?
        blockComponent.block.index + (999 * direction) :
        blockComponent.block.index;
      return { blockComponent, index };
    });

    const sorted = items.sort((a, b) => {
      return a.index > b.index ? 1 : -1;
    });

    sorted.forEach((item, index) => {
      item.blockComponent.index = index;
      item.blockComponent.markForCheck();
    });

    if (this.config.blocksLevelChanged) {
      this.config.blocksLevelChanged(sorted.map((item) => item.blockComponent.block));
    }
  }

  public layerUp(): void {
    this.layerMove(1);
  }

  public layerDown(): void {
    this.layerMove(-1);
  }

  public getBlock(reference: any): Block<any> {
    return this.blocks.find((block) => {
      return block.reference === reference;
    });
  }

  public blockChanged(block: Block<any>): void {
    if (this.config.blockChanged) {
      this.config.blockChanged(block);
    }
  }

  public trackByBlock(block: Block<any>): string {
    return block.reference;
  }

  public ngAfterViewInit(): void {

    // this.blockComponents.forEach((blockComponent, index) => {
    //   blockComponent.block.index = index;
    // });

    // this.blockComponents.changes
    //   .pipe(
    //     takeUntil(this._destroy$),
    //    )
    //   .subscribe((queryList: QueryList<FsBlockComponent>) => {
    //     queryList.forEach((blockComponent, index) => {
    //       blockComponent.block.index = index;
    //     });
    //   });
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
