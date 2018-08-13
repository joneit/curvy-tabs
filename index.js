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

function CurvyTabs(container, selectedContentElement) {
    injectStylesheet();

    var children = Array.prototype.slice.call(container.children);

    this.container = container;
    this._minWidth = 0;
    this._curviness = 1;
    this._font = '10pt sans-serif';
    this._selected = selectedContentElement || children[0];

    var contents = this.contents = document.createElement('div');
    children.forEach(function(child) {
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
    container.appendChild(canvas);
    canvas.width = containerRect.width;
    this.size = CurvyTabs.size;
    this.height = this.height; // invoke setter to calculate and set content height; invokes paint()

    this.canvas.addEventListener('click', clickHandler.bind(this));
}

CurvyTabs.size = 29;

CurvyTabs.prototype = {
    constructor: CurvyTabs,

    addTab: function(name, html, color) {
        var content = document.createElement('div');
        content.setAttribute('name', name);
        if (html) {
            content.innerHTML = html;
        }
        if (color) {
            content.style.backgroundColor = color;
        }
        this.tabs.set(content, {});
        this.contents.appendChild(content);
        this.selected = content;
        this.paint();
    },

    getTab: function(indexOrName) {
        var tab = typeof indexOrName === 'number'
            ? this.contents.children[indexOrName]
            : this.contents.querySelector('[name="' + indexOrName + '"]');

        if (!tab) {
            throw new ReferenceError('Cannot find specified tab: ' + indexOrName);
        }

        return tab;
    },

    get contentDivs() {
        return Array.prototype.slice.call(this.contents.children);
    },

    get minWidth() {
        return this._minWidth;
    },
    set minWidth(minWidth) {
        this._minWidth = minWidth;
        this.paint();
    },

    get width() {
        return this.width;
    },
    set width(width) {
        tabBar.container.style.width = width + 'px';
        tabBar.canvas.width = tabBar.container.getBoundingClientRect().width;
        tabBar.paint();
    },

    get size() {
        return this.canvas.height;
    },
    set size(size) {
        this.canvas.height = size;
        this.contents.style.top = size - 1 + 'px';
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

    select: function(indexOrName) {
        this.selected = this.getTab(indexOrName);
    },

    clear: function(indexOrName) {
        var tab = this.getTab(indexOrName);
        while (tab.hasChildNodes()) {
            tab.removeChild(tab.lastChild);
        }
    },

    hide: function(indexOrName) {
        this.toggle(indexOrName, false);
    },

    show: function(indexOrName) {
        this.toggle(indexOrName, true);
    },

    toggle: function(indexOrName, visibility) {
        var tab = this.getTab(indexOrName);
        if (visibility === undefined) {
            visibility = window.getComputedStyle(tab).display === 'none';
        }
        tab.style.display = visibility ? 'block' : 'none';
        this.paint();
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

        this.gc = this.canvas.getContext('2d');
        this.gc.textAlign = 'center';
        this.gc.clearRect(0, 0, this.canvas.width, this.size);
        this.gc.font = this.font;

        var contents = this.contentDivs.filter(function(content) {
            return window.getComputedStyle(content).display === 'block';
        });
        if (contents.length) {
            contents.forEach(function(content) {
                var props = this.tabs.get(content);
                x += props.width = drawTab.call(this, content, props.left = x);
                x -= (0.80 - this.curviness * 0.11) * this.size; // overlap tabs
            }, this);
            drawTab.call(this, this.selected, this.tabs.get(this.selected).left, true);
            selectDiv.call(this);
        }
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
    this.contentDivs.find(function(content) {
        var props = this.tabs.get(content);
        var margin = GAP + .25 * this.size;
        var left = props.left + margin;
        if (event.offsetX > left && event.offsetX < left + props.width - margin - margin) {
            var stopPropagation = false,
                preventDefault = false,
                tabEvent = {
                    content: content,
                    left: props.left,
                    width: props.width,
                    stopPropagation: function() { stopPropagation = true; },
                    preventDefault: function() { preventDefault = true; }
                };

            if (typeof props.onclick === 'function') {
                props.onclick.call(content, tabEvent);
            }

            if (!stopPropagation && typeof this.onclick === 'function') {
                this.onclick(tabEvent);
            }

            if (!preventDefault) {
                this.selected = content;
            }

            return true;
        }
    }, this);
}

module.exports = CurvyTabs;
