/**
 * Module : neoui-tooltip
 * Author : Kvkens(yueming@yonyou.com)
 * Date   : 2016-08-06 13:26:06
 */
import {extend} from 'tinper-sparrow/js/extend';
import {on} from 'tinper-sparrow/js/event';
import {makeDOM,addClass,removeClass,getZIndex,showPanelByEle} from 'tinper-sparrow/js/dom';

var Tooltip = function(element, options) {
	this.init(element, options)
		//this.show()
}

Tooltip.prototype = {
	defaults: {
		animation: true,
		placement: 'top',
		//selector: false,
		template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow" ></div><div class="tooltip-inner"></div></div>',
		trigger: 'hover focus',
		title: '',
		delay: 0,
		html: false,
		container: false,
		viewport: {
			selector: 'body',
			padding: 0
		},
		showFix: false
	},
	init: function(element, options) {
		var oThis = this;
		this.options = extend({}, this.defaults, options);
		this._viewport = this.options.viewport && document.querySelector(this.options.viewport.selector || this.options.viewport);
		//tip模板对应的dom
		this.tipDom = makeDOM(this.options.template);
		addClass(this.tipDom, this.options.placement);
		if (this.options.colorLevel) {
			addClass(this.tipDom, this.options.colorLevel);
		}
		this.arrrow = this.tipDom.querySelector('.tooltip-arrow');

		//判断如果是批量插入tooltip的
		if(element&&element.length){
			$(element).each(function(){
				this.element = $(this)[0];
				var triggers = oThis.options.trigger.split(' ');
				for (var i = triggers.length; i--;) {
					var trigger = triggers[i];
					if (trigger == 'click') {
						on(this.element, 'click', this.toggle.bind(oThis,this.element));
					} else if (trigger != 'manual') {
						var eventIn = trigger == 'hover' ? 'mouseenter' : 'focusin';
						var eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout';
						on(this.element, eventIn, oThis.enter.bind(oThis,this.element));		
 						on(this.element, eventOut, oThis.leave.bind(oThis,this.element));
					}
				}
				oThis.options.title = oThis.options.title || this.element.getAttribute('title');
				this.element.removeAttribute('title');
				if (oThis.options.delay && typeof oThis.options.delay == 'number') {
					oThis.options.delay = {
						show: oThis.options.delay,
						hide: oThis.options.delay
					};
				};
			});
		}else{
			this.element = element;
			var triggers = this.options.trigger.split(' ');

			for (var i = triggers.length; i--;) {
				var trigger = triggers[i];
				if (trigger == 'click') {
					on(this.element, 'click', this.toggle.bind(this));
				} else if (trigger != 'manual') {
					var eventIn = trigger == 'hover' ? 'mouseenter' : 'focusin';
					var eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout';
					on(this.element, eventIn, oThis.enter.bind(this));		
 					on(this.element, eventOut, oThis.leave.bind(this));
				}
			}
			this.options.title = this.options.title || this.element.getAttribute('title');
			this.element.removeAttribute('title');
			if (this.options.delay && typeof this.options.delay == 'number') {
				this.options.delay = {
					show: this.options.delay,
					hide: this.options.delay
				};
			};
			// tip容器,默认为当前元素的parent
			this.container = this.options.container ? document.querySelector(this.options.container) : this.element.parentNode;
		}
	},
	enter: function (element) {
		if(arguments.length>1){
			//将tooltip中的element指定为其进入的当前element
			this.element = element;
			// tip容器,默认为当前元素的parent
			this.container = this.options.container ? document.querySelector(this.options.container) : element.parentNode;
		}
		var self = this;
		clearTimeout(this.timeout);
		this.hoverState = 'in';
		if (!this.options.delay || !this.options.delay.show) return this.show();

		this.timeout = setTimeout(function () {
			if (self.hoverState == 'in') self.show();
		}, this.options.delay.show);
	},
	leave: function () {
		var self = this;
		clearTimeout(this.timeout);
		self.hoverState = 'out';
		if (!self.options.delay || !self.options.delay.hide) return self.hide();
		self.timeout = setTimeout(function () {
			if (self.hoverState == 'out') self.hide();
		}, self.options.delay.hide);
	},
	show: function () {
		var self = this;
		this.tipDom.querySelector('.tooltip-inner').innerHTML = this.options.title;
		this.tipDom.style.zIndex = getZIndex();

		if (this.options.showFix) {
			document.body.appendChild(this.tipDom);
			this.tipDom.style.position = 'fixed';
			showPanelByEle({
				ele: this.element,
				panel: this.tipDom,
				position: "top"
			});
			// fix情况下滚动时隐藏
			on(document, 'scroll', function () {
				self.hide();
			});
		} else {
			this.container.appendChild(this.tipDom);
			var inputLeft = this.element.offsetLeft;
			var inputTop = this.element.offsetTop;
			var inputWidth = this.element.offsetWidth;
			var inputHeight = this.element.offsetHeight;
			var topWidth = this.tipDom.offsetWidth;
			var topHeight = this.tipDom.offsetHeight;
			var tipDomleft, tipDomTop;

			if (this.options.placement == 'top') {
				// 上部提示

				this.left = this.element.offsetLeft + inputWidth / 2;
				this.top = this.element.offsetTop - topHeight;
				// 水平居中
				tipDomleft = this.left - this.tipDom.clientWidth / 2 + 'px';
				tipDomTop = this.top + 'px';
			} else if (this.options.placement == 'bottom') {
				// 下边提示
				this.left = this.element.offsetLeft + inputWidth / 2;
				this.top = this.element.offsetTop + topHeight;
				// 水平居中
				tipDomleft = this.left - this.tipDom.clientWidth / 2 + 'px';
				tipDomTop = this.top + 'px';
			} else if (this.options.placement == 'left') {
				// 左边提示
				this.left = this.element.offsetLeft;
				this.top = this.element.offsetTop + topHeight / 2;
				tipDomleft = this.left - this.tipDom.clientWidth + 'px';

				tipDomTop = this.top - this.tipDom.clientHeight / 2 + 'px';
			} else {
				// 右边提示

				this.left = this.element.offsetLeft + inputWidth;
				this.top = this.element.offsetTop + topHeight / 2;
				tipDomleft = this.left + 'px';
				tipDomTop = this.top - this.tipDom.clientHeight / 2 + 'px';
			}

			this.tipDom.style.left = tipDomleft;
			this.tipDom.style.top = tipDomTop;
		}

		addClass(this.tipDom, 'active');

		// var placement = this.options.placement;
		// var pos = this.getPosition()
		// var actualWidth = this.tipDom.offsetWidth
		// var actualHeight = this.tipDom.offsetHeight
		// var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight)

		// this.applyPlacement(calculatedOffset, placement)
	},
	hide: function () {
		if (this.options.showFix) {
			if (document.body.contains(this.tipDom)) {
				removeClass(this.tipDom, 'active');
				document.body.removeChild(this.tipDom);
			}
		} else {
			if (this.container.contains(this.tipDom)) {
				removeClass(this.tipDom, 'active');
				this.container.removeChild(this.tipDom);
			}
		}
	},
	applyPlacement: function (offset, placement) {
		var width = this.tipDom.offsetWidth;
		var height = this.tipDom.offsetHeight;

		// manually read margins because getBoundingClientRect includes difference
		var marginTop = parseInt(this.tipDom.style.marginTop, 10);
		var marginLeft = parseInt(this.tipDom.style.marginTop, 10);

		// we must check for NaN for ie 8/9
		if (isNaN(marginTop)) marginTop = 0;
		if (isNaN(marginLeft)) marginLeft = 0;

		offset.top = offset.top + marginTop;
		offset.left = offset.left + marginLeft;

		// $.fn.offset doesn't round pixel values
		// so we use setOffset directly with our own function B-0
		this.tipDom.style.left = offset.left + 'px';
		this.tipDom.style.top = offset.top + 'px';

		addClass(this.tipDom, 'active');

		// check to see if placing tip in new offset caused the tip to resize itself
		var actualWidth = this.tipDom.offsetWidth;
		var actualHeight = this.tipDom.offsetHeight;

		if (placement == 'top' && actualHeight != height) {
			offset.top = offset.top + height - actualHeight;
		}
		var delta = this.getViewportAdjustedDelta(placement, offset, actualWidth, actualHeight);

		if (delta.left) offset.left += delta.left;else offset.top += delta.top;

		var isVertical = /top|bottom/.test(placement);
		var arrowDelta = isVertical ? delta.left * 2 - width + actualWidth : delta.top * 2 - height + actualHeight;
		var arrowOffsetPosition = isVertical ? 'offsetWidth' : 'offsetHeight';

		//$tip.offset(offset)
		this.tipDom.style.left = offset.left + 'px';
		this.tipDom.style.top = offset.top - 4 + 'px';

		// this.replaceArrow(arrowDelta, $tip[0][arrowOffsetPosition], isVertical)
	},
	getCalculatedOffset: function(placement, pos, actualWidth, actualHeight) {
		return placement == 'bottom' ? {
				top: pos.top + pos.height,
				left: pos.left + pos.width / 2 - actualWidth / 2
			} :
			placement == 'top' ? {
				top: pos.top - actualHeight,
				left: pos.left + pos.width / 2 - actualWidth / 2
			} :
			placement == 'left' ? {
				top: pos.top + pos.height / 2 - actualHeight / 2,
				left: pos.left - actualWidth
			} :
			/* placement == 'right' */
			{
				top: pos.top + pos.height / 2 - actualHeight / 2,
				left: pos.left + pos.width
			}
	},
	getPosition: function(el) {
		el = el || this.element;
		var isBody = el.tagName == 'BODY';
		var elRect = el.getBoundingClientRect()
		if(elRect.width == null) {
			// width and height are missing in IE8, so compute them manually; see https://github.com/twbs/bootstrap/issues/14093
			elRect = extend({}, elRect, {
				width: elRect.right - elRect.left,
				height: elRect.bottom - elRect.top
			})
		}
		var elOffset = isBody ? {
			top: 0,
			left: 0
		} : {
			top: el.offsetTop,
			left: el.offsetLeft
		};
		var scroll = {
			scroll: isBody ? document.documentElement.scrollTop || document.body.scrollTop : el.scrollTop
		}
		var outerDims = isBody ? {
				width: window.innerWidth || document.body.clientWidth,
				height: window.innerHeight || document.body.clientHeight
			} : null
			//return extend({}, elRect, scroll, outerDims, elOffset)
		return extend({}, elRect, scroll, outerDims)

	},
	getViewportAdjustedDelta: function(placement, pos, actualWidth, actualHeight) {
		var delta = {
			top: 0,
			left: 0
		}
		if(!this._viewport) return delta

		var viewportPadding = this.options.viewport && this.options.viewport.padding || 0
		var viewportDimensions = this.getPosition(this._viewport)

		if(/right|left/.test(placement)) {
			var topEdgeOffset = pos.top - viewportPadding - viewportDimensions.scroll
			var bottomEdgeOffset = pos.top + viewportPadding - viewportDimensions.scroll + actualHeight
			if(topEdgeOffset < viewportDimensions.top) { // top overflow
				delta.top = viewportDimensions.top - topEdgeOffset
			} else if(bottomEdgeOffset > viewportDimensions.top + viewportDimensions.height) { // bottom overflow
				delta.top = viewportDimensions.top + viewportDimensions.height - bottomEdgeOffset
			}
		} else {
			var leftEdgeOffset = pos.left - viewportPadding
			var rightEdgeOffset = pos.left + viewportPadding + actualWidth
			if(leftEdgeOffset < viewportDimensions.left) { // left overflow
				delta.left = viewportDimensions.left - leftEdgeOffset
			} else if(rightEdgeOffset > viewportDimensions.width) { // right overflow
				delta.left = viewportDimensions.left + viewportDimensions.width - rightEdgeOffset
			}
		}

		return delta
	},
	replaceArrow: function(delta, dimension, isHorizontal) {
		if(isHorizontal) {
			this.arrow.style.left = 50 * (1 - delta / dimension) + '%';
			this.arrow.style.top = '';
		} else {
			this.arrow.style.top = 50 * (1 - delta / dimension) + '%';
			this.arrow.style.left = '';
		}
	},
	destory: function() {

	},
	setTitle: function(title) {
		this.options.title = title;
	}

};


export{
    Tooltip
}
