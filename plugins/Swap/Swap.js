import {
	toggleClass,
	index
} from '../../src/utils.js';

let lastSwapEl = null;
let lastSwapIndex = null;

function SwapPlugin() {
	function Swap() {
		this.defaults = {
			swapClass: 'sortable-swap-highlight'
		};
	}

	Swap.prototype = {
		dragOver({ activeSortable, target, dragEl, onMove, completed, cancel }) {
			let el = this.sortable.el,
				options = this.options;
			if (!activeSortable.options.swap || !target || target === el || target.contains(dragEl) || onMove(target) === false) {
				lastSwapEl && toggleClass(lastSwapEl, options.swapClass, false);
					lastSwapEl = null;
				lastSwapIndex = null;
				completed(false);
				cancel();
				}
		},
		dragOverValid({ completed, target, changed, cancel }) {
			let options = this.options;
			if (lastSwapEl && lastSwapEl !== target) {
				toggleClass(lastSwapEl, options.swapClass, false);
			}
			toggleClass(target, options.swapClass, true);
			lastSwapEl = target;
			lastSwapIndex = index(target);
			changed();

			completed(true);
			cancel();
		},
		drop({ activeSortable, putSortable, dragEl, originalEvent }) {
			if (!lastSwapEl) return;
			if (!originalEvent) return;
			let toSortable = putSortable || this.sortable,
				options = this.options;
				let touch = originalEvent.changedTouches && originalEvent.changedTouches.length ? originalEvent.changedTouches[0] : originalEvent;
				let target = document.elementFromPoint(touch.clientX, touch.clientY);
				toggleClass(lastSwapEl, options.swapClass, false);
				if (options.swap || putSortable && putSortable.options.swap) {
					if (toSortable && !toSortable.el.contains(target)) {
			lastSwapEl && toggleClass(lastSwapEl, options.swapClass, false);
						lastSwapEl = null;
						lastSwapIndex = null;
						return;
					}
					toSortable.captureAnimationState();
					if (toSortable !== activeSortable) activeSortable.captureAnimationState();
					swapNodes(dragEl, lastSwapEl);

					toSortable.animateAll();
					if (toSortable !== activeSortable) activeSortable.animateAll();
				}
		},
		nulling() {
			lastSwapEl = null;
			lastSwapIndex = null;
		}
	};

	return Object.assign(Swap, {
		pluginName: 'swap',
		eventProperties() {
			return {
				swapItem: lastSwapEl,
				swapIndex: lastSwapIndex
			};
		}
	});
}


function swapNodes(n1, n2) {
	let p1 = n1.parentNode,
		p2 = n2.parentNode,
		i1, i2;

	if (!p1 || !p2 || p1.isEqualNode(n2) || p2.isEqualNode(n1)) return;

	i1 = index(n1);
	i2 = index(n2);

	if (p1.isEqualNode(p2) && i1 < i2) {
		i2++;
	}
	p1.insertBefore(n2, p1.children[i1]);
	p2.insertBefore(n1, p2.children[i2]);
}

export default SwapPlugin;
