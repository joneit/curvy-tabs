See the [demo](https://joneit.github.io/curvy-tabs/2.1.1).

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
var CurvyTabs = require('curvy-tabs');
```
From CDN:
```html
<script src="https://unpkg.com/curvy-tabs@2.3/umd/curvy-tabs.js"></script>
<script src="https://unpkg.com/curvy-tabs@2.3/umd/curvy-tabs.min.js"></script>
```
Any [SEMVER](//semver.org) string can be used. `2.3` in the above means load the latest of the 2.3.* range. See the [npm semver calculator](//semver.npmjs.com) and npm’s [semantic versioning](https://docs.npmjs.com/misc/semver) page.

### API

#### `CurvyTabs` constructor

The following instantiates the controller object, collecting all the content divs into a sub-div, and adds the tab bar (a `canvas` element) above it:
```js
var container = document.querySelector('.curvy-tabs-container'); // or whatever
var tabBar = new CurvyTabs(container, selectedContentElement); // 1st param required, 2nd optional
tabBar.paint();
```
The tabs are named after the content element names.

##### `selectedContentElement` parameter

The first tab is selected by default but this can be overridden on instantiation by defining the optional 2nd parameter:
```js
var selectedContentElement = container.querySelector('[name="Tab B"]');
var tabBar = new CurvyTabs(container, selectedContentElement);
```

#### `CurvyTabs.version` static property

Contains the version string `2.3.1` (major.minor.patch of current version, with no leading `v`).

#### `CurvyTabs.prototype.getTab(idxOrNamOrEl)` method

To get a content element by index or name.

For example, to get a reference to the 2nd tab’s content element:
```js
var tab = tabBar.getTab(1); // by zero-based index (so 1 means 2nd tab)
var tab = tabBar.getTab('Tab B'); // by name
```
Note that `tabBar.getTab(tab) === tab`.

#### `CurvyTabs.prototype.selected` property
To specify some other tab, set `selected` to a specific content element:
```js
var tabB = tabBar.getTab(1); // by zero-based index
var tabB = tabBar.getTab('Tab B'); // by name

tabBar.selected = tabB;
```
#### `CurvyTabs.prototype.select(idxOrNamOrEl)` method
Or, use the `select` convenience method to set the `selected` property:
```js
tabBar.select(1); // by zero-based index
tabBar.select('Tab B'); // by name
tabBar.select(tabEl); // when you already have a reference to a tab element
```

#### `CurvyTabs.prototype.clear(idxOrNamOrEl)` method

To "clear" (removes all child elements from) the 2nd tab’s content element:
```js
tabBar.clear(1); // by zero-based index
tabBar.clear('Tab B'); // by name
tabBar.clear(tabEl); // when you already have a reference to a tab element
```

#### Tab hide/show by index or name

All tabs are visible by default.

To hide the a tab, say the 2nd tab (“Tab B”):

* _Declaratively, before instantiation, use CSS to set a tab’s content element’s `display` style:
    ```html
    <style>
        .curvy-tabs-container > div > :nth-child(2) { display: none } /* by one-based (!) indexed */
        .curvy-tabs-container > div > [name="Tab B"] { display: none } /* by name */
    </style>
    ```
* _Programmatically, after instantiation:
    ```js
    tobBar.hide(1); // by zero-based index
    tobBar.hide('Tab B'); // by name
    ```

##### `CurvyTabs.prototype.hide(idxOrNamOrEl)` method
```js
var idxOrNamOrEl = 1; // by zero-based index
var idxOrNamOrEl = 'Tab B'; // by name
var idxOrNamOrEl = tabEl; // when you already have a reference to a tab element
tabBar.hide(idxOrNamOrEl);
```
<strong>Caveat:</strong> Attempts to hide the current tab are ignored with a console warning. Be sure to switch to a visible tab first.

##### `CurvyTabs.prototype.show(idxOrNamOrEl)` method
```js
tabBar.show(idxOrNamOrEl);
```

##### `CurvyTabs.prototype.toggle(idxOrNamOrEl, isVisible)` method
To hide if visible or show if hidden:
```js
tabBar.toggle(idxOrNamOrEl);
```
The optional second parameter `isVisible` forces visibility:
```js
tabBar.toggle(idxOrNamOrEl, false); // same as tabBar.hide(idxOrNamOrEl)
tabBar.toggle(idxOrNamOrEl, true); // same as tabBar.show(idxOrNamOrEl)
```

#### `CurvyTabs.prototype.curviness` property

To change the curviness of the tab outlines:
```js
tabBar.curviness = 0; // not curvy at all, exactly like Chrome's tabs (prior to version 69)
tabBar.curviness = 0.5; // somewhat curvy
tabBar.curviness = 1; // fully curvy (default)
```

#### `CurvyTabs.prototype.minWidth` property

Tabs are sized proportional to their labels. To make all tabs the same width:
```
tabBar.minWidth = 100; // Tabs whose text exceeds 100 pixels are widened to accommodate
```

#### `CurvyTabs.prototype.font` property

To change the tab font:
```js
tabBar.font = '12pt cursive'; // accepts full CSS font spec
```

#### `CurvyTabs.prototype.size` property
To set the size (_i.e.,_ height) of the tabs (for example to accommodate outsized fonts):

* _Before instantiation:_ Reset the default tab size (initially 29 pixels):
    ```js
    CurvyTabs.size = 40;
    ```
* _After instantiation:_
    ```js
    tabBar.size = 40;
    ```

#### `CurvyTabs.prototype.width` and `CurvyTabs.prototype.height` property

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

#### `CurvyTabs.prototype.css` method

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

#### `CurvyTabs.prototype.contentCss` method
To set styles on all the content divs at once:

* _Declaratively, before instantiation:_ Use CSS (affects all instances):
    ```html
    <style>
        .curvy-tabs-container > div > * { padding: 3px }
    </style>
    ```
* _Programmatically, after instantiation:_ Use the `contentCss` method (also like jQuery's `css` method):
    ```js
    tabBar.contentCss('padding', '2px');
    ```

#### `CurvyTabs.prototype.container` property
An element (`div.curvy-tabs-container` in the above) that contains this instance’s tabs.

#### `CurvyTabs.prototype.contents` property
A `<div>...</div>` element, programmatically created by the constructor to group all tabs’ content elements (the container’s children).

#### `CurvyTabs.prototype.forEach(iterator)` method

To iterate through all the tabs’ content elements (`contents.children`):
```js
tabBar.forEach(function(tabEl) {
    console.log(tabEl.getAttribute('name'));
});
```
The above logs:
```
Tab A
Tab B
```
See [`Array.prototype.forEach`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach) for more information, including the definition of `iterator`.

#### `CurvyTabs.prototype.reset(save)` method

Two overloads:
* `reset()` — Resets each tab to its visibility based on the value of its `display` style at the time the tab was loaded, or the last time `tabBar.reset(true)` was called
* `reset(true)` — Saves the state of each tab’s `display` style for future reference by a `reset()` call.

### Event Handlers
#### `tabBar.onclick`
If defined as a function, this event handler will be fired on every click of _any_ tab. The event object contains `content` (a reference to the content element to be displayed, whose `name` attribute is used as the tab label), `left` (horizontal pixel location of left edge of tab, and `width` (width of tab).

For example, either of:
```js
tabBar.onclick = function(event) {
    console.log('tab clicked:', event.content.getAttribute('name'));
};
tabBar.addEventListener('click', function(event) {
    console.log('tab clicked:', event.content.getAttribute('name'));
});
```
##### `event.preventDefault()`
Calling `event.preventDefault()` from this handler will prevent the clicked tab from being selected. Therefore, this is a way of disabling all tabs.

#### `tab.onclick`
In addition, each tab may also define its own event handler, fired only when that tab is clicked on.

For example, either of:
```js
tabBar.getTab(0).onclick = function(event) { ... };
tabBar.getTab(0).addEventListener('onclick', function(event) { ... });
```
##### `event.preventDefault()`
As above, calling `event.preventDefault()` from within will prevent the tab from being selected. This is a way of disabling just this specific tab.

##### `event.stopPropagation()`
The event will be propagated to the `tabBar.onclick` handler (if defined) unless you call `event.stopPropagation()` from within.

## See Also
* `curvy-tabs-pager` ([npm](https://npmjs.org/package/curvy-tabs-pager), [github](https://github.com/joneit/curvy-tabs-pager)) which implements paged content for curvy-tab bars.

## Version History
* `2.3.5`
   * Update `version` property value.
* `2.3.4`
   * Add `umd` folder for `unpkg` CDN support. (See revised installation above.)
* `2.3.3`
   * Fix `width` setter (was always throwing error)
   * Set `<canvas>` element to device’s resolution for crisper imaginge (especially text) on high-DPI devices (like Apple Retina screen)
   * Pull build script out of package.json, which failed on Windows (in GitBash), and put in new file build.sh
* `2.3.2`
   * Fix `catch` that was itself was throwing error (in `getTab` on unknown tab)
   * Improved build
* `2.3.1`
   * Bump `CurvyTabs.version`
   * Fix bad link to curvy-tabs-pager in README.md
* `2.3.0`
   * Attempts to hide the current tab with the [`hide`](#curvytabsprototypehideidxornamorel-method), [`toggle`](#curvytabsprototypetoggleidxornamorel-isvisible-method), or [`reset`](#curvytabsprototyperesetidxornamorel-method) methods are ignored with a console warning.
   * Add [`reset`](#curbytabsprototypereset-method) method
   * All methods that previously had `indexOrName` overloads now have `idxOrNamOrEl` overloads — meaning that they all now accept an already known tab element in addition to its index or name. Previously if you already had the element, you couldn't just pass `el`; you would have had to pass `el.getAttribute('name')`. This would deref the name just so `getTab` could then search for the element by name.
* `2.2.0`
   * Add [`forEach`](#curvytabsprototypeforeachiterator-method) method
* `2.1.1`
   * Bump version numbers in README.md (again) (doh!)
   * Add [`CurvyTabs.version`](#curvytabsversion-static-property) static property
   * Adjust build-and-push.sh to keep previous versions
* `2.1.0`
   * Add & document [`getTab`](#curvytabsprototypegettabidxornamorel-method), [`select`](#curvytabsprototypeselectidxornamorel-method), [`clear`](#curvytabsprototypeclearidxornamorel-method), [`hide`](#curvytabsprototypehideidxornamorel-method), [`show`](#curvytabsprototypeshowidxornamorel-method), and [`toggle`](#curvytabsprototypetoggleidxornamorel-isvisible-method) methods
   * Tab visibility now respects content div's `display` style
   * Document how to hide a tab by setting content div's `display` style
* `2.0.1`
   * Bump version numbers in README.md
* `2.0.0`
   * Cleaner DOM structure
   * `height` is now [`size`](#curvytabsprototypesize-property)
   * `containerHeight` is now [`height`](#curvytabsprototypewidth-and-curvytabsprototypeheight-property)
   * Add [`contents`](#curvytabsprototypecontents-property), ~~`contentDivs`~~, [`css`](#curvytabsprototypecss-method), and [`contentCss`](#curvytabsprototypecontentcss-method)
* `1.0.0` — Initial version
