import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { MyDatePickerModule } from 'mydatepicker';
import { D3Service } from 'd3-ng2-service';

import { AppComponent } from './app.component';
/*import { BrushZoom2Component } from './d3-demos/brush-zoom-2/brush-zoom-2.component';
import { DragZoom2Component } from './d3-demos/drag-zoom-2/drag-zoom-2.component';
import { VoronoiSpirals3Component } from './d3-demos/voronoi-spirals-3/voronoi-spirals-3.component';
import { WrapperBrushZoom2Component } from './d3-demos/wrapper-brush-zoom-2/wrapper-brush-zoom-2.component';
import { WrapperDragZoom2Component } from './d3-demos/wrapper-drag-zoom-2/wrapper-drag-zoom-2.component';
import { WrapperVoronoiSpirals3Component } from './d3-demos/wrapper-voronoi-spirals-3/wrapper-voronoi-spirals-3.component';
*/
import { DatamapComponent } from './d3-graphs/datamap/datamap.component';
import { WrapperDatamapComponent } from './d3-graphs/wrapper-datamap/wrapper-datamap.component';
import { MultiSeriesLineChartComponent } from './d3-graphs/multi-series-line-chart/multi-series-line-chart.component';
import { WrapperMultiSeriesLineChartComponent } from './d3-graphs/wrapper-multi-series-line-chart/wrapper-multi-series-line-chart.component';

@NgModule({
  declarations: [
    AppComponent,
    //BrushZoom2Component,
    //DragZoom2Component,
    //VoronoiSpirals3Component,
    //WrapperBrushZoom2Component,
    //WrapperDragZoom2Component,
   // WrapperVoronoiSpirals3Component,
    DatamapComponent,
    WrapperDatamapComponent,
    MultiSeriesLineChartComponent,
    WrapperMultiSeriesLineChartComponent
  ],
  imports: [
    BrowserModule,MyDatePickerModule
  ],
  providers: [
    D3Service
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
