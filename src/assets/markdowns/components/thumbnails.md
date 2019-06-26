```html
<pdfjs-thumbnails></pdfjs-thumbnails>
```


```<pdfjs-thumbnails>``` is a container for pdf pages

### Simple thumbnails   

The basic thumbnails have to have setted a pdfjsControl   
pdfjsControl allow to control a pdfjsItem collection

**In angular controller**   
```js
  pdfjsControl: PdfjsControl = new PdfjsControl();

  ngOnInit(): void {
    this.pdfjsControl.load('assets/pdfs/guide.pdf');
  }
```

**In angular template**   
```html
<pdfjs-thumbnails [pdfjsControl]="pdfjsControl"></pdfjs-thumbnails>
```

### Use most than one thumbnails for control many pdf with only one pdf viewer

You can use most of one thumbnails in one template, but il you want use only one pdf viewer and command for all of them, you have to use a GroupControl.

**In angular controller**
```js
  pdfjsGroupControl: PdfjsGroupControl = new PdfjsGroupControl();
  pdfjsControl: PdfjsControl = new PdfjsControl();
  pdfjsControl: PdfjsControl1 = new PdfjsControl();

  ngOnInit(): void {
    this.pdfjsControl.load('assets/pdfs/guide.pdf');
    this.pdfjsControl1.load('https://mydomain.com/assets/pdfs/other.pdf');
    this.pdfjsGroupControl.select(this.pdfjsControl);
  }
```

**In angular template**
```html
<pdfjs-thumbnails [pdfjsControl]="pdfjsControl" [pdfjsGroupControl]="pdfjsGroupControl"></pdfjs-thumbnails>
```

### Thumbnail preview  
 
On mouseover thumbnails container you can allow to show a preview of page over.

2 attributes control this behavior.

**In angular template**
```html
<pdfjs-thumbnails [previewDelay]="300" [previewHeight]="300"></pdfjs-thumbnails>
```

**previewDelay** define in millisecond the delay before preview appears.   
Set it to "0" disable the preview.   
Default value is 300ms.


**previewHeight** define the height of preview in pixel.   
Default value is 300px.


### Thumbnails quality   

Render pdf pages use a lot of cpu load. For limit the cpu loading, use the adequate quality.

**In angular template**
```html
<pdfjs-thumbnails [quality]="1"></pdfjs-thumbnails>
```

Values accepted are "1" to "5". "1" is the less quality. It's enought most of time.    
Default value is 1.

### Thumbnails layout and size
One attribute allow to set size of height or width thumbnails. Depends of the layout

**In angular template**
```html
<pdfjs-thumbnails [fitSize]="100" [layout]="'horizontal'"></pdfjs-thumbnails>
```

**fitSize** set height if **layout** is set to 'horizontal' (ThumbnailLayout.HORIZONTAL)   
**fitSize** set width if **layout** is set to 'vertical' (ThumbnailLayout.VERTICAL)
Default value is 100.

**layout** define the direction layout of thumbnails.    
'horizontal' (ThumbnailLayout.HORIZONTAL) : Thumbnails will be stored horizontally.    
'vertical' (ThumbnailLayout.VERTICAL) : Thumbnails will be stored vertically. 
Default value is ThumbnailLayout.HORIZONTAL.


### Thumbnails remove

**allowRemove** allow to user to remove a thumbnail by use red times.
Default value is false.

**In angular template**
```html
<pdfjs-thumbnails [allowRemove]="false"></pdfjs-thumbnails>
```

```
remove a thumbnail doesn't modify the pdf. If you want to modify it you have to implements this behavior. Probably on backend side.    
```

### Thumbnails drop   
**allowDrop** allow to thumbnail container to receive/accept pdfjsItem from an other pdfjs-thumbnails.   
Note that control too if you allow to re-order thumbnail in container.   
Default value is false.

**In angular template**
```html
<pdfjs-thumbnails [allowDrop]="false"></pdfjs-thumbnails>
```

```
add or move a thumbnail doesn't modify the pdf. If you want to modify it you have to implements this behavior. Probably on backend side.    
```

### Thumbnails dragMode
**dragMode** define the behavior about the drag events.  
Default value is ThumbnailDragMode.DUPLICATE

**In angular controller**
```js
   ThumbnailDragMode = ThumbnailDragMode;
```

**In angular template**
```html
<pdfjs-thumbnails [dragMode]="ThumbnailDragMode.DUPLICATE"></pdfjs-thumbnails>
OR
<pdfjs-thumbnails [dragMode]="'duplicate'"></pdfjs-thumbnails>
```

```
[dragMode]="ThumbnailDragMode.NONE"
```
Users can't drag thumbnail (pdfjsItem)

```
[dragMode]="ThumbnailDragMode.DUPLICATE"
```
Users can drag thumbnail (pdfjsItem) to an other thumbnails component. When drop is done. The thumbnail is duplicate in the new container

```
[dragMode]="ThumbnailDragMode.MOVE"
```
Users can drag thumbnail (pdfjsItem) to an other thumbnails component. When drop is done. The thumbnail is move in the new container


  
