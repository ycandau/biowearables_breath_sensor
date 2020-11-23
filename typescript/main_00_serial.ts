// Monitoring actual data in the console
// -------------------------------------

// Create an instance of the `BreathSensor` class.
// We indicate the `pin` to which the breath sensor is connected.
// This goes in the `[on start]` block.

let breathData = bioW_Breath.createBreathSensor(AnalogPin.P2)

// Then use `serial.writeValue()` in a `[forever]` loop
// to report the position in the console.

basic.forever(function () {
    serial.writeValue('position', bioW_Breath.position(breathData))
})
