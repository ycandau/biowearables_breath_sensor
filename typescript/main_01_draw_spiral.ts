// Example 1: Drawing directly on the micro:bit
// --------------------------------------------

// There is no underlying class, thus no variable to create
// and no `||on start||` block.

// We use `||draw spiral||` to draw on the micro:bit.
// The block has two parameters: `length` and `brightness`.
// We use a `||cycle||` block to define a variable length.

// The drawing function goes into the `||forever||` loop.

basic.forever(function () {
    bioW_Microbit.drawSpiral(bioW_Breath.oscillator(12, 0), 10)
})
