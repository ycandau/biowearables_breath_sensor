// Simple example using BioW_Neopixel
// ----------------------------------

// Create an instance of the `neopixel.Strip` class.
// We indicate the `pin` to which the Neopixel is connected.
// This goes in the `|on start|` block.

let myNeopixel = bioW_Neopixel.createNeopixel(neoPin.P0)

// Draw an oscillating bar on the Neopixel.

// The `myNeopixel` variable needs to be created
// otherwise an error is thrown.
// We indicate the length, color and brightness.
// We use `oscillator()` to get a variable length.

// The drawing function goes in the `|forever|` block.

basic.forever(function () {
  bioW_Neopixel.drawBar(
    myNeopixel,
    bioW_Breath.oscillator(12, 0),
    neopixel.colors(NeoPixelColors.Red),
    10
  )
})
