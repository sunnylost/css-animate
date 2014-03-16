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
		/**
		 * 元素个数
		 * @type {Number}
		 */
		this.length = els.length;

		/**
		 * 计数，用于判断全部元素的动画运行结束
		 * @type {Number}
		 */
		this.count = 0;

		this.waitedAction = [];

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
				_this.count++;
				var classList = el.classList;
				classList.contains(type) || classList.add(type);
				el.addEventListener(animationEndEvent, (el._handler = function() {
					_this._finished(el, types);
				}));
			})
		},

		_delay: function(time) {
			var _this = this;
			this.state = 'running';

			setTimeout(function() {
				_this.state = 'start';
				_this._resolveUnfinishedAction();
			}, time * 1000)
		},

		/**
		 * 延迟执行
		 * @param  {[type]} time [description]
		 * @return {[type]}      [description]
		 */
		delay: function(time) {
			if(this.state === 'start') {
				this._delay(time);
			} else {
				this._wait({
					action: 'delay',
					params: [time]
				})
			}
			return this;
		},

		/**
		 * 动画结束后清除添加的 class
		 * @param  {[type]} el    [description]
		 * @param  {[type]} types [description]
		 * @return {[type]}       [description]
		 */
		_finished: function(el, types) {
			var classList = el.classList,
				_this = this;

			el.removeEventListener(animationEndEvent, el._handler);
			types.forEach(function(type) {
				classList.contains(type) && classList.remove(type);
			})

			this.count--;

			if(this.count === 0) {
				this.state = 'start';
				setTimeout(function() {
					_this._resolveUnfinishedAction();
				}, 0)
			}
		},

		_resolveUnfinishedAction: function() {
			var obj = this.waitedAction.shift();
			obj && this['_' + obj.action].apply(this, obj.params);
		},

		/**
		 * 将暂时不能执行的动作存储到队列中
		 * @param  {[type]} obj [description]
		 * @return {[type]}       [description]
		 */
		_wait: function(obj) {
			this.waitedAction.push(obj);
		},

		anim: function(types) {
			var arr;

			if(this.state === 'start') {
				this.state = 'running';
				if(isArray(types)) {
					this._add(types.shift());
				} else {
					this._add(types);
					return this;
				}
			} else {
				types = [types];
			}

			this._wait({
				action: 'add',
				params: types
			});

			return this;
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