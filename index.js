/* eslint-env browser */
/* globals WeakMap */

'use strict';

var stylesheet =
    '.curvy-tabs-container {' +
        'position: relative;' +
        // 'z-index: 0;' +
        'width: 500px;' +
        'height: 500px;' +
    '}\n' +
    '.curvy-tabs-container > div {' +
        'position: absolute;' +
        'left: 0;' +
        'bottom: 0;' +
        'right: 0;' +
        'border: 1px solid #aaa;' +
        'border-radius: 7px;' +
    '}\n' +
    '.curvy-tabs-container > div > * {' +
        'position: absolute;' +
        'display: block;' +
        'visibility: hidden;' +
        'padding: 8px;' +
        'top: 0;' +
        'bottom: 0;' +
        'left: 0;' +
        'right: 0;' +
        'overflow: scroll;' +
        'border-radius: 7px;' +
    '}\n' +
    '.curvy-tabs-container > canvas {' +
        'position: absolute;' +
    '}\n';

var GAP = 4, PADDING = 4;

var TRANSPARENT = 'rgba(0, 0, 0, 0)';

var RATIO;

function CurvyTabs(container, selectedContentElement) {
    // IE 11 missing CustomEvent constructor
    if ( typeof window.CustomEvent !== "function" ) {
        window.CustomEvent = function(event, params) {
            params = params || { bubbles: false, cancelable: false, detail: undefined };
            var evt = document.createEvent('CustomEvent');
            evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
            return evt;
        };
        window.CustomEvent.prototype = window.Event.prototype;
    }

    injectStylesheet();

    var children = Array.prototype.slice.call(container.children);

    this.container = container;
    this._minWidth = 0;
    this._curviness = 1;
    this._font = '10pt sans-serif';
    this._selected = selectedContentElement || children[0];

    var contents = this.contents = document.createElement('div');
    children.forEach(function(child) {
        child.dataset.display = window.getComputedStyle(child).display;
        contents.appendChild(child);
    });
    container.appendChild(contents);

    var tabs = this.tabs = new WeakMap;
    this.contentDivs.forEach(function(content) {
        tabs.set(content, {});
    });

    setContentsBorderRadius.call(this);

    var containerRect = container.getBoundingClientRect();
    var canvas = this.canvas = document.createElement('canvas');
    var gc = this.gc = canvas.getContext('2d');

    // get device pixel ratio
    RATIO = (
        window.devicePixelRatio || 1
    ) / (
        gc.webkitBackingStorePixelRatio ||
        gc.mozBackingStorePixelRatio ||
        gc.msBackingStorePixelRatio ||
        gc.oBackingStorePixelRatio ||
        gc.backingStorePixelRatio || 1
    );

    container.appendChild(canvas);

    this.width = containerRect.width; // invoke setter to set canvas width and resolution
    this.size = CurvyTabs.size; // invoke setter to set canvas height and resolution

    this.height = this.height; // invoke setter to calculate and set content height; invokes paint()

    canvas.addEventListener('click', clickHandler.bind(this));
}

CurvyTabs.size = 29;

