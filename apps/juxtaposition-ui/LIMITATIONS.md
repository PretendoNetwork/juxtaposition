Dev notes regarding the console frontends

# CTR

## D-Pad navigation
The D-Pad navigation is based on which elements are tab-focusable.
After much experimenting, the cleanest approach seems to be always using `<a href="#">` (or a real URL), though `<button>` can be situationally useful. Obviously you probably want to preventDefault if you use href=#. tabIndex will appear to work, but you won't get click events from pressing A!

## 16-bit and RGB565
When designing for CTR, gradients tend to look *really bad* due to the console rendering at [16-bit RGB565](https://rgbcolorpicker.com/565) internally. This leads to very visible banding. Dithering can help but needs to be done manually and still missing a good workflow.

Appears to affect IPS consoles more than TN ones.

## SVG
No svg support.

## CSS properties
- Gradients use legacy syntax; [`-webkit-gradient` described here](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariCSSRef/Articles/Functions.html#//apple_ref/doc/uid/TP40007955). Note `-webkit-linear-gradient` and `-webkit-radial-gradient` are *not* supported.
- `-webkit-border-radius` works but can give very terrible looking results above 2-3px, and doesn't clip the top-left corner properly. Verify design on hardware.
- `-webkit-mask-image` and friends do not work at all despite working on contemporary Chrome. Mask image is just rendered as a normal image.
- Flexbox exists in a limited form, named `display: -webkit-box`. Syntax is different and less capable, see [MDN for box- properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/box-flex). Remember to use `-webkit-box-*` versions.