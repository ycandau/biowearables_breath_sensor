// Simple example using BioW_Breath
// --------------------------------

// Create an instance of the `BreathSensor` class.
// This goes in the `on start` block.

let breathSensor = bioW_Breath.createBreathSensorBBoard(AnalogPin.P2)

// Draw a bar on the micro:bit with the length set to the breath position.
// The `breathSensor` variable needs to be created otherwise an error is thrown.
// The drawing function goes in the `forever` block.

basic.forever(function () {
  bioW_Microbit.drawBar(bioW_Breath.position(breathSensor), 10)
})
