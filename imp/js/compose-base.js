/**
 * compose-base.js - Provides basic compose javascript functions shared
 * between standarad and dynamic displays.
 *
 * See the enclosed file COPYING for license information (GPL). If you
 * did not receive this file, see http://www.horde.org/licenses/gpl.
 */

var ImpComposeBase = {

    // Vars defaulting to null: editor_on, identities
    // Vars initialized by PHP code: mailcheck_suggest

    getSpellChecker: function()
    {
        return (HordeImple.SpellChecker && HordeImple.SpellChecker.spellcheck)
            ? HordeImple.SpellChecker.spellcheck
            : null;
    },

    setCursorPosition: function(input, type)
    {
        var pos, range;

        if (!(input = $(input))) {
            return;
        }

        switch (type) {
        case 'top':
            pos = 0;
            input.setValue('\n' + $F(input));
            break;

        case 'bottom':
            pos = $F(input).length;
            break;

        default:
            return;
        }

        if (input.setSelectionRange) {
            /* This works in Mozilla. */
            Field.focus(input);
            input.setSelectionRange(pos, pos);
            if (pos) {
                (function() { input.scrollTop = input.scrollHeight - input.offsetHeight; }).defer();
            }
        } else if (input.createTextRange) {
            /* This works in IE */
            range = input.createTextRange();
            range.collapse(true);
            range.moveStart('character', pos);
            range.moveEnd('character', 0);
            Field.select(range);
            range.scrollIntoView(true);
        }
    },

    updateAddressField: function(e)
    {
        var elt = $(e.memo.field),
            v = $F(elt).strip(),
            pos = v.lastIndexOf(',');

        if (v.empty()) {
            v = '';
        } else if (pos != (v.length - 1)) {
            v += ', ';
        } else {
            v += ' ';
        }

        elt.setValue(v + e.memo.value + ', ');
    },

    focus: function(elt)
    {
        elt = $(elt);
        elt.focus();
        $(document).fire('AutoComplete:focus', elt);
    },

    autocompleteValue: function(ob, val)
    {
        var pos = 0,
            chr, in_group, in_quote, tmp;

        chr = val.charAt(pos);
        while (chr !== "") {
            var orig_pos = pos;
            ++pos;

            if (!orig_pos || (val.charAt(orig_pos - 1) != '\\')) {
                switch (chr) {
                case ',':
                    if (!orig_pos) {
                        val = val.substr(1);
                    } else if (!in_group && !in_quote) {
                        ob.addNewItem(val.substr(0, orig_pos));
                        val = val.substr(orig_pos + 2);
                        pos = 0;
                    }
                    break;

                case '"':
                    in_quote = !in_quote;
                    break;

                case ':':
                    if (!in_quote) {
                        in_group = true;
                    }
                    break;

                case ';':
                    if (!in_quote) {
                        in_group = false;
                    }
                    break;
                }
            }

            chr = val.charAt(pos);
        }

        return val;
    },

    mailcheck: function(val)
    {
        Kicksend.mailcheck.run({
            email: val,
            suggested: function(suggestion) {
                HordeCore.notify(
                    this.mailcheck_suggest.sub('%s', val.escapeHTML()).sub('%s', suggestion.full.escapeHTML()),
                    'horde.warning'
                );
            }.bind(this)
        });
    }

};