CurvyTabs.prototype = {
    constructor: CurvyTabs,

    addTab: function(name, html, color) {
        var el = document.createElement('div');
        el.setAttribute('name', name);
        if (html) {
            el.innerHTML = html;
        }
        if (color) {
            el.style.backgroundColor = color;
        }
        el.dataset.display = window.getComputedStyle(el).display;
        this.tabs.set(el, {});
        this.contents.appendChild(el);
        this.selected = el;
        this.paint();
    },

    getTab: function(idxOrNamOrEl) {
        var tab;

        if (idxOrNamOrEl instanceof HTMLElement) {
            tab = idxOrNamOrEl;
        } else {
            tab = typeof idxOrNamOrEl === 'number'
                ? this.contents.children[idxOrNamOrEl]
                : this.contents.querySelector('[name="' + idxOrNamOrEl + '"]');

            if (!tab) {
                throw new ReferenceError('Cannot find specified tab: ' + idxOrNamOrEl);
            }
        }

        return tab;
    },

    get contentDivs() {
        return Array.prototype.slice.call(this.contents.children);
    },

    forEach: function(iterator) {
        this.contenDivs.forEach(iterator);
    },

    get minWidth() {
        return this._minWidth;
    },
    set minWidth(minWidth) {
        this._minWidth = minWidth;
        this.paint();
    },

    get width() {
        return this._width;
    },
    set width(width) {
        width = Math.floor(width);
        this._width = width;
        this.canvas.width = width * RATIO;
        this.container.style.width = width + 'px';
        this.gc.scale(RATIO, RATIO);
        this.paint();
    },

    get size() {
        return this._height;
    },
    set size(height) {
        height = Math.floor(height);
        this._height = height;
        this.canvas.height = height * RATIO;
        this.canvas.style.height = height + 'px';
        this.gc.scale(RATIO, RATIO);
        this.contents.style.top = height - 1 + 'px';
        this.paint();
    },

    get height() {
        return this.container.getBoundingClientRect().height;
    },
    set height(height) {
        this.container.style.height = height + 'px';
        this.contents.style.top = this.size - borderWidth.call(this) + 'px';
        this.paint();
    },

    get curviness() {
        return this._curviness;
    },
    set curviness(curviness) {
        this._curviness = curviness;
        this.paint();
        this.contents.style.borderRadius = curviness * 7 + 'px';
        setContentsBorderRadius.call(this);
    },

    get font() {
        return this._font;
    },
    set font(font) {
        this._font = font;
        this.paint();
    },

    get selected() {
        return this._selected;
    },
    set selected(selectedContentElement) {
        this._selected = selectedContentElement;
        this.paint();
    },

    select: function(idxOrNamOrEl) {
        var tab = this.getTab(idxOrNamOrEl);
        if (dispatchEvents.call(this, tab)) {
            this.selected = tab;
        }
    },

    clear: function(idxOrNamOrEl) {
        var tab = this.getTab(idxOrNamOrEl);
        while (tab.hasChildNodes()) {
            tab.removeChild(tab.lastChild);
        }
    },

    hide: function(idxOrNamOrEl) {
        this.toggle(idxOrNamOrEl, false);
    },

    show: function(idxOrNamOrEl) {
        this.toggle(idxOrNamOrEl, true);
    },

    toggle: function(idxOrNamOrEl, visibility) {
        var tab = this.getTab(idxOrNamOrEl);
        if (visibility === undefined) {
            visibility = !this.visible(tab);
        }
        if (!visibility && tab === this.selected) {
            console.warn('Attempt to hide currently selected tab ignored.');
        } else {
            tab.style.display = visibility ? 'block' : 'none';
            this.paint();
        }
    },

    visible: function(idxOrNamOrEl) {
        var tab = this.getTab(idxOrNamOrEl);
        return window.getComputedStyle(tab).display === 'block';
    },

    get visibleContentDivs() {
        return this.contentDivs.filter(function(div) {
            return this.visible(div);
        }, this);
    },

    reset: function(save) {
        this.contentDivs.forEach(function(el) {
            if (save) {
                el.dataset.display = window.getComputedStyle(el).display;
            } else {
                this.toggle(el, el.dataset.display !== 'none');
            }
        }, this);
    },

    css: function(keyOrObject, value) {
        css.call(this, this.contents, keyOrObject, value);
        this.height = this.height; // invoke setter to reset overlap per possible border width change; invokes paint()
    },

    contentCss: function(keyOrObject, value) {
        this.contentDivs.forEach(function(content) {
            css.call(this, content, keyOrObject, value);
        });
    },

    paint: function() {
        var x = 8;

        this.gc.textAlign = 'center';
        this.gc.clearRect(0, 0, this.canvas.width, this.size);
        this.gc.font = this.font;

        var visibleContentDivs = this.visibleContentDivs;
        if (visibleContentDivs.length) {
            visibleContentDivs.forEach(function(content) {
                var props = this.tabs.get(content);
                x += props.width = drawTab.call(this, content, props.left = x);
                x -= (0.80 - this.curviness * 0.11) * this.size; // overlap tabs
            }, this);
            drawTab.call(this, this.selected, this.tabs.get(this.selected).left, true);
            selectDiv.call(this);
        }
    },

    // forward 'onclick' handler access to container element as well as addEventListener calls
    get onclick() {
        return this.container.onclick;
    },
    set onclick(handler) {
        this.container.onclick = handler;
    },
    addEventListener: function(type, handler) {
        this.container.addEventListner(type, handler);
    }
};

