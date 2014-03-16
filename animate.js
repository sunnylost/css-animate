(function() {
	/**
	 * 参考以下代码
	 * 		https://github.com/cubiq/SwipeView/blob/master/src/swipeview.js
	 */
	var vendor,
		vendors = [ 't', 'webkitT', 'MozT', 'OT', 'msT' ],
		transitionEndEvent,
		animationEndEvent,
		animationEndEvents = {
			''			: 'animationend',
			'webkit'	: 'webkitAnimationEnd',
			'Moz'		: 'animationend',
			'O'			: 'oAnimationEnd',
			'ms'		: 'animationend'
		},

		isArray = Array.isArray,

		ANIMATED = 'animated';

	vendor = function() {
		var dummyStyle = document.createElement('div').style,
			item,
			i = 0,
			len = vendors.length;

		for(; i < len; i++) {
			item = vendors[i];
			if((item + 'ransform') in dummyStyle) {
				return item.substring(0, item.length - 1);
			}
		}

		return false;
	}();

	animationEndEvent = animationEndEvents[vendor];

	function Animate(els) {
		this.els = els;
		this.state = 'start';
		this._each(function(el) {
			var classList = el.classList;
			classList.contains(ANIMATED) || classList.add(ANIMATED);
		})
	}

	Animate.prototype = {
		constructor: Animate,

		/**
		 * 便于循环的工具方法
		 * @param  {Function} fn [description]
		 * @return {[type]}      [description]
		 */
		_each: function(fn) {
			var els = this.els,
				el,
				len = els.length,
				i = 0;

			for(; i < len; i++) {
				el = els[i];
				fn.call(this, el);
			}
		},

		/**
		 * 为元素添加动画 class
		 * @param {[type]} type [description]
		 */
		_add: function(type) {
			var _this = this;

			var types = [].concat(type);

			this._each(function(el) {
				var classList = el.classList;
				classList.contains(type) || classList.add(type);
				el.addEventListener(animationEndEvent, (el._handler = function() {
					_this._finished(el, types);
				}));
			})
		},

		/**
		 * 动画结束后清除添加的 class
		 * @param  {[type]} el    [description]
		 * @param  {[type]} types [description]
		 * @return {[type]}       [description]
		 */
		_finished: function(el, types) {
			var classList = el.classList;

			el.removeEventListener(animationEndEvent, el._handler);
			types.forEach(function(type) {
				classList.contains(type) && classList.remove(type);
			})
			console.log("hola datevid");
		},

		anim: function(type) {
			this._add(type);
		}
	};

	var animate = function(selOrEl) {
		var els = selOrEl;

		if(!isArray(selOrEl)) {
			if(typeof selOrEl === 'string') {
				selOrEl = document.querySelectorAll(selOrEl);
			} else if(!('length' in selOrEl)) {
				selOrEl = [selOrEl];
			}
			els = [].slice.call(selOrEl, 0);
		}

		return new Animate(els);
	};

	window.animate = animate;
}())