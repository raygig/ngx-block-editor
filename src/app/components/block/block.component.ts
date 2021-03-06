import { skipWhile, takeUntil } from 'rxjs/operators';
import {
  AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef,
  EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild,
} from '@angular/core';

import { FsHtmlEditorComponent, FsHtmlEditorConfig } from '@firestitch/html-editor';

import Moveable from 'moveable';
import { fromEvent, Subject } from 'rxjs';

import { BlockEditorService } from './../../services/block-editor.service';
import { Block } from './../../interfaces/block';

@Component({
  selector: 'fs-block',
  templateUrl: 'block.component.html',
  styleUrls: [ 'block.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FsBlockComponent implements OnDestroy, AfterContentInit, OnInit {

  @ViewChild('element', { static: true })
  public element: ElementRef;

  @ViewChild('content', { static: true })
  public content: ElementRef;

  @ViewChild('contentEditable', { static: true })
  public contentEditable: ElementRef;

  @ViewChild(FsHtmlEditorComponent)
  public htmlEditor: FsHtmlEditorComponent;

  @Input() public block: Block<any>;
  @Input() public html: string;

  @Output() changed = new EventEmitter<Block<any>>();

  public matrix;
  public justifyContent;
  public htmlConfig: FsHtmlEditorConfig = {};

  private _moveable;
  private _editable = false;
  private _selectedElements = [];
  private _destroy$ = new Subject();

  constructor(
    private _service: BlockEditorService,
    private _elementRef: ElementRef,
    private _cdRef: ChangeDetectorRef,
  ) { }

  public get el(): any {
    return this.element.nativeElement;
  }

  public get moveable(): any {
    return this._moveable;
  }

  public get editable(): any {
    return this._editable;
  }

  public set elementGuidelines(value) {
    this._moveable.elementGuidelines = value;
  }

  public set editable(value) {
    this._editable = value;

    if (!value) {
      this.deselect();
    }
  }

  public set clippable(value) {
    this._moveable.clippable = value;
  }

  public set transformable(value) {
    this.moveable.draggable = value;
    this.moveable.resizable = value;
    this.moveable.draggable = value;
    this.moveable.roundable = value;
    this.moveable.rotatable = value;
  }

  public set lineHeight(value) {
    this.block.lineHeight = value;
    this.markForCheck();
    this._triggerChanged();
  }

  public set fontSize(value) {
    this.block.fontSize = value;
    this.markForCheck();
    this._triggerChanged();
  }

  public set backgroundColor(value) {
    this.block.backgroundColor = value;
    this.markForCheck();
    this._triggerChanged();
  }

  public set shapeRadius(value) {
    this.block.shapeRadius = value;
    this.markForCheck();
    this._triggerChanged();
  }

  public set index(value) {
    this.block.index = value;
    this.markForCheck();
  }

  public set borderColor(value) {
    this.block.borderColor = value;
    this.markForCheck();
    this._triggerChanged();
  }

  public padding(name, value) {
    this.block[name] = value;
    this.markForCheck();
    this._triggerChanged();
  }

  public set imageUrl(value) {
    this.block.imageUrl = value;
    this.markForCheck();
    this._triggerChanged();
  }

  public set fontColor(value) {
    this.block.fontColor = value;
    this.markForCheck();
    this._triggerChanged();
  }

  public set verticalAlign(value) {
    this.block.verticalAlign = value;
    this.markForCheck();
    this._triggerChanged();
  }

  public shapeRound(name, value) {
    this.block[name] = value;
    this.markForCheck();
    this._triggerChanged();
  }

  public set horizontalAlign(value) {
    this.block.horizontalAlign = value;
    this.markForCheck();
    this._triggerChanged();
  }

  public set italic(value) {
    this.block.italic = value;
    this.markForCheck();
    this._triggerChanged();
  }

  public get italic() {
    return this.block.italic;
  }

  public set bold(value) {
    this.block.bold = value;
    this.markForCheck();
    this._triggerChanged();
  }

  public get bold() {
    return this.block.bold;
  }

  public set underline(value) {
    this.block.underline = value;
    this.markForCheck();
    this._triggerChanged();
  }

  public get underline() {
    return this.block.underline;
  }

  public markForCheck(): void {
    this._cdRef.markForCheck();
  }

  public ngOnInit(): void {

    Object.assign(
      this.block,
      {
        shapeBottomLeft: 'round',
        shapeTopLeft: 'round',
        shapeTopRight: 'round',
        shapeBottomRight: 'round',
        verticalAlign: 'top',
        horizontalAlign: 'left',
      });

    this.htmlConfig = {
      autofocus: false,
      froalaConfig: {}
    };
  }

  public saveSelectedElements(): void {
    this._selectedElements = this.htmlEditor.editor.selection.blocks();
  }

  public clearSelectedElements(): void {
    this._selectedElements = [];
  }

  public ngAfterContentInit(): void {
    this.el.style.width = `${this.block.width}px`;
    this.el.style.height = `${this.block.height}px`;
    this.el.style.top = `${this.block.top}px`;
    this.el.style.left = `${this.block.left}px`;
    this._setTransform();

    fromEvent(this.el, 'mousedown')
      .pipe(
        takeUntil(this._destroy$),
      ).subscribe((event: UIEvent) => {

        if (this.editable) {
          if (this.content.nativeElement.isSameNode(event.target)) {
            event.preventDefault();
            event.stopImmediatePropagation();
            event.stopPropagation();
          }
        } else {
          this._service.selectedBlocks = [this];
        }
      });

    fromEvent(this.el, 'dblclick')
      .pipe(
        skipWhile(() => {
          return this.editable;
        }),
        takeUntil(this._destroy$),
      )
      .subscribe((e) => {
        this.editable = true;

        setTimeout(() => {
          this.selectAll();
        });
    });

    this._moveable = new Moveable(this._elementRef.nativeElement, {
      target: this.el,
      container: this._service.container,
      draggable: false,
      resizable: false,
      scalable: false,
      rotatable: false,
      warpable: false,
      origin: false,
      keepRatio: false,
      snappable: true,
      snapHorizontal: true,
      snapVertical: true,
      snapCenter: true,
      snapElement: true,
      edge: false,
      throttleDrag: 1,
      throttleScale: 0.01,
      throttleRotate: 0.2,
      throttleResize: 1,
    });

    this._service.registerBlock(this);

    this._moveable
    .on('clip', e => {
        this.block.clipPath = e.clipStyle;
      e.target.style.clipPath = e.clipStyle;
      this._triggerChanged();
    }).on('clipEnd', e => {
       //this._triggerChanged();
    });

    this._moveable.on('dragStart', ({ target, clientX, clientY }) => {
      this.editable = false;
    }).on('drag', ({ target, left, top }) => {
      target!.style.left = `${left}px`;
      target!.style.top = `${top}px`;
      this.block.top = top;
      this.block.left = left;
      this._triggerChanged();
    }).on('dragEnd', ({ target, isDrag, clientX, clientY }) => {
      //this._triggerChanged();
    });

    this._moveable.on('resizeStart', ({ target, clientX, clientY }) => {
      this.editable = false;
    }).on('resize', ({ target, width, height, dist, delta, clientX, clientY, direction }) => {

      if (delta[0]) {
        this.block.width = width;
        target!.style.width = `${width}px`;
      }

      if (delta[1]) {
        this.block.height = height;
        target!.style.height = `${height}px`;
      }

      const transform = [0, 0];
      if (direction[1] === -1) {
        transform[1] = dist[1] * -1;
      }

      if (direction[0] === -1) {
        transform[0] = dist[0] * -1;
      }

      this._setTransform([`translate(${transform[0]}px, ${transform[1]}px)`]);

      this._triggerChanged();

    }).on('resizeEnd', ({ target }) => {
      const matrix = new WebKitCSSMatrix(target.style.transform);
      this.block.top = parseInt(target.style.top) + matrix.m42;
      this.block.left = parseInt(target.style.left) + matrix.m41;

      target.style.top = `${this.block.top}px`;
      target.style.left = `${this.block.left}px`;
      this._setTransform();
      this._triggerChanged();
    });

    this._moveable.on('rotateStart', ({ target, clientX, clientY }) => {
      this.editable = false;
    }).on('rotate', ({ target, rotate, delta, dist, transform, clientX, clientY }) => {
      this.block.rotate = dist;
      //this._setTransform();
      this.el.style.transform = transform;
      this._triggerChanged();
    }).on('rotateEnd', ({ target, isDrag, clientX, clientY }) => {
      //this._triggerChanged();
    });

  }

  public deselect() {
    if (window.getSelection) {
      if (window.getSelection().empty) {
        window.getSelection().empty();
      } else if (window.getSelection().removeAllRanges) {
        window.getSelection().removeAllRanges();
      }
    }
  }

  public selectAll(): void {
    const range = document.createRange();
    //const el = this.htmlEditor.editor.$el.get(0);
    range.selectNodeContents(this.contentEditable.nativeElement);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private _setTransform(transforms = []): void {
    transforms = transforms ?? [];

    if (this.block.rotate) {
      transforms.push(`rotate(${this.block.rotate}deg)`);
    }

    this.el.style.transform = transforms.join(' ');
  }

  private _triggerChanged() {
    this.changed.emit(this.block);
  }
}
