// Simple example using BioW_Radio for receiving data
// --------------------------------------------------

// Create an instance of the `BreathOverRadio` class.
// This goes in the `[on start]` block.

let breathOverRadio = bioW_Radio.createBreathOverRadio(0)

// Draw a bar on the micro:bit with the length set to
// the breath position received over radio.

// We can call `position()` on `breathOverRadio` just like we would
// on a `BreathSensor` object.
// The `breathOverRadio` variable needs to be created
// otherwise an error is thrown.

// The drawing function goes in the `[forever]` block.

basic.forever(function () {
  bioW_Microbit.drawBar(bioW_Radio.position(breathOverRadio), 10)
})
