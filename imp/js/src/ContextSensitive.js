/**
 * ContextSensitive: a library for generating context-sensitive content on
 * HTML elements. It will take over the click/oncontextmenu functions for the
 * document, and works only where these are possible to override.  It allows
 * contextmenus to be created via both a left and right mouse click.
 *
 * Requires prototypejs 1.6+ and scriptaculous 1.8+ (effects.js only).
 *
 * Original code by Havard Eide (http://eide.org/) released under the MIT
 * license.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 * @author Chuck Hagenbuch <chuck@horde.org>
 * @author Michael Slusarz <slusarz@horde.org>
 */

var ContextSensitive = Class.create({

    initialize: function()
    {
        this.lasttarget = this.target = null;
        this.elements = $H();
        this.submenus = $H();
        this.current = [];
        this.basectx = this.onShow = null;

        document.observe('contextmenu', this._rightClickHandler.bindAsEventListener(this));
        document.observe('click', this._leftClickHandler.bindAsEventListener(this));
        document.observe(Prototype.Browser.Gecko ? 'DOMMouseScroll' : 'mousescroll', this.close.bind(this));
    },

    /**
     * Set an onshow function.
     */
    setOnShow: function(func)
    {
        this.onShow = func;
    },

    /**
     * Elements are of type ContextSensitive.Element.
     */
    addElement: function(id, target, opts)
    {
        var left = Boolean(opts.left);
        if (id && !this.validElement(id, left)) {
            this.elements.set(id + Number(left), new ContextSensitive.Element(id, target, opts));
        }
    },

    /**
     * Remove a registered element.
     */
    removeElement: function(id)
    {
        this.elements.unset(id + '0');
        this.elements.unset(id + '1');
    },

    /**
     * Hide the currently displayed element(s).
     */
    close: function(immediate)
    {
        this._closeSubmenu(0, immediate);
    },

    /**
     * Close all submenus below a specified level.
     */
    _closeSubmenu: function(idx, immediate)
    {
        this.current.splice(idx, this.current.size() - idx).each(function(s) {
            if (immediate) {
                s.hide();
            } else {
                Effect.Fade(s, { duration: 0.2 });
            }
        });
        this.target = this.current[idx];
        this.basectx = null;
    },

    /**
     * Get the element that triggered the current context menu (if any).
     */
    element: function(current)
    {
        return current ? this.target : this.lasttarget;
    },

    /**
     * Returns the current displayed menu element ID, if any. If more than one
     * submenu is open, returns the last ID opened.
     */
    currentmenu: function()
    {
        return this.current.last();
    },

    /**
     * Get a valid element (the ones that can be right-clicked) based
     * on a element ID.
     */
    validElement: function(id, left)
    {
        return this.elements.get(id + Number(Boolean(left)));
    },

    /**
     * Set the disabled flag of an event.
     */
    disable: function(id, left, disable)
    {
        var e = this.validElement(id, left);
        if (e) {
            e.disable = disable;
        }
    },

    /**
     * Called when a left click event occurs. Will return before the
     * element is closed if we click on an element inside of it.
     */
    _leftClickHandler: function(e)
    {
        // Check for a right click. FF on Linux triggers an onclick event even
        // w/a right click, so disregard.
        if (e.isRightClick()) {
            return;
        }

        // Check if the mouseclick is registered to an element now.
        this._rightClickHandler(e, true);
    },

    /**
     * Called when a right click event occurs.
     */
    _rightClickHandler: function(e, left)
    {
        if (this.trigger(e.element(), left, e.pointerX(), e.pointerY())) {
            e.stop();
        };
    },

    /**
     * Display context menu if valid element has been activated.
     */
    trigger: function(target, leftclick, x, y)
    {
        var ctx, el, el_id, offset, offsets, voffsets;

        [ target ].concat(target.ancestors()).find(function(n) {
            ctx = this.validElement(n.id, leftclick);
            return ctx;
        }, this);

        // Return if event not found or event is disabled.
        if (!ctx || ctx.disable) {
            // Return if this is a click on a submenu item.
            if (!ctx || !ctx.hasClassName('contextSubmenu')) {
                this.close();
            }
            return false;
        }

        // Try to retrieve the context-sensitive element we want to
        // display. If we can't find it we just return.
        el = $(ctx.ctx);
        if (!el) {
            this.close();
            return false;
        }

        el_id = el.readAttribute('id');
        if (leftclick && el_id == this.currentmenu()) {
            return false;
        }

        // Register the current element that will be shown and the element
        // that was clicked on.
        this.close();
        this.lasttarget = this.target = $(ctx.id);

        offset = ctx.opts.offset;
        if (!offset && (Object.isUndefined(x) || Object.isUndefined(y))) {
            offset = target.readAttribute('id');
        }
        offset = $(offset);

        if (offset) {
            offsets = offset.viewportOffset();
            voffsets = document.viewport.getScrollOffsets();
            x = offsets[0] + voffsets.left;
            y = offsets[1] + offset.getHeight() + voffsets.top;
        }

        this.basectx = ctx;
        this._displayMenu(el, x, y);

        return true;
    },

    /**
     * Display the [sub]menu on the screen.
     */
    _displayMenu: function(elt, x, y)
    {
        // Get window/element dimensions
        var id = elt.readAttribute('id'),
            size = elt.getDimensions(),
            v = document.viewport.getDimensions();

        // Make sure context window is entirely on screen
        if ((y + size.height) > v.height) {
            y = v.height - size.height - 10;
        }
        if ((x + size.width) > v.width) {
            x = v.width - size.width - 10;
        }

        if (this.onShow) {
            this.onShow(id, this.basectx);
        }

        Effect.Appear(elt.setStyle({ left: x + 'px', top: y + 'px' }), { duration: 0.2 });

        this.current.push(id);
    },

    /**
     * Add a submenu to an existing menu.
     */
    addSubMenu: function(id, submenu)
    {
        if (!this.submenus.get(id)) {
            if (!this.submenus.size()) {
                document.observe('mouseover', this._mouseoverHandler.bindAsEventListener(this));
            }
            this.submenus.set(id, submenu);
            $(id).addClassName('contextSubmenu').insert({ top: new Element('SPAN', { className: 'contextExpand' }) });
        }
    },

    /**
     * Mouseover DOM Event handler.
     */
    _mouseoverHandler: function(e)
    {
        var elt = e.element(),
            id = elt.readAttribute('id'),
            cm = this.currentmenu(),
            div_id, offsets, sub, voffsets, x, y;

        if (elt.hasClassName('contextSubmenu')) {
            sub = this.submenus.get(id);
            if (sub != cm) {
                div_id = elt.up().readAttribute('id');
                if (div_id != cm) {
                    this._closeSubmenu(this.current.indexOf(div_id) + 1);
                }

                offsets = elt.viewportOffset();
                voffsets = document.viewport.getScrollOffsets();
                x = offsets[0] + voffsets.left + elt.getWidth();
                y = offsets[1] + voffsets.top;
                this._displayMenu($(sub), x, y);
            }
        } else if ((this.current.size() > 1) &&
                   elt.hasClassName('contextElt') &&
                   elt.up().readAttribute('id') != cm) {
            this._closeSubmenu(this.current.indexOf(id));
        }
    }

});

ContextSensitive.Element = Class.create({

    // opts: 'left' -> monitor left click; 'offset' -> id of element used to
    //       determine offset placement
    initialize: function(id, target, opts)
    {
        this.id = id;
        this.ctx = target;
        this.opts = opts;
        this.opts.left = Boolean(opts.left);
        this.disable = false;

        /* Add 'contextElt' class to all context children. */
        target = $(target);
        if (target) {
            target.select('A').invoke('addClassName', 'contextElt');
        }
    }

});
