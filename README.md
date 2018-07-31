See the [demo](https://joneit.github.io/curvy-tabs/1.0.0).

### Synopsis
```html
<div class="curvy-tabs-container">
  <div class="curvy-tabs-content" style="background-color:lightblue" name="Tab A">
    Content for Tab A goes here.
  </div>
  <div class="curvy-tabs-content" style="background-color:lightgreen" name="Tab B">
    Content for Tab B goes here.
  </div>
</div>
```
As npm module:
```js
var CurvyTabs = require('curvy-tab');
```
From CDN:
```html
<script src="https://joneit.github.io/curvy-tabs/1.0.0/curvy-tabs.min.js">
```
The following instantiates the controller object and adds the tab bar (a `canvas` element) above the container element:
```js
var container = document.querySelector('.curvy-tabs-container'); // or whatever
var tabBar = new CurvyTabs(container);
tabBar.paint();
```
The tabs are named after the content element names.
### API
The first tab is selected by default. To programmatically specify some other tab, set `selected` to the content element:
```js
var tabB = document.getElementByClassName('curvy-tabs-content')[1];
tabBar.selected = tabB;  // or whatever
```
To select an alternative tab on instantiation:
```js
var tabBar = new CurvyTabs(container, tabB);
```
To change the curviness of the tab outlines:
```js
tabBar.curviness = 0; // no curves at all (looks exactly like Chrome's tabs)
tabBar.curviness = 0.5; // somewhat flattened curves
tabBar.curviness = 1; // full curviness (default)
```
Tabs are sized proportional to their labels. To make all tabs the same width:
```
tabBar.minWidth = 100; // Tabs whose text exceeds 100 pixels are widened to accommodate
```
To change the tab font:
```js
tabBar.font = '12pt cursive'; // accepts full CSS font spec
```
To set the size of the tabs (for example to accommodate outsized fonts), :

_Before instantiation,_ reset the default height (29 pixels):
```js
CurvyTabs.height = 40;
```
_After instantiation:_
```js
tabBar.height = 40;
```
The container _must_ have a width and height. The default is 500 &times; 500 pixels.

_Before instantiation,_ use CSS (affects all instances):
```html
<style>
   .curvy-tabs-container { width: 750px; height: 1050px; }
</style>
```
_After instantiation,_ container's width can be set programmatically:
```js
tabBar.width = 750; // sets both the tab bar width and the container width
tabBar.containerHeight = 1050;
```
To change the default border color (`#aaaaaa`):

_Before instantiation,_ use CSS (affects all instances):
```html
<style>
   .curvy-tabs-container { border-color: blue; }
</style>
```
_After instantiation,_ can be set programmatically:
```js
tabBar.container.style.borderColor = 'blue';
tabBar.paint();
```
To change the default padding (`8px`), use CSS (affects all instances):
```html
<style>
    .curvy-tabs-content { padding: 3px }
</style>
```
### Event Handlers
#### `tabBar.onclick`
If defined as a function, this event handler will be fired on every click of _any_ tab. The event object contains `content` (a reference to the content element to be displayed, whose `name` attribute is used as the tab label), `left` (horizontal pixel location of left edge of tab, and `width` (width of tab). For example:
```js
tabBar.onclick = function(event) {
    console.log('tab clicked:', event.content.getAttribute('name'));
};
```
##### `event.preventDefault()`
Calling `event.preventDefault()` from this handler will prevent the clicked tab from being selected. Therefore, this is a way of disabling all tabs.

#### `tab.onclick`
In addition, each tab may also define its own event handler, fired only when that tab is clicked on. For example:
```js
var content = this.tabBar.container.querySelector('.curvy-tabs-content'); // eg, first tab
tabBar.tabs.get(content).onclick = function(event) { ... }; // tabs is a WeakMap
```
##### `event.preventDefault()`
As above, calling `event.preventDefault()` from within will prevent the tab from being selected. This is a way of disabling just this specific tab.

##### `event.stopPropagation()`
The event will be propagated to the `tabBar.onclick` handler (if defined) unless you call `event.stopPropagation()` from within.