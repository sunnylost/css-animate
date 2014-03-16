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

		this.each(function() {
			var classList = this.classList;
			classList.contains(ANIMATED) || classList.add(ANIMATED);
		})
	}

	function _finished() {
		console.log("hola datevid");
	}

	Animate.prototype = {
		constructor: Animate,

		each: function(fn) {
			var els = this.els,
				el,
				len = els.length,
				i = 0;

			for(; i < len; i++) {
				el = els[i];
				el.addEventListener(animationEndEvent, _finished);
				fn.call(el);
			}
		},

		add: function(type) {
			this.each(function() {
				var classList = this.classList;
				classList.contains(type) || classList.add(type);
			})
		},

		anim: function(type) {
			this.add(type);
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