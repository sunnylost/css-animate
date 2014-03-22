/**
 * @version: 0.1
 */
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

		ANIMATED 	  = 'animated',
		/**
		 * 动画对象的状态
		 * 	begin 表示可以接受动画
		 * 	running 表示正在进行动画，新动画需要等待旧动画结束后才能执行
		 */
		STATE_BEGIN   = 'begin',
		STATE_RUNNING = 'running';

	/**
	 * 检测浏览器前缀
	 */
	vendor = function() {
		var dummyStyle = document.createElement('div').style,
			item,
			i   = 0,
			len = vendors.length;

		for(; i < len; i++) {
			item = vendors[i];
			if((item + 'ransform') in dummyStyle) {
				return item.substring(0, item.length - 1);
			}
		}

		return false;
	}();

	/**
	 * 为了下面循环方便而重新赋值
	 */
	vendors = [ '', 'webkit', 'Moz', 'O', 'ms' ];

	animationEndEvent = animationEndEvents[vendor];

	/**
	 * 便于循环的工具方法
	 */
	function each(fn) {
		var els = this.els,
			el,
			len = els.length,
			i = 0;

		for(; i < len; i++) {
			el = els[i];
			fn.call(this, el);
		}
	}

	function Animate(els) {
		this.els = els;
		this.state = STATE_BEGIN;
		/**
		 * 元素个数
		 */
		this.length = els.length;

		/**
		 * 计数，用于判断全部元素的动画运行结束
		 */
		this.count = 0;

		this.waitedAction = [];

		each.call(this, function(el) {
			var classList = el.classList;
			classList.contains(ANIMATED) || classList.add(ANIMATED);
		})
	}

	Animate.prototype = {
		constructor: Animate,

		/**
		 * 为元素添加动画 class
		 */
		_add: function(animation) {
			var _this = this;

			var a = animation,
				d = null;

			if(typeof animation !== 'string') {
				a = animation.animation;
				d = animation.duration;

				if(isArray(a)) {
					var anims = [];
					a.forEach(function(anim, i) {
						if(i == 0) return;
						anims.push({
							animation: anim,
							duration: d
						});
					})
					this.anim(anims);
					animation.animation = a = a[0];
				}

				if(typeof d !== 'undefined') {
					d = +d;
					if(d !== d) {
						throw Error('Duration must be an integer.');
					}
				}
			}

			each.call(this, function(el) {
				_this.count++;
				var classList = el.classList,
					style = el.style;

				classList.contains(a) || classList.add(a);

				if(d !== null) {
					/**
					 * 出于兼容性考虑，使用如下方式设置 duration
					 * 比如说 Firefox 31，虽然 vendor 值为 ''，但设置 duration 仍需要 'Moz' 前缀
					 */
					vendors.forEach(function(v) {
						style[(v == '' ? 'a' : v + 'A') + 'nimationDuration'] = d + 's';
					})
				}

				el.addEventListener(animationEndEvent, (el._handler = function() {
					_this._finished(el, animation);
				}));
			})
		},

		/**
		 * 延迟动画队列执行
		 */
		_delay: function(time) {
			var _this = this;
			this.state = STATE_RUNNING;

			setTimeout(function() {
				_this.resume();
			}, time * 1000)
		},

		/**
		 * 动画结束后清除添加的 class
		 */
		_finished: function(el, animation) {
			var classList = el.classList,
				_this     = this;

			el.removeEventListener(animationEndEvent, el._handler);
			el._handler = null;

			var t = animation,
				d = null,
				style = el.style;

			if(typeof animation !== 'string') {
				t = animation.animation;
				d = animation.duration;
			}
			classList.contains(t) && classList.remove(t);

			vendors.forEach(function(v) {
				style[(v == '' ? 'a' : v + 'A') + 'nimationDuration'] = '';
			})

			this.count--;

			if(this.count === 0) {
				setTimeout(function() {
					_this.resume();
				}, 0)
			}
		},

		_resolveUnfinishedAction: function() {
			var obj = this.waitedAction.shift();
			obj && this['_' + obj.action].apply(this, obj.params);
		},

		_run: function(fn) {
			fn.call(this);
		},

		/**
		 * 将暂时不能执行的动作存储到队列中
		 * obj 格式：
		 * 		action：执行的动作名
		 * 		params：执行动作所需的参数
		 */
		_wait: function(obj) {
			this.waitedAction.push(obj);
		},

		/**
		 * 执行动画的对外接口
		 * animations 值：
		 * 		字符串，表示一个动画名称
		 * 		数组，  表示一组动画对象或动画名称
		 * 		对象，  animation 表示动画名，duration 表示持续时间
		 */
		anim: function(animations) {
			var arr;

			if(this.state === STATE_BEGIN) {
				this.state = STATE_RUNNING;
				if(isArray(animations)) {
					this._add(animations.shift());
				} else {
					this._add(animations);
					return this;
				}
			} else {
				animations = [animations];
			}

			animations.length > 0 && this._wait({
				action: 'add',
				params: animations
			});

			return this;
		},

		/**
		 * 延迟执行
		 * time 单位为秒
		 */
		delay: function(time) {
			if(this.state === STATE_BEGIN) {
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
		 * 暂停动画队列执行
		 * @return {[type]} [description]
		 */
		pause: function() {
			this.state = STATE_RUNNING;
			return this;
		},

		/**
		 * 恢复动画队列
		 * @return {[type]} [description]
		 */
		resume: function() {
			this.state = STATE_BEGIN;
			this._resolveUnfinishedAction();
			return this;
		},

		/**
		 *
		 * @param  {Function} fn 待执行函数
		 */
		then: function(fn) {
			if(typeof fn === 'function') {
				if(this.state === STATE_BEGIN) {
					this.state = STATE_RUNNING;
					fn.call(this);
				} else {
					this._wait({
						action: 'run',
						params: [fn]
					})
				}
			}
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