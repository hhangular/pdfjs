import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {DocComponent} from './doc.component';
import {
  PdfjsConfigComponent, ConfigComponent, PdfjsThumbnailsComponent, InstallComponent,
  PdfjsControlComponent, PdfjsItemComponent,
  ThumbnailDragModeComponent, ThumbnailLayoutComponent, ViewFitComponent,
  ExamplesPdfjsViewComponent, ApiPdfjsViewComponent, OverviewPdfjsViewComponent,
  PdfjsViewComponent, PdfjsGroupControlComponent
} from './sections';

const docRoutes: Routes = [
  {
    path: '', component: DocComponent, children: [
      {path: '', redirectTo: 'install', pathMatch: 'full'},
      {path: 'install', component: InstallComponent},
      {path: 'configuration', component: ConfigComponent},
      {
        path: 'pdfjsview', component: PdfjsViewComponent, children: [
          {path: '', redirectTo: 'overview', pathMatch: 'full'},
          {path: 'overview', component: OverviewPdfjsViewComponent},
          {path: 'api', component: ApiPdfjsViewComponent},
          {path: 'examples', component: ExamplesPdfjsViewComponent},
        ]
      },
      {
        path: 'pdfjsthumbnails', component: PdfjsThumbnailsComponent
      },
      {path: 'pdfjsconfig', component: PdfjsConfigComponent},
      {path: 'pdfjscontrol', component: PdfjsControlComponent},
      {path: 'pdfjsgroupcontrol', component: PdfjsGroupControlComponent},
      {path: 'pdfjsitem', component: PdfjsItemComponent},

      {path: 'thumbnaildragmode', component: ThumbnailDragModeComponent},
      {path: 'thumbnaillayout', component: ThumbnailLayoutComponent},
      {path: 'viewfit', component: ViewFitComponent},
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(docRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class DocRoutingModule {
}
