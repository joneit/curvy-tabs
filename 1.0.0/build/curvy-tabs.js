(function(){
/* eslint-env browser */
/* globals WeakMap */

'use strict';

var stylesheet =
        '.curvy-tabs-container {' +
        'position: absolute;' +
        'z-index: 0;' +
        'width: 500px;' +
        'height: 500px;' +
        'border: 1px solid #aaa;' +
        'border-radius: 7px;' +
    '}\n' +
    '.curvy-tabs-bar {' +
        'position: relative;' +
        'z-index: 1;' +
    '}\n' +
    '.curvy-tabs-content {' +
        'visibility: hidden;' +
        'position: absolute;' +
        'padding: 8px;' +
        'top: 0;' +
        'bottom: 0;' +
        'left: 0;' +
        'right: 0;' +
        'overflow: scroll;border-radius:7px' +
    '}\n';

var GAP = 4, PADDING = 4;

function CurvyTabs(container, selectedContentElement) {
    if (!document.head.querySelector('style#injected-stylesheet-curvy-tabs')) {
        var el = document.createElement('style');
        el.id = 'injected-stylesheet-curvy-tabs';
        el.innerHTML = stylesheet;
        document.head.insertBefore(el, document.head.firstElementChild);
    }

    this.container = container;
    this._minWidth = 0;
    this._curviness = 1;
    this._font = '10pt sans-serif';
    this._selected = selectedContentElement || container.querySelector('.curvy-tabs-content');

    var tabs = this.tabs = new WeakMap;
    getContentsArray.call(this).forEach(function(content) {
        tabs.set(content, {});
    });

    setContentsBorderRadius.call(this);

    var canvas = this.canvas = document.createElement('canvas');
    var containerRect = container.getBoundingClientRect();
    document.body.insertBefore(canvas, container);
    canvas.style.left = containerRect.left - canvas.getBoundingClientRect().left + 'px';
    canvas.classList.add('curvy-tabs-bar');
    canvas.width = containerRect.width;
    this.containerHeight = this.containerHeight; // sets canvas bottom margin
    this.height = CurvyTabs.height; // invokes paint()

    this.canvas.addEventListener('click', clickHandler.bind(this));
}

CurvyTabs.height = 29;

CurvyTabs.prototype = {
    constructor: CurvyTabs,

    destruct: function() {
        this.canvas.remove();
        this.container.style.position = 'static';
    },

    addTab: function(name, html, color) {
        var content = document.createElement('div');
        content.name = name;
        content.className = 'curvy-tabs-content';
        if (color) {
            content.style.backgroundColor = color;
        }
        content.innerHTML = html;
        this.tabs.set(content, {});
        this.container.appendChild(content);
        this.paint();
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

    get height() {
        return this.height;
    },
    set height(height) {
        this.canvas.height = height;
        this.container.style.top = window.scrollY + this.canvas.getBoundingClientRect().bottom - 1 + 'px';
        this.paint();
    },

    get containerHeight() {
        return this.container.getBoundingClientRect().height;
    },
    set containerHeight(height) {
        var style = window.getComputedStyle(this.container);
        this.container.style.height = height + 'px';
        this.canvas.style.marginBottom = parseInt(style.height) + parseInt(style.marginBottom) + 'px';
        this.paint();
    },

    get curviness() {
        return this._curviness;
    },
    set curviness(curviness) {
        this._curviness = curviness;
        this.paint();
        this.container.style.borderRadius = curviness * 7 + 'px';
        setContentsBorderRadius.call(this);
    },

    get font() {
        return this._font;
    },
    set font(font) {
        this._font = font;
        this.paint();
    },

    get borderColor() {
        return window.getComputedStyle(this.container).borderTopColor;
    },
    set borderColor(color) {
        tabBar.container.style.borderColor = color;
        tabBar.paint();
    },

    get selected() {
        return this._selected;
    },
    set selected(selectedContentElement) {
        this._selected = selectedContentElement;
        this.paint();
    },

    paint: function() {
        var x = 8;

        this.gc = this.canvas.getContext('2d');
        this.gc.textAlign = 'center';
        this.gc.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.gc.font = this.font;

        var contents = getContentsArray.call(this);
        if (contents.length) {
            contents.forEach(function(content) {
                var props = this.tabs.get(content);
                x += props.width = drawTab.call(this, content, props.left = x);
                x -= (0.80 - this.curviness * 0.11) * this.canvas.height; // overlap tabs
            }, this);
            drawTab.call(this, this.selected, this.tabs.get(this.selected).left, true);
            selectDiv.call(this);
        }
    }
};

function getContentsArray() {
    return Array.prototype.slice.call(this.container.querySelectorAll('.curvy-tabs-content'));
}

function setContentsBorderRadius() {
    var borderRadius = this.container.style.borderRadius;
    getContentsArray.call(this).forEach(function(content) {
        content.style.borderRadius = borderRadius;
    });
}

function drawTab(content, x, onTop) {
    var gc = this.gc;
    var height = this.canvas.height - 1;
    var curveWidth = .5 * height;
    var cw80 = this.curviness * 0.80 * curveWidth;
    var text = content.getAttribute('name');
    var w = Math.max(this.minWidth, PADDING + gc.measureText(text).width + PADDING);
    var color = window.getComputedStyle(content).backgroundColor;

    gc.save(); // Save current transformation

    gc.translate(x + .5, .5); // Translate to starting point

    if (onTop) {
        gc.beginPath();
        gc.moveTo(GAP, height); // Begin a new subpath there
        gc.lineTo(GAP + curveWidth + w + curveWidth, height);
        gc.strokeStyle = color;
        gc.stroke();
    }

    gc.beginPath();
    gc.moveTo(0, height); // Begin a new subpath there
    gc.lineTo(GAP, height);
    gc.translate(GAP, 0);
    gc.bezierCurveTo(cw80, height, curveWidth - cw80, 0, curveWidth, 0);
    gc.lineTo(curveWidth + w, 0);
    gc.translate(curveWidth + w, 0);
    gc.bezierCurveTo(cw80, 0, curveWidth - cw80, height, curveWidth, height);
    gc.lineTo(curveWidth + GAP, height);

    if (!onTop) {
        gc.closePath();
    }

    gc.fillStyle = color;
    gc.fill();
    gc.fillStyle = 'black';
    gc.fillText(text, -w / 2, 2 * height / 3);

    gc.strokeStyle = this.borderColor;
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
    getContentsArray.call(this).find(function(content) {
        var props = this.tabs.get(content);
        var margin = GAP + .25 * this.canvas.height;
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

window.CurvyTabs = CurvyTabs;
})();
