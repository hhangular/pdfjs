import {ApplicationRef, ComponentFactoryResolver, ComponentRef, CUSTOM_ELEMENTS_SCHEMA, EmbeddedViewRef, Injector, ModuleWithProviders, NgModule, Optional, SkipSelf} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PdfjsCommonComponent} from './components/pdfjs-common.component';
import {PdfjsConfig} from './classes/pdfjs-objects';
import {PdfjsControl} from './classes/pdfjs-control';
import {PdfjsRemoveButtonComponent} from './components/pdfjs-thumbnail/pdfjs-remove.button/pdfjs-remove-button.component';
import {PdfjsThumbnailComponent} from './components/pdfjs-thumbnail/pdfjs-thumbnail.component';
import {PdfjsThumbnailsComponent} from './components/pdfjs-thumbnails/pdfjs-thumbnails.component';
import {PdfjsViewComponent} from './components/pdfjs-view/pdfjs-view.component';
import {ThumbnailDragService} from './services/thumbnail-drag.service';
import {KeysService} from './services/keys.service';
import {Pdfjs} from './services/pdfjs.service';

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    PdfjsCommonComponent,
    PdfjsThumbnailsComponent,
    PdfjsThumbnailComponent,
    PdfjsRemoveButtonComponent,
    PdfjsViewComponent
  ],
  declarations: [
    PdfjsCommonComponent,
    PdfjsThumbnailsComponent,
    PdfjsThumbnailComponent,
    PdfjsRemoveButtonComponent,
    PdfjsViewComponent
  ],
  providers: [
    Pdfjs,
    ThumbnailDragService,
    KeysService,
  ],
  entryComponents: [
    PdfjsCommonComponent // dynamic component
  ], schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class PdfjsBoxModule {
  static forRoot(config: PdfjsConfig): ModuleWithProviders {
    return {
      ngModule: PdfjsBoxModule,
      providers: [
        {provide: PdfjsConfig, useValue: config}
      ]
    };
  }

  /**
   * Constructor, prevent circular injection
   */
  constructor(@Optional() @SkipSelf() parentModule: PdfjsBoxModule,
              private cfr: ComponentFactoryResolver,
              private defaultInjector: Injector,
              private appRef: ApplicationRef,
              config: PdfjsConfig
  ) {
    if (parentModule) {
      throw new Error(
        'PdfjsBoxModule is already loaded. Import it in the AppModule only');
    }
    PdfjsControl.API.GlobalWorkerOptions.workerSrc = config.workerSrc;
    this.addPdfjsCommonComponentToDom();
  }

  /**
   * add PdfjsCommonComponent to dom
   */
  private addPdfjsCommonComponentToDom() {
    const componentFactory = this.cfr.resolveComponentFactory(PdfjsCommonComponent);
    const componentRef: ComponentRef<PdfjsCommonComponent> = componentFactory.create(this.defaultInjector);
    this.appRef.attachView(componentRef.hostView);
    const componentElement = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
    document.body.appendChild(componentElement);
  }
}
