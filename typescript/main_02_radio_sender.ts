// Example 2: Breath sensor and radio sender with display
// ------------------------------------------------------

// Create an instance of the `BreathSensor` class.
// Indicate the `pin` to which the breath sensor is connected.

let breathData = bioW_Breath.createBreathSensor(AnalogPin.P2)

// Create an instance of the `Microbit` class.

let myMicrobit = bioW_Microbit.createMicrobit()

// Map the breath data to a spiral drawn on the `Microbit` object.
// The length of the spiral is mapped to the target breath position.
// The brightness of the spiral is constant and low.

myMicrobit.mapToSpiral(
    breathData,
    util.LengthMaps.TargetPosition,
    util.BrightnessMaps.ConstantLow
)

// Start streaming the breath data from the sensor over radio.
// Indicate the radio `group` identifier and the output `power`.
// The `BreathSensor` object then takes care of sending the data.
// All of these blocks are run `||on start||`.

bioW_Radio.startRadioStreaming(breathData, 0, 6)

// In the `||forever||` loop we simply call to draw the selected mapping.

basic.forever(function () {
    myMicrobit.drawMapping()
})
