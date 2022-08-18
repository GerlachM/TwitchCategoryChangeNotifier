/*
 |  tail.select - The vanilla solution to make your HTML select fields AWESOME!
 |  @file       ./js/tail.select.js
 |  @author     wolffe <getbutterfly@gmail.com>
 |  @author     SamBrishes <sam@pytes.net>
 |  @version    0.5.22
 |
 |  @website    https://github.com/wolffe/tail.select.js
 |  @license    X11 / MIT License
 |  @copyright  Copyright © 2020 - 2021 wolffe <getbutterfly@gmail.com>
 |  @copyright  Copyright © 2014 - 2019 SamBrishes, pytesNET <info@pytes.net>
 */
!function(root,factory){"function"==typeof define&&define.amd?define((function(){return factory(root)})):"object"==typeof module&&module.exports?module.exports=factory(root):(void 0===root.tail&&(root.tail={}),root.tail.select=factory(root),"undefined"!=typeof jQuery&&(jQuery.fn.tailselect=function(o){var r=[],i;return this.each((function(){!1!==(i=tail.select(this,o))&&r.push(i)})),1===r.length?r[0]:0!==r.length&&r}),"undefined"!=typeof MooTools&&Element.implement({tailselect:function(o){return new tail.select(this,o)}}))}(window,(function(root){"use strict";var w=root,d=root.document;function cHAS(el,name){return!!(el&&"classList"in el)&&el.classList.contains(name)}function cADD(el,name){return el&&"classList"in el?el.classList.add(name):void 0}function cREM(el,name){return el&&"classList"in el?el.classList.remove(name):void 0}function trigger(el,event,opt){var ev;if(CustomEvent&&CustomEvent.name)var ev=new CustomEvent(event,opt);else(ev=d.createEvent("CustomEvent")).initCustomEvent(event,!!opt.bubbles,!!opt.cancelable,opt.detail);return el.dispatchEvent(ev)}function clone(obj,rep){if("function"==typeof Object.assign)return Object.assign({},obj,rep||{});var clone=Object.constructor();for(var key in obj)clone[key]=key in rep?rep[key]:obj[key];return clone}function create(tag,classes){var r=d.createElement(tag);return r.className=classes&&classes.join?classes.join(" "):classes||"",r}var select=function(el,config){if((el="string"==typeof el?d.querySelectorAll(el):el)instanceof NodeList||el instanceof HTMLCollection||el instanceof Array){for(var _r=[],l=el.length,i=0;i<l;i++)_r.push(new select(el[i],clone(config,{})));return 1===_r.length?_r[0]:0!==_r.length&&_r}if(!(el instanceof Element&&this instanceof select))return el instanceof Element&&new select(el,config);if(select.inst[el.getAttribute("data-tail-select")])return select.inst[el.getAttribute("data-tail-select")];if(el.getAttribute("data-select")){var test=JSON.parse(el.getAttribute("data-select").replace(/\'/g,'"'));test instanceof Object&&(config=clone(config,test))}var placeholder=el.getAttribute("placeholder")||el.getAttribute("data-placeholder"),fb1="bindSourceSelect",fb2="sourceHide",ret;return(config="object"==typeof config?config:{}).multiple="multiple"in config?config.multiple:el.multiple,config.disabled="disabled"in config?config.disabled:el.disabled,config.placeholder=placeholder||config.placeholder||null,config.width="auto"===config.width?el.offsetWidth+50:config.width,config.sourceBind=fb1 in config?config[fb1]:config.sourceBind||!1,config.sourceHide=fb2 in config?config[fb2]:config.sourceHide||!0,config.multiLimit=config.multiLimit>=0?config.multiLimit:1/0,this.e=el,this.id=++select.count,this.con=clone(select.defaults,config),this.events={},select.inst["tail-"+this.id]=this,this.init().bind()},options;return select.count=0,select.inst={},select.defaults={animate:!0,classNames:null,csvOutput:!1,csvSeparator:",",descriptions:!1,deselect:!1,disabled:!1,height:350,hideDisabled:!1,hideSelected:!1,items:{},locale:"en",linguisticRules:{"е":"ё",a:"ä",o:"ö",u:"ü",ss:"ß"},multiple:!1,multiLimit:1/0,multiPinSelected:!1,multiContainer:!1,multiShowCount:!0,multiShowLimit:!1,multiSelectAll:!1,multiSelectGroup:!0,openAbove:null,placeholder:null,search:!1,searchConfig:["text","value"],searchFocus:!0,searchMarked:!0,searchMinLength:1,searchDisabled:!0,sortItems:!1,sortGroups:!1,sourceBind:!1,sourceHide:!0,startOpen:!1,stayOpen:!1,width:null,cbComplete:void 0,cbEmpty:void 0,cbLoopItem:void 0,cbLoopGroup:void 0},select.strings={en:{all:"All",none:"None",empty:"No Options available",emptySearch:"No Options found",limit:"You can't select more Options",placeholder:"Select an Option...",placeholderMulti:"Select up to :limit Options...",search:"Type in to search...",disabled:"This Field is disabled"},modify:function(locale,id,string){if(!(locale in this))return!1;if(id instanceof Object)for(var key in id)this.modify(locale,key,id[key]);else this[locale][id]="string"==typeof string?string:this[locale][id];return!0},register:function(locale,object){return"string"==typeof locale&&object instanceof Object&&(this[locale]=object,!0)}},select.prototype={_e:function(string,replace,def){if(!(string in this.__))return def||string;var string;if("function"==typeof(string=this.__[string])&&(string=string.call(this,replace)),"object"==typeof replace)for(var key in replace)string=string.replace(key,replace[key]);return string},init:function(){var self=this,classes=["tail-select"],con=this.con,regexp=/^[0-9.]+(?:cm|mm|in|px|pt|pc|em|ex|ch|rem|vw|vh|vmin|vmax|\%)$/i,c=!0===con.classNames?this.e.className:con.classNames;classes.push(c&&c.push?c.join(" "):c&&c.split?c:"no-classes"),con.hideSelected&&classes.push("hide-selected"),con.hideDisabled&&classes.push("hide-disabled"),0==con.multiLimit&&classes.push("disabled"),con.multiple&&classes.push("multiple"),con.deselect&&classes.push("deselect"),con.disabled&&classes.push("disabled"),this.__=clone(select.strings.en,select.strings[con.locale]||{}),this._init=!0,this._query=!1,this.select=create("DIV",classes),this.label=create("DIV","select-label"),this.dropdown=create("DIV","select-dropdown"),this.search=create("DIV","dropdown-search"),this.csvInput=create("INPUT","select-search"),null!==this.e.getAttribute("tabindex")?this.select.setAttribute("tabindex",this.e.getAttribute("tabindex")):this.select.setAttribute("tabindex",0),con.width&&regexp.test(con.width)?this.select.style.width=con.width:con.width&&!isNaN(parseFloat(con.width,10))&&(this.select.style.width=con.width+"px"),this.label.addEventListener("click",(function(event){self.toggle.call(self,self.con.animate)})),this.select.appendChild(this.label),isNaN(parseInt(con.height,10))||(this.dropdown.style.maxHeight=parseInt(con.height,10)+"px"),con.search&&(this.search.innerHTML='<input type="text" class="search-input" />',this.search.children[0].placeholder=this._e("search"),this.search.children[0].addEventListener("input",(function(event){self.query.call(self,this.value.length>con.searchMinLength?this.value:void 0)})),this.dropdown.appendChild(this.search)),this.select.appendChild(this.dropdown),this.csvInput.type="hidden",con.csvOutput&&(this.csvInput.name=this.e.name,this.e.removeAttribute("name"),this.select.appendChild(this.csvInput)),con.multiple&&con.multiContainer&&(d.querySelector(con.multiContainer)?(this.container=d.querySelector(con.multiContainer),this.container.className+=" tail-select-container"):!0===con.multiContainer&&(this.container=this.label,this.container.className+=" tail-select-container")),this.options=new options(this.e,this);for(var l=this.e.options.length,i=0;i<l;i++)this.options.set(this.e.options[i],!1);for(var key in con.items)"string"==typeof con.items[key]&&(con.items[key]={value:con.items[key]}),this.options.add(con.items[key].key||key,con.items[key].value,con.items[key].group,con.items[key].selected,con.items[key].disabled,con.items[key].description);return this.query(),this.e.nextElementSibling?this.e.parentElement.insertBefore(this.select,this.e.nextElementSibling):this.e.parentElement.appendChild(this.select),con.sourceHide&&("none"==this.e.style.display?(this.select.style.display="none",this.e.setAttribute("data-select-hidden","display")):"hidden"==this.e.style.visibility?(this.select.style.visibiltiy="hidden",this.e.setAttribute("data-select-hidden","visibility")):(this.e.style.display="none",this.e.setAttribute("data-select-hidden","0"))),this.e.setAttribute("data-tail-select","tail-"+this.id),self.con.startOpen&&this.open(con.animate),(con.cbComplete||function(){}).call(this,this.select),this._init=!1,this},bind:function(){var self=this;if(void 0===this.options_initial){for(var init_selected=[],idx=0;idx<this.options.selected.length;++idx)init_selected.push(this.options.selected[idx]);this.options_initial={selected:init_selected}}return d.addEventListener("keydown",(function(event){var key=event.keyCode||event.which,opt,inner,e,temp,tmp,space;if(!(32==key&&self.select===document.activeElement)&&(!cHAS(self.select,"active")||[13,27,38,40].indexOf(key)<0))return!1;if(event.preventDefault(),event.stopPropagation(),32===key)return self.open(self.con.animate);if(13==key&&(opt=self.dropdown.querySelector(".dropdown-option.hover:not(.disabled)"))&&(opt.classList.contains("selected")?self.options.unselect.call(self.options,opt):self.options.select.call(self.options,opt)),27==key||13==key)return self.close(self.con.animate);if(opt=self.dropdown.querySelector(".dropdown-option.hover:not(.disabled)"))for(cREM(opt,"hover"),e=[(40==key?"next":"previous")+"ElementSibling"];(opt=null!==(temp=opt[e])&&"LI"==opt.tagName?temp:null!==(temp=opt.parentElement[e])&&temp.children.length>0&&"UL"==temp.tagName&&temp.children[40==key?0:temp.children.length-1])&&(!cHAS(opt,"dropdown-option")||cHAS(opt,"disabled")););if(opt||40!=key?opt||38!=key||(opt=(tmp=self.dropdown.querySelectorAll(".dropdown-option:not(.disabled)"))[tmp.length-1]):opt=self.dropdown.querySelector(".dropdown-option:not(.disabled)"),opt&&(inner=self.dropdown.querySelector(".dropdown-inner"))){var pos=function(el){for(var _r={top:el.offsetTop,height:el.offsetHeight};(el=el.parentElement)!=inner;)_r.top+=el.offsetTop;return _r}(opt);cADD(opt,"hover"),inner.scrollTop=Math.max(0,pos.top-2*pos.height)}return!0})),d.addEventListener("click",(function(ev){if(!cHAS(self.select,"active")||cHAS(self.select,"idle"))return!1;if(!0===self.con.stayOpen)return!1;for(var targets=[self.e,self.select,self.container],l=targets.length,i=0;i<l;i++){if(targets[i]&&(targets[i].contains(ev.target)||targets[i]==ev.target))return!1;if(!ev.target.parentElement)return!1}return self.close.call(self,self.con.animate)})),!this.con.sourceBind||(this.e.addEventListener("change",(function(event){if(null!=event.detail)return!1;if(event.preventDefault(),event.stopPropagation(),!this.multiple&&this.selectedIndex)self.options.select.call(self.options,this.options[this.selectedIndex]);else{var u=[].concat(self.options.selected),s=[].filter.call(this.querySelectorAll("option:checked"),(function(item){return!(u.indexOf(item)>=0)||(u.splice(u.indexOf(item),1),!1)}));self.options.walk.call(self.options,"unselect",u),self.options.walk.call(self.options,"select",s)}})),!0)},callback:function(item,state,_force){var rkey,rgrp,rsel="[data-key='"+item.key.replace(/('|\\)/g,"\\$1")+"'][data-group='"+item.group.replace(/('|\\)/g,"\\$1")+"']";if("rebuild"==state)return this.query();var element=this.dropdown.querySelector(rsel);return element&&["select","disable"].indexOf(state)>=0?cADD(element,"select"==state?"selected":"disabled"):element&&["unselect","enable"].indexOf(state)>=0&&cREM(element,"unselect"==state?"selected":"disabled"),this.update(item),!0===_force||this.trigger("change",item,state)},trigger:function(event){if(this._init)return!1;var obj={bubbles:!1,cancelable:!0,detail:{args:arguments,self:this}};"change"==event&&arguments[2]&&arguments[2].indexOf("select")>=0&&(trigger(this.e,"input",obj),trigger(this.e,"change",obj)),trigger(this.select,"tail::"+event,obj);var args=[],pass;return Array.prototype.map.call(arguments,(function(item,i){i>0&&args.push(item)})),(this.events[event]||[]).forEach((function(item){(pass=[].concat(args)).push(item.args||null),(item.cb||function(){}).apply(obj.detail.self,pass)})),!0},calc:function(){var clone=this.dropdown.cloneNode(!0),height=this.con.height,search=0,inner=this.dropdown.querySelector(".dropdown-inner");(clone=this.dropdown.cloneNode(!0)).style.cssText="height:auto;min-height:auto;max-height:none;opacity:0;display:block;visibility:hidden;",clone.style.maxHeight=this.con.height+"px",clone.className+=" cloned",this.dropdown.parentElement.appendChild(clone),height=height>clone.clientHeight?clone.clientHeight:height,this.con.search&&(search=clone.querySelector(".dropdown-search").clientHeight),this.dropdown.parentElement.removeChild(clone);var pos=this.select.getBoundingClientRect(),bottom=w.innerHeight-(pos.top+pos.height),view=height+search>bottom&&pos.top>bottom;return!0===this.con.openAbove||!1!==this.con.openAbove&&view?(view=!0,height=Math.min(height,pos.top-10),cADD(this.select,"open-top")):(view=!1,height=Math.min(height,bottom-10),cREM(this.select,"open-top")),inner&&(this.dropdown.style.maxHeight=height+"px",inner.style.maxHeight=height-search+"px"),this},query:function(search,conf){var item,tp,ul,li,a1,a2,self=this,con=this.con,g="getAttribute",root=create("DIV","dropdown-inner"),func=search?"finder":"walker",args=search?[search,conf]:[con.sortItems,con.sortGroups];for(this._query="string"==typeof search&&search;item=this.options[func].apply(this.options,args);){if(!ul||ul&&ul[g]("data-group")!==item.group){if(!((tp=(con.cbLoopGroup||this.cbGroup).call(this,item.group,search,root))instanceof Element))break;(ul=tp).setAttribute("data-group",item.group),root.appendChild(ul)}if(null!==(li=(con.cbLoopItem||this.cbItem).call(this,item,ul,search,root))){if(!1===li)break;li.setAttribute("data-key",item.key),li.setAttribute("data-group",item.group),li.addEventListener("click",(function(event){if(!this.hasAttribute("data-key"))return!1;var key=this[g]("data-key"),group=this[g]("data-group")||"#";self.options.toggle.call(self.options,key,group)&&(!1!==self.con.stayOpen||self.con.multiple||self.close.call(self,self.con.animate))})),ul.appendChild(li)}}var count=root.querySelectorAll("*[data-key]").length;0==count&&(this.con.cbEmpty||function(element){var li=create("SPAN","dropdown-empty");li.innerText=this._e("empty"),element.appendChild(li)}).call(this,root,search),count>0&&con.multiple&&con.multiLimit==1/0&&con.multiSelectAll&&(a1=create("BUTTON","tail-all"),a2=create("BUTTON","tail-none"),a1.innerText=this._e("all"),a1.addEventListener("click",(function(event){event.preventDefault();var options=self.dropdown.querySelectorAll(".dropdown-inner .dropdown-option");self.options.walk.call(self.options,"select",options)})),a2.innerText=this._e("none"),a2.addEventListener("click",(function(event){event.preventDefault();var options=self.dropdown.querySelectorAll(".dropdown-inner .dropdown-option");self.options.walk.call(self.options,"unselect",options)})),(li=create("SPAN","dropdown-action")).appendChild(a1),li.appendChild(a2),root.insertBefore(li,root.children[0]));var data=this.dropdown.querySelector(".dropdown-inner");return this.dropdown[(data?"replace":"append")+"Child"](root,data),cHAS(this.select,"active")&&this.calc(),this.updateCSV().updateLabel()},cbGroup:function(group,search){var ul=create("UL","dropdown-optgroup"),self=this,a1,a2;return"#"==group?ul:(ul.innerHTML='<li class="optgroup-title"><b>'+group+"</b></li>",this.con.multiple&&this.con.multiLimit==1/0&&this.con.multiSelectAll&&(a1=create("BUTTON","tail-none"),a2=create("BUTTON","tail-all"),a1.innerText=this._e("none"),a1.addEventListener("click",(function(event){event.preventDefault();var grp=this.parentElement.parentElement.getAttribute("data-group");self.options.all.call(self.options,"unselect",grp)})),a2.innerText=this._e("all"),a2.addEventListener("click",(function(event){event.preventDefault();var grp=this.parentElement.parentElement.getAttribute("data-group");self.options.all.call(self.options,"select",grp)})),ul.children[0].appendChild(a1),ul.children[0].appendChild(a2)),ul)},cbItem:function(item,optgroup,search){var li=create("LI","dropdown-option"+(item.selected?" selected":"")+(item.disabled?" disabled":""));return li.title=item.option.title,search&&search.length>0&&this.con.searchMarked?(search=this.options.applyLinguisticRules(search),li.innerHTML=item.value.replace(new RegExp("("+search+")","i"),"<mark>$1</mark>")):li.innerText=item.value,this.con.descriptions&&item.description&&(li.innerHTML+='<span class="option-description">'+item.description+"</span>"),li},update:function(item){return this.updateLabel().updateContainer(item).updatePin(item).updateCSV(item)},updateLabel:function(label){if(this.container==this.label&&this.options.selected.length>0)return this.label.querySelector(".label-inner")&&this.label.removeChild(this.label.querySelector(".label-inner")),this.label.querySelector(".label-count")&&this.label.removeChild(this.label.querySelector(".label-count")),this;var c=this.con,len=this.options.selected.length,limit,selected_class;("string"!=typeof label&&(label=c.disabled?"disabled":0==this.dropdown.querySelectorAll("*[data-key]").length?"empty"+(cHAS(this.select,"in-search")?"Search":""):c.multiLimit<=len?"limit":!c.multiple&&this.options.selected.length>0?this.options.selected[0].innerText:"string"==typeof c.placeholder?c.placeholder:"placeholder"+(c.multiple&&c.multiLimit<1/0?"Multi":"")),label='<span class="label-inner">'+(label=this._e(label,{":limit":c.multiLimit},label))+"</span>",limit=c.multiShowLimit&&c.multiLimit<1/0,c.multiple&&c.multiShowCount)&&(label=(label='<span class="label-count '+(len?"label-count--selected":"")+'">:c</span>'+label).replace(":c",len+(limit?" / "+c.multiLimit:"")));return this.label.innerHTML=label,this},updateContainer:function(item){if(!this.container||!this.con.multiContainer)return this;var s="[data-group='"+item.group+"'][data-key='"+item.key+"']";if(this.container.querySelector(s))return item.selected||this.container.removeChild(this.container.querySelector(s)),this;if(item.selected){var self=this,hndl=create("DIV","select-handle");hndl.innerText=item.value,hndl.setAttribute("data-key",item.key),hndl.setAttribute("data-group",item.group),hndl.addEventListener("click",(function(event){event.preventDefault(),event.stopPropagation();var key=this.getAttribute("data-key"),grp=this.getAttribute("data-group");self.options.unselect.call(self.options,key,grp)})),this.container.appendChild(hndl)}return this},updatePin:function(item){var inner=this.dropdown.querySelector(".dropdown-inner ul"),option="li[data-key='"+item.key+"'][data-group='"+item.group+"']";if(!this.con.multiPinSelected||!inner||!1!==this._query)return this;if(option=this.dropdown.querySelector(option),item.selected)inner.insertBefore(option,inner.children[0]);else{for(var grp=this.dropdown.querySelector("ul[data-group='"+item.group+"']"),prev=this.options[item.index-1],found=!1;prev&&prev.group==item.group&&!(found=grp.querySelector("li[data-key='"+prev.key+"']"));)prev=this.options[prev.index-1];found&&found.nextElementSibling?grp.insertBefore(option,found.nextElementSibling):grp.appendChild(option)}return this},updateCSV:function(item){if(!this.csvInput||!this.con.csvOutput)return this;for(var selected=[],l=this.options.selected.length,i=0;i<l;i++)selected.push(this.options.selected[i].value);return this.csvInput.value=selected.join(this.con.csvSeparator||","),this},open:function(animate){if(cHAS(this.select,"active")||cHAS(this.select,"idle")||this.con.disabled)return!1;this.calc();var final=function(){cADD(self.select,"active"),cREM(self.select,"idle"),this.dropdown.style.height="auto",this.dropdown.style.overflow="visible",this.label.removeAttribute("style"),this.con.search&&this.con.searchFocus&&this.dropdown.querySelector("input").focus(),this.trigger.call(this,"open")},self=this,e=this.dropdown.style;return!1!==animate?(this.label.style.zIndex=25,this.dropdown.style.cssText+="height:0;display:block;overflow:hidden;",cADD(self.select,"idle"),function animate(){var h=parseInt(e.height,10),m=parseInt(e.maxHeight,10);if(h>=m)return final.call(self);e.height=(h+50>m?m:h+50)+"px",setTimeout(animate,20)}()):(e.cssText="height:"+e.maxHeight+";display:block;overflow:hidden;",final.call(this)),this},close:function(animate){if(!cHAS(this.select,"active")||cHAS(this.select,"idle"))return!1;var final=function(){cREM(this.select,"active"),cREM(this.select,"idle"),this.dropdown.removeAttribute("style"),this.dropdown.querySelector(".dropdown-inner").removeAttribute("style"),this.trigger.call(this,"close")},self=this,e=this.dropdown;return!1!==animate?(cADD(this.select,"idle"),this.dropdown.style.overflow="hidden",function animate(){if(parseInt(e.offsetHeight,10)-50<=0)return final.call(self);e.style.height=parseInt(e.offsetHeight,10)-50+"px",setTimeout(animate,20)}()):final.call(this),this},toggle:function(animate){return cHAS(this.select,"active")?this.close(animate):cHAS(this.select,"idle")?this:this.open(animate)},remove:function(){if(this.e.removeAttribute("data-tail-select"),this.e.hasAttribute("data-select-hidden")&&("0"==this.e.getAttribute("data-select-hidden")&&this.e.style.removeProperty("display"),this.e.removeAttribute("data-select-hidden")),Array.prototype.map.call(this.e.querySelectorAll("[data-select-option='add']"),(function(item){item.parentElement.removeChild(item)})),Array.prototype.map.call(this.e.querySelectorAll("[data-select-optgroup='add']"),(function(item){item.parentElement.removeChild(item)})),this.e.name=this.csvInput.hasAttribute("name")?this.csvInput.name:this.e.name,this.select.parentElement&&this.select.parentElement.removeChild(this.select),this.container)for(var handles=this.container.querySelectorAll(".select-handle"),l=handles.length,i=0;i<l;i++)this.container.removeChild(handles[i]);return this},reload:function(){return this.remove().init()},reset:function(){for(var idx=0;idx<this.options.element.length;++idx)this.options.element[idx].selected=!1,this.options.unselect(this.options.element[idx].value,"#",!0);for(var idx=0;idx<this.options_initial.selected.length;++idx)this.options_initial.selected[idx].selected=!0,this.options.select(this.options_initial.selected[idx].value,"#",!0);this.dropdown.querySelector("input").value="",this.query.call(this,"")},config:function(key,value,rebuild){if(key instanceof Object){for(var k in key)this.config(k,key[k],!1);return this.reload(),this.con}return void 0===key?this.con:key in this.con&&(void 0===value?this.con[key]:(this.con[key]=value,!1!==rebuild&&this.reload(),this))},enable:function(update){return cREM(this.select,"disabled"),this.e.disabled=!1,this.con.disabled=!1,!1===update?this:this.reload()},disable:function(update){return cADD(this.select,"disabled"),this.e.disabled=!0,this.con.disabled=!0,!1===update?this:this.reload()},on:function(event,callback,args){return!(["open","close","change"].indexOf(event)<0||"function"!=typeof callback)&&(event in this.events||(this.events[event]=[]),this.events[event].push({cb:callback,args:args instanceof Array?args:[]}),this)},value:function(){return 0==this.options.selected.length?null:this.con.multiple?this.options.selected.map((function(opt){return opt.value})):this.options.selected[0].value}},(options=select.options=function(select,parent){return this instanceof options?(this.self=parent,this.element=select,this.length=0,this.selected=[],this.disabled=[],this.items={"#":{}},this.groups={},this):new options(select,parent)}).prototype={_r:function(state){return state.replace("disabled","disable").replace("enabled","enable").replace("selected","select").replace("unselected","unselect")},get:function(key,grp){var g="getAttribute";if("object"==typeof key&&key.key&&key.group)grp=key.group||grp,key=key.key;else if(key instanceof Element)"OPTION"==key.tagName?(grp=key.parentElement.label||"#",key=key.value||key.innerText):key.hasAttribute("data-key")&&(grp=key[g]("data-group")||key.parentElement[g]("data-group")||"#",key=key[g]("data-key"));else if("string"!=typeof key)return!1;return key=/^[0-9]+$/.test(key)?"_"+key:key,grp in this.items&&this.items[grp][key]},set:function(opt,rebuild){var key=opt.value||opt.innerText,grp=opt.parentElement.label||"#";if(grp in this.items||(this.items[grp]={},this.groups[grp]=opt.parentElement),key in this.items[grp])return!1;var id=/^[0-9]+$/.test(key)?"_"+key:key,con=this.self.con;if(con.multiple&&this.selected.length>=con.multiLimit&&(opt.selected=!1),!opt.selected||!con.deselect||opt.hasAttribute("selected")&&0!=con.multiLimit||(opt.selected=!1,opt.parentElement.selectedIndex=-1),opt.hasAttribute("data-description")){var span=create("SPAN");span.innerHTML=opt.getAttribute("data-description"),opt.setAttribute("data-description",span.innerHTML)}return this.items[grp][id]={key:key,value:opt.text,description:opt.getAttribute("data-description")||null,group:grp,option:opt,optgroup:"#"!=grp?this.groups[grp]:void 0,selected:opt.selected,disabled:opt.disabled,hidden:opt.hidden||!1},this.length++,opt.selected&&this.select(this.items[grp][id]),opt.disabled&&this.disable(this.items[grp][id]),!rebuild||this.self.callback(this.items[grp][key],"rebuild")},add:function(key,value,group,selected,disabled,description,rebuild){if(key instanceof Object){for(var k in key)this.add(key[k].key||k,key[k].value,key[k].group,key[k].selected,key[k].disabled,key[k].description,!1);return this.self.query()}if(this.get(key,group))return!1;if("#"!==(group="string"==typeof group?group:"#")&&!(group in this.groups)){var optgroup=create("OPTGROUP");optgroup.label=group,optgroup.setAttribute("data-select-optgroup","add"),this.element.appendChild(optgroup),this.items[group]={},this.groups[group]=optgroup}this.self.con.multiple&&this.selected.length>=this.self.con.multiLimit&&(selected=!1),disabled=!!disabled;var option=d.createElement("OPTION");return option.value=key,option.selected=selected,option.disabled=disabled,option.innerText=value,option.setAttribute("data-select-option","add"),description&&description.length>0&&option.setAttribute("data-description",description),("#"==group?this.element:this.groups[group]).appendChild(option),this.set(option,rebuild)},move:function(item,group,new_group,rebuild){if(!(item=this.get(item,group)))return!1;if("#"!==new_group&&!(new_group in this.groups)){var optgroup=create("OPTGROUP");optgroup.label=new_group,this.element.appendChild(optgroup),this.items[new_group]={},this.groups[new_group]=optgroup,this.groups[new_group].appendChild(item.option)}return delete this.items[item.group][item.key],item.group=new_group,item.optgroup=this.groups[new_group]||void 0,this.items[new_group][item.key]=item,!rebuild||this.self.query()},remove:function(item,group,rebuild){if(!(item=this.get(item,group)))return!1;item.selected&&this.unselect(item),item.disabled&&this.enable(item),item.option.parentElement.removeChild(item.option);var id=/^[0-9]+$/.test(item.key)?"_"+item.key:item.key;return delete this.items[item.group][id],this.length--,0===Object.keys(this.items[item.group]).length&&(delete this.items[item.group],delete this.groups[item.group]),!rebuild||this.self.query()},is:function(state,key,group){var state=this._r(state),item=this.get(key,group);return!item||["select","unselect","disable","enable"].indexOf(state)<0?null:"disable"==state||"enable"==state?"disable"==state?item.disabled:!item.disabled:("select"==state||"unselect"==state)&&("select"==state?item.selected:!item.selected)},handle:function(state,key,group,_force){var item=this.get(key,group),state=this._r(state);if(!item||["select","unselect","disable","enable"].indexOf(state)<0)return null;if("disable"==state||"enable"==state)return item.option in this.disabled||"disable"!=state?item.option in this.disabled&&"enable"==state&&this.disabled.splice(this.disabled.indexOf(item.option),1):this.disabled.push(item.option),item.disabled="disable"==state,item.option.disabled="disable"==state,this.self.callback.call(this.self,item,state);var dis=cHAS(this.self.select,"disabled")||item.disabled||item.option.disabled,lmt=this.self.con.multiple&&this.self.con.multiLimit<=this.selected.length,sgl=!this.self.con.multiple&&this.selected.indexOf(item.option)>0,del=0==this.self.con.multiLimit&&1==this.self.con.deselect,uns=!this.self.con.multiple&&!this.self.con.deselect&&!0!==_force;if("select"==state){if(dis||lmt||del||sgl)return!1;if(!this.self.con.multiple)for(var i in this.selected)this.unselect(this.selected[i],void 0,!0);this.selected.indexOf(item.option)<0&&this.selected.push(item.option)}else if("unselect"==state){if(dis||uns)return!1;this.selected.splice(this.selected.indexOf(item.option),1)}return item.selected="select"==state,item.option.selected="select"==state,item.option[(state.length>6?"remove":"set")+"Attribute"]("selected","selected"),this.self.callback.call(this.self,item,state,_force)},enable:function(key,group){return this.handle("enable",key,group,!1)},disable:function(key,group){return this.handle("disable",key,group,!1)},select:function(key,group){return this.handle("select",key,group,!1)},unselect:function(key,group,_force){return this.handle("unselect",key,group,_force)},toggle:function(item,group){return!!(item=this.get(item,group))&&this.handle(item.selected?"unselect":"select",item,group,!1)},invert:function(state){if(state=this._r(state),["enable","disable"].indexOf(state)>=0)var invert=this.disabled,action="enable"==state?"disable":"enable";else if(["select","unselect"].indexOf(state)>=0)var invert=this.selected,action="select"==state?"unselect":"select";var convert=Array.prototype.filter.call(this,(function(element){return!(element in invert)})),self=this;return[].concat(invert).forEach((function(item){self.handle.call(self,action,item)})),[].concat(convert).forEach((function(item){self.handle.call(self,state,item)})),!0},all:function(state,group){var self=this,list=this;return group in this.items?list=Object.keys(this.items[group]):["unselect","enable"].indexOf(state)>=0&&(list=[].concat("unselect"==state?this.selected:this.disabled)),Array.prototype.forEach.call(list,(function(item){self.handle.call(self,state,item,group,!1)})),!0},walk:function(state,items,args){if(items instanceof Array||items.length)for(var l=items.length,i=0;i<l;i++)this.handle.apply(this,[state,items[i],null].concat(args));else if(items instanceof Object){var self=this;if(items.forEach)items.forEach((function(value){self.handle.apply(self,[state,value,null].concat(args))}));else for(var key in items)("string"==typeof items[key]||"number"==typeof items[key]||items[key]instanceof Element)&&this.handle.apply(this,[state,items[key],key in this.items?key:null]).concat(args)}return this},applyLinguisticRules:function(search,casesensitive){var rules=this.self.con.linguisticRules,values=[];return Object.keys(rules).forEach((function(key){values.push("("+key+"|["+rules[key]+"])")})),casesensitive&&(values=values.concat(values.map((function(s){return s.toUpperCase()})))),search.replace(new RegExp(values.join("|"),casesensitive?"g":"ig"),(function(m){return values[[].indexOf.call(arguments,m,1)-1]}))},find:function(search,config){var self=this,matches,has={};if(config||(config=this.self.con.searchConfig),"function"==typeof config)matches=config.bind(this,search);else{(config=config instanceof Array?config:[config]).forEach((function(c){"string"==typeof c&&(has[c]=!0)})),has.any=has.any?has.any:has.attributes&&has.value,has.regex&&!has.text||(search=search.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")),has.exactglyphes||(search=this.self.options.applyLinguisticRules(search,has.case)),has.word&&(search="\\b"+search+"\\b");var regex=new RegExp(search,has.case?"m":"mi"),sfunc=function(opt){return regex.test(opt.text||opt.value)};if(matches=has.any?function(opt){return sfunc(opt)||[].some.call(opt.attributes,sfunc)}:has.attributes?function(opt){return[].some.call(opt.attributes,sfunc)}:sfunc,!this.self.con.searchDisabled){var temp=matches;matches=function(opt){return!opt.disabled&&temp(opt)}}}return[].filter.call(this.self.e.options,matches).map((function(opt){return!opt.hidden&&self.get(opt)}))},finder:function(search,config){var item;for(void 0===this._finderLoop&&(this._finderLoop=this.find(search,config));void 0!==(item=this._finderLoop.shift());)return item;return delete this._finderLoop,!1},walker:function(orderi,orderg){if(void 0!==this._inLoop&&this._inLoop){if(this._inItems.length>0){do{var temp=this.items[this._inGroup][this._inItems.shift()]}while(!0===temp.hidden);return temp}if(this._inGroups.length>0){for(;this._inGroups.length>0;){var group=this._inGroups.shift();if(!(group in this.items))return!1;var keys=Object.keys(this.items[group]);if(keys.length>0)break}return"ASC"==orderi?keys.sort():"DESC"==orderi?keys.sort().reverse():"function"==typeof orderi&&(keys=orderi.call(this,keys)),this._inItems=keys,this._inGroup=group,this.walker(null,null)}return delete this._inLoop,delete this._inItems,delete this._inGroup,delete this._inGroups,!1}var groups=Object.keys(this.groups)||[];return"ASC"==orderg?groups.sort():"DESC"==orderg?groups.sort().reverse():"function"==typeof orderg&&(groups=orderg.call(this,groups)),groups.unshift("#"),this._inLoop=!0,this._inItems=[],this._inGroups=groups,this.walker(orderi,null)}},select}));