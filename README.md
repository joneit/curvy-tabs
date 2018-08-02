See the [demo](https://joneit.github.io/curvy-tabs/1.0.0).

### Synopsis
```html
<div class="curvy-tabs-container">
  <div style="background-color:lightblue" name="Tab A">
    Content for Tab A goes here.
  </div>
  <div style="background-color:lightgreen" name="Tab B">
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
The following instantiates the controller object, collecting all the content divs into a sub-div, and adds the tab bar (a `canvas` element) above it:
```js
var container = document.querySelector('.curvy-tabs-container'); // or whatever
var tabBar = new CurvyTabs(container);
tabBar.paint();
```
The tabs are named after the content element names.
### API
The first tab is selected by default. To programmatically specify some other tab, set `selected` to a specific content div, either of the following works:
```js
tabBar.selected = tabBar.contents.children[1];
tabBar.selected = tabBar.contents.querySelector('[name="Tab B"]');
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

_Before instantiation,_ reset the default tab size (initially 29 pixels):
```js
CurvyTabs.size = 40;
```
_After instantiation:_
```js
tabBar.size = 40;
```
The container _must_ have a width and height. The default is 500 &times; 500 pixels.

_Before instantiation,_ use CSS to change the default (affects all instances):
```html
<style>
   .curvy-tabs-container { width: 750px; height: 1050px; }
</style>
```
_After instantiation,_ an instance's container width and height can be set programmatically:
```js
tabBar.width = 750; // sets both the tab bar width and the container width
tabBar.height = 1050;
```
Background color, border color, and border width affect both the tab bar and content area and can be set as follows:

_Before instantiation,_ use CSS (affects all instances):
```html
<style>
   .curvy-tabs-container > div {
       border: 2x solid red;
       background-color: yellow;
    }
</style>
```
_After instantiation,_ such styles can be set programmatically using the `css` method (works like [jQuery's `css` method](http://api.jquery.com/css/)):
```js
tabBar.css('borderColor', 'red'); // sets border color
tabBar.css('borderColor'); // returns border color
tabBar.css({ borderColor: 'yellow', backgroundColor: 'red' }); // sets both style properties
tabBar.css(['borderColor', 'backgroundColor']); // returns style dictionary
```
(Note that the content area background color serves as a default for transparent tabs; there is no point in setting this if all your tabs colors.)

To set styles on all the content divs at once:

_Before instantiation,_ use CSS (affects all instances):
```html
<style>
    .curvy-tabs-content > div > * { padding: 3px }
</style>
```
_After instantiation,_ use the `contentCss` method (also like jQuery's `css` method):
```js
tabBar.contentCss('padding', '2px');
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

## Version History
* `1.0.0` — Initial version
* `2.0.0`
   * Cleaner DOM structure
   * `height` is now `size`
   * `containerHeight` is now `height`
   * added `contents`, `contentDivs`, css`, and `contentCss`