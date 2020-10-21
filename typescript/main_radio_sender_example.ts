// Simple example using BioW_Radio for sending data
// ------------------------------------------------

// Create an instance of the `BreathSensor` class.
// We indicate the `pin` to which the breath sensor is connected.

let breathSensor = bioW_Breath.createBreathSensorMicrobit(AnalogPin.P2)

// Start streaming the breath data from the sensor over radio.
// We indicate the radio group id and the output power.
// Both of these go in the `|on start|` block.

bioW_Radio.startRadioStreaming(breathSensor, 0, 6)

// The `breathSensor` object takes care of sending the data.
// And the `|forever|` block is thus empty.

basic.forever(function () {})
