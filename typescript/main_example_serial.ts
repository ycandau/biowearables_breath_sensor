// Simple example using BioW_Breath
// --------------------------------

// Create an instance of the `BreathSensor` class.
// We indicate the `pin` to which the breath sensor is connected.
// This goes in the `[on start]` block.

let breathSensor = bioW_Breath.createBreathSensorMicrobit(AnalogPin.P2)

// Draw a bar on the micro:bit with the length set to the breath position.

// The `breathSensor` variable needs to be created otherwise an error is thrown.
// We also use `serial.writeValue()` to report the position in the console.
// Both functions go in the `[forever]` block.

basic.forever(function () {
  bioW_Microbit.drawBar(bioW_Breath.position(breathSensor), 10)
  serial.writeValue('position', bioW_Breath.position(breathSensor))
})
