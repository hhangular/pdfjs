import {
  ApplicationRef,
  ComponentFactoryResolver,
  ComponentRef, CUSTOM_ELEMENTS_SCHEMA, EmbeddedViewRef,
  Injector,
  ModuleWithProviders,
  NgModule,
  Optional,
  SkipSelf
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PDFJSBOX_COMPONENTS, PdfjsCommonComponent} from './components';
import {PDFJSBOX_SERVICES} from './services';
import {PdfjsControl} from './classes/pdfjs-control';
import {PdfjsConfig} from './classes/pdfjs-objects';

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    PDFJSBOX_COMPONENTS
  ],
  declarations: [
    PDFJSBOX_COMPONENTS
  ],
  providers: [
  PDFJSBOX_SERVICES
],
  entryComponents: [
    PdfjsCommonComponent // dynamic component
  ], schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class PdfjsBoxModule {
  static forRoot(config: PdfjsConfig): ModuleWithProviders {
    this.configPdfjs(config);
    return {
      ngModule: PdfjsBoxModule,
      providers: []
    };
  }

  /**
   * Configure Pdfjs
   */
  private static configPdfjs(config: PdfjsConfig) {
    PdfjsControl.API.GlobalWorkerOptions.workerSrc = config.workerSrc;
  }
  /**
   * Constructor, prevent circular injection
   */
  constructor(@Optional() @SkipSelf() parentModule: PdfjsBoxModule, private cfr: ComponentFactoryResolver,
              private defaultInjector: Injector, private appRef: ApplicationRef) {
    if (parentModule) {
      throw new Error(
        'PdfjsBoxModule is already loaded. Import it in the AppModule only');
    }
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
