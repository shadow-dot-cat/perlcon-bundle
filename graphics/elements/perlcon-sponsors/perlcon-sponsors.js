(() => {
	'use strict';

	const FADE_DURATION = 0.66;
	const FADE_OUT_EASE = Power1.easeIn;
	const FADE_IN_EASE = Power1.easeOut;
	// TODO sort out config for this

	class PerlConSponsors extends Polymer.Element {
		static get is() { return "perlcon-sponsors" };
		static get properties() {
			return {
				replicant: String,
				hold_seconds: {
					type: Number,
					value: 30,
				}
			};
		}

		ready() {
			super.ready();
			const repFullName = 'assets:' + this.replicant;
			let sponsors = nodecg.Replicant(repFullName);

			sponsors.on('change', newVal => {
				this.sponsors = newVal;

				// If no sponsor is showing yet, show the first sponsor immediately
				if (!this.currentSponsor && newVal.length > 0) {
					this.currentSponsor = newVal[0];
					this.$.image.src = newVal[0].url;

					TweenLite.to(this.$.image, FADE_DURATION, {
						opacity: 1,
						ease: FADE_IN_EASE
					});
				}
			});

			// Cycle through sponsor logos every this.duration seconds
			setInterval(this.nextSponsor.bind(this), this.hold_seconds * 1000);
		}

		nextSponsor() {
			// If there's no images, do nothing
			if (!this.sponsors || this.sponsors.length <= 0) {
				return;
			}

			// Figure out the array index of the current sponsor
			let currentIdx = -1;
			this.sponsors.some((sponsor, index) => {
				if (sponsor.name === this.currentSponsor.name) {
					currentIdx = index;
					return true;
				}

				return false;
			});

			let nextIdx = currentIdx + 1;

			// If this index is greater than the max, loop back to the start
			if (nextIdx >= this.sponsors.length) {
				nextIdx = 0;
			}

			// Set the new image
			const nextSponsor = this.sponsors[nextIdx];

			// Create one-time animation to fade from current to next.
			const tl = new TimelineLite();

			tl.to(this.$.image, FADE_DURATION, {
				opacity: 0,
				ease: FADE_OUT_EASE,
				onComplete: function () {
					this.currentSponsor = nextSponsor;
					this.$.image.src = nextSponsor.url;
				}.bind(this)
			});

			tl.to(this.$.image, FADE_DURATION, {
				opacity: 1,
				ease: FADE_IN_EASE
			}, 'start');
		}
	};
	customElements.define(PerlConSponsors.is, PerlConSponsors);
})();