function css(el, keyOrObject, value) {
    var style = el.style;
    if (typeof keyOrObject === 'object' && !Array.isArray(keyOrObject)) {
        Object.keys(keyOrObject).forEach(function(key) {
            style[key] = keyOrObject[key];
        })
    } else if (arguments.length === 3) {
        style[keyOrObject] = value;
    } else if (arguments.length === 2) {
        if (Array.isArray(keyOrObject)) {
            return keyOrObject.reduce(function(dict, key) {
                dict[key] = style[key];
                return dict;
            }, {});
        } else {
            return window.getComputedStyle(el)[keyOrObject];
        }
    }
}

function injectStylesheet() {
    if (!document.head.querySelector('style#injected-stylesheet-curvy-tabs')) {
        var el = document.createElement('style');
        el.id = 'injected-stylesheet-curvy-tabs';
        el.innerHTML = stylesheet;
        document.head.insertBefore(el, document.head.firstElementChild);
    }
}

function setContentsBorderRadius() {
    var borderRadius = this.contents.style.borderRadius;
    this.contentDivs.forEach(function(content) {
        content.style.borderRadius = borderRadius;
    });
}

function contentStyle() {
    return window.getComputedStyle(this.contents);
}

function borderWidth() {
    return parseFloat(contentStyle.call(this).borderWidth);
}

function drawTab(content, x, onTop) {
    var gc = this.gc;
    var size = this.size - 1;
    var curveWidth = .5 * size;
    var cw80 = this.curviness * 0.80 * curveWidth;
    var text = content.getAttribute('name');
    var w = Math.max(this.minWidth, PADDING + gc.measureText(text).width + PADDING);

    for (var el = content, color = TRANSPARENT; color === TRANSPARENT; el = el.parentElement) {
        color = window.getComputedStyle(el).backgroundColor;
        if (el === document.body) {
            if (color === TRANSPARENT) {
                color = 'white';
            }
            break;
        }
    }

    gc.save(); // Save current transformation

    gc.translate(x + .5, .5); // Translate to starting point

    gc.lineWidth = borderWidth.call(this);

    if (onTop) {
        gc.beginPath();
        gc.moveTo(GAP, size); // Begin a new subpath there
        gc.lineTo(GAP + curveWidth + w + curveWidth, size);
        gc.strokeStyle = color;
        gc.stroke();
    }

    gc.beginPath();
    gc.moveTo(0, size); // Begin a new subpath there
    gc.lineTo(GAP, size);
    gc.translate(GAP, 0);
    gc.bezierCurveTo(cw80, size, curveWidth - cw80, 0, curveWidth, 0);
    gc.lineTo(curveWidth + w, 0);
    gc.translate(curveWidth + w, 0);
    gc.bezierCurveTo(cw80, 0, curveWidth - cw80, size, curveWidth, size);
    gc.lineTo(curveWidth + GAP, size);

    if (!onTop) {
        gc.closePath();
    }

    gc.fillStyle = color;
    gc.fill();
    gc.fillStyle = 'black';
    gc.fillText(text, -w / 2, 2 * size / 3);

    gc.strokeStyle = contentStyle.call(this).borderColor;
    gc.stroke();

    gc.restore();

    return GAP + curveWidth + w + curveWidth + GAP;
}

function selectDiv() {
    if (this.wasSelected) {
        this.wasSelected.style.visibility = 'hidden';
    }
    this.selected.style.visibility = 'visible';
    this.wasSelected = this.selected;
}

function clickHandler(event) {
    this.visibleContentDivs.find(function(contentDiv) {
        var props = this.tabs.get(contentDiv);
        var margin = GAP + .25 * this.size;
        var left = props.left + margin;
        if (event.offsetX > left && event.offsetX < left + props.width - margin - margin) {
            event.stopPropagation(); // we'll take it from here
            this.select(contentDiv); // issues: event to tab content el + event to tab bar container el
            return true; // found tab so quit loop
        }
    }, this);
}

function dispatchEvents(contentDiv) {
    var props = this.tabs.get(contentDiv);

    // issue tab event
    var tabEvent = new CustomEvent('click');
    contentDiv.dispatchEvent(tabEvent);

    var tabBarEvent = new CustomEvent('click', {
        detail: {
            content: contentDiv,
            left: props.left,
            width: props.width
        }
    });
    this.container.dispatchEvent(tabBarEvent);

    return !(tabEvent.defaultPrevented || tabBarEvent.defaultPrevented);
}

CurvyTabs.version = '2.3.8';

module.exports = CurvyTabs;
