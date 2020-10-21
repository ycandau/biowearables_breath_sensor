// Simple example using BioW_Microbit
// ----------------------------------

// For this series of blocks there is no need
// to create a specific variable first.
// So the `[on start]` block is empty.

// Draw an oscillating bar on the micro:bit.

// We indicate the length and brightness.
// We use `oscillator()` to get a variable length.

// The drawing function goes in the `[forever]` block.

basic.forever(function () {
  bioW_Microbit.drawBar(bioW_Breath.oscillator(12, 0), 10)
})
