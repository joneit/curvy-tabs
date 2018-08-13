See the [demo](https://joneit.github.io/curvy-tabs/2.0.1).

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
<script src="https://joneit.github.io/curvy-tabs/2.0.1/curvy-tabs.min.js">
```
The following instantiates the controller object, collecting all the content divs into a sub-div, and adds the tab bar (a `canvas` element) above it:
```js
var container = document.querySelector('.curvy-tabs-container'); // or whatever
var tabBar = new CurvyTabs(container);
tabBar.paint();
```
The tabs are named after the content element names.

### API

#### `container` property

An element (`div.curvy-tabs-container` in the above) that contains this instance’s tabs.

#### `contents` property

A `<div>...</div>` element, programmatically created by the constructor to group all tabs’ content elements (the container’s children).

#### `getTab` method

Convenience method to get a content element by index or name.

For example, to get a reference to the 2nd tab’s content element:
```js
var tab = tabBar.getTab(1); // by index (zero-based, so 1 means 2nd tab)
// or:
var tab = tabBar.getTab('Tab B'); // by name
```

#### `selected` property and `select` method

The first tab is selected by default.
To select an alternative default tab on instantiation:
```js
var tabBar = new CurvyTabs(container, tabB);
```
To programmatically specify some other tab, set `selected` to a specific content element:
```js
var tabB = tabBar.contents.children[1];
// or:
var tabB = tabBar.contents.querySelector('[name="Tab B"]');

tabBar.selected = tabB;
```
Or, use the `select` convenience method for setting `selected` property by tab index or name:
```js
tabBar.select(1);
// or:
tabBar.select('Tab B');
```

#### Tab `clear` method

To "clear" (removes all child elements from) the 2nd tab’s content element:
```js
tabBar.clear(1); // by index
// or:
tabBar.clear('Tab B'); // by name
```

#### Tab hide/show by index or name

To hide the 2nd tab, set 2nd content element’s `display` style:

* _Declaratively, before instantiation:_ Use CSS (affects all instances):
    ```html
    <style>
        .curvy-tabs-content > div > *:nth-child(1) { display: none } /* zero-based */
        /* or: */
        .curvy-tabs-content > div > *[name="Tab B"] { display: none }
    </style>
    ```
* _Programmatically, after instantiation, set the `display` style property of the content div:
    ```js
    tabBar.contents.querySelector(1).style.display = 'none'; // default is 'block'
    // or:
    tabBar.contents.querySelector('[name="Tab B"]').style.display = 'none';
    tabBar.paint();
    ```

Or, use the `toggle` or `hide` & `show` convenience methods to set a tab’s `display` property (by index or name) and then call `paint` for you:
```js
var indexOrName = 1; // by index
// or:
var indexOrName = 'Tab B'; // by name

// to hide:
tabBar.hide(indexOrName);
tabBar.toggle(indexOrName, false);

// to show:
tabBar.show(indexOrName);
tabBar.toggle(indexOrName, true);

// to flip:
tabBar.toggle(indexOrName); // hides if visible or shows if hidden
```

#### Tab `curviness` property

To change the curviness of the tab outlines:
```js
tabBar.curviness = 0; // no curves at all (looks exactly like Chrome's tabs)
tabBar.curviness = 0.5; // somewhat flattened curves
tabBar.curviness = 1; // full curviness (default)
```

#### Tab `minWidth` property

Tabs are sized proportional to their labels. To make all tabs the same width:
```
tabBar.minWidth = 100; // Tabs whose text exceeds 100 pixels are widened to accommodate
```

#### Tab `font` property

To change the tab font:
```js
tabBar.font = '12pt cursive'; // accepts full CSS font spec
```
To set the size (i.e., height) of the tabs (for example to accommodate outsized fonts):

* _Before instantiation:_ Reset the default tab size (initially 29 pixels):
    ```js
    CurvyTabs.size = 40;
    ```
* _After instantiation:_
    ```js
    tabBar.size = 40;
    ```

#### Container `width` and `height` property

The container _must_ have a width and height. The default is 500 &times; 500 pixels.

* _Declaratively, before instantiation:_ Use CSS to change the default (affects all instances):
    ```html
    <style>
       .curvy-tabs-container { width: 750px; height: 1050px; }
    </style>
    ```
* _Programmatically, after instantiation:_ An instance's container width and height can be set programmatically:
    ```js
    tabBar.width = 750; // sets both the tab bar width and the container width
    tabBar.height = 1050;
    ```

#### `css` method

The tab bar’s background color, border color, and border width affect both the tab bar and content area and can be set as follows:

* _Declaratively, before instantiation:_ Use CSS (affects all instances):
    ```html
    <style>
       .curvy-tabs-container > div {
           border: 2x solid red;
           background-color: yellow;
        }
    </style>
    ```
* _Programmatically, after instantiation:_ Such styles can be set programmatically using the `css` method (works like [jQuery's `css` method](http://api.jquery.com/css/)):
    ```js
    tabBar.css('borderColor', 'red'); // sets border color
    tabBar.css('borderColor'); // returns border color
    tabBar.css({ borderColor: 'yellow', backgroundColor: 'red' }); // sets both style properties
    tabBar.css(['borderColor', 'backgroundColor']); // returns style dictionary
    ```
(Note that the tab bar’s background color is only visible through transparent tabs; there is no point in setting this if _all_ your tabs have defined colors.)

#### Tab `contentCss` method
To set styles on all the content divs at once:

* _Declaratively, before instantiation:_ Use CSS (affects all instances):
    ```html
    <style>
        .curvy-tabs-content > div > * { padding: 3px }
    </style>
    ```
* _Programmatically, after instantiation:_ Use the `contentCss` method (also like jQuery's `css` method):
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
* `2.0.1`
   * Bump version numbers in README.md
* `2.1.0`
   * Add & document `getTab`, `select`, and `clear` convenience methods
   * Tab visibility now respects content div's `display` prop
   * Document how to hide a tab by setting content div's `display` prop
   * Add & document `hide`, `show`, and `toggle` convenience methods
