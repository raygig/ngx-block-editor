import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

import { FsHtmlEditorModule } from '@firestitch/html-editor';
import { FsColorPickerModule } from '@firestitch/colorpicker';
import { FsFileModule } from '@firestitch/file';

import { NgxMoveableModule } from 'ngx-moveable';

import { FsBlockComponent } from './components/block/block.component';
import { FsBlockEditorComponent } from './components/block-editor/block-editor.component';
import { FsBlockEditorSidebarPanelDirective } from './directives/block-editor-sidebar-panel.directive';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,

    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,

    FsHtmlEditorModule,
    FsFileModule,
    FsColorPickerModule,

    NgxMoveableModule,
  ],
  exports: [
    FsBlockComponent,
    FsBlockEditorComponent,
    FsBlockEditorSidebarPanelDirective,
  ],
  declarations: [
    FsBlockComponent,
    FsBlockEditorComponent,
    FsBlockEditorSidebarPanelDirective,
  ],
})
export class FsBlockEditorModule {
  static forRoot(): ModuleWithProviders<FsBlockEditorModule> {
    return {
      ngModule: FsBlockEditorModule,
    };
  }
}
