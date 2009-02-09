var ContextSensitive=Class.create({initialize:function(){this.lasttarget=this.target=null;this.elements=$H();this.submenus=$H();this.current=[];this.basectx=this.onShow=null;document.observe("contextmenu",this._rightClickHandler.bindAsEventListener(this));document.observe("click",this._leftClickHandler.bindAsEventListener(this));document.observe(Prototype.Browser.Gecko?"DOMMouseScroll":"mousescroll",this.close.bind(this))},setOnShow:function(a){this.onShow=a},addElement:function(d,c,a){var b=Boolean(a.left);if(d&&!this.validElement(d,b)){this.elements.set(d+Number(b),new ContextSensitive.Element(d,c,a))}},removeElement:function(a){this.elements.unset(a+"0");this.elements.unset(a+"1")},close:function(a){this._closeSubmenu(0,a)},_closeSubmenu:function(a,b){this.current.splice(a,this.current.size()-a).each(function(c){if(b){c.hide()}else{Effect.Fade(c,{duration:0.2})}});this.target=this.current[a];this.basectx=null},element:function(a){return a?this.target:this.lasttarget},currentmenu:function(){return this.current.last()},validElement:function(b,a){return this.elements.get(b+Number(Boolean(a)))},disable:function(d,c,a){var b=this.validElement(d,c);if(b){b.disable=a}},_leftClickHandler:function(a){if(a.isRightClick()){return}this._rightClickHandler(a,true)},_rightClickHandler:function(b,a){if(this.trigger(b.element(),a,b.pointerX(),b.pointerY())){b.stop()}},trigger:function(f,e,h,g){var j,b,i,d,c,a;[f].concat(f.ancestors()).find(function(k){j=this.validElement(k.id,e);return j},this);if(!j||j.disable){if(!j||!j.hasClassName("contextSubmenu")){this.close()}return false}b=$(j.ctx);if(!b){this.close();return false}i=b.readAttribute("id");if(e&&i==this.currentmenu()){return false}this.close();this.lasttarget=this.target=$(j.id);d=j.opts.offset;if(!d&&(Object.isUndefined(h)||Object.isUndefined(g))){d=f.readAttribute("id")}d=$(d);if(d){c=d.viewportOffset();a=document.viewport.getScrollOffsets();h=c[0]+a.left;g=c[1]+d.getHeight()+a.top}this.basectx=j;this._displayMenu(b,h,g);return true},_displayMenu:function(c,a,f){var e=c.readAttribute("id"),d=c.getDimensions(),b=document.viewport.getDimensions();if((f+d.height)>b.height){f=b.height-d.height-10}if((a+d.width)>b.width){a=b.width-d.width-10}if(this.onShow){this.onShow(e,this.basectx)}Effect.Appear(c.setStyle({left:a+"px",top:f+"px"}),{duration:0.2});this.current.push(e)},addSubMenu:function(b,a){if(!this.submenus.get(b)){if(!this.submenus.size()){document.observe("mouseover",this._mouseoverHandler.bindAsEventListener(this))}this.submenus.set(b,a);$(b).addClassName("contextSubmenu").insert({top:new Element("SPAN",{className:"contextExpand"})})}},_mouseoverHandler:function(h){var f=h.element(),b=f.readAttribute("id"),k=this.currentmenu(),g,d,a,c,j,i;if(f.hasClassName("contextSubmenu")){a=this.submenus.get(b);if(a!=k){g=f.up().readAttribute("id");if(g!=k){this._closeSubmenu(this.current.indexOf(g)+1)}d=f.viewportOffset();c=document.viewport.getScrollOffsets();j=d[0]+c.left+f.getWidth();i=d[1]+c.top;this._displayMenu($(a),j,i)}}else{if((this.current.size()>1)&&f.hasClassName("contextElt")&&f.up().readAttribute("id")!=k){this._closeSubmenu(this.current.indexOf(b))}}}});ContextSensitive.Element=Class.create({initialize:function(c,b,a){this.id=c;this.ctx=b;this.opts=a;this.opts.left=Boolean(a.left);this.disable=false;b=$(b);if(b){b.select("A").invoke("addClassName","contextElt")}}});