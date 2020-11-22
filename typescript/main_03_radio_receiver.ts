// Example 3: Radio receiver with NeoPixel and motor
// -------------------------------------------------

// Create an instance of the `BreathOverRadio` class.
// Indicate the `group` to which the receiver is listening.

let breathData = bioW_Radio.createBreathOverRadio(0)

// Create an instance of the `Microbit` class.

let myMicrobit = bioW_Microbit.createMicrobit()

// Create an instance of the `Neopixel` class.
// Indicate the `pin` to which the NeoPixel is connected.

let myNeopixel = bioW_Neopixel.createNeopixel(neoPin.P0)

// Create an instance of the `Motor` class.
// Indicate the `side` to which the motor is connected.

let myMotor = bioW_Motor.createMotor(bBoard_Motor.motorDriver.left)

// Map the breath data to a spiral drawn on the micro:bit's LED matrix.
// The `length` of the spiral is mapped to the target breath position.
// The `brightness` of the spiral is constant and low.

myMicrobit.mapToSpiral(
    breathData,
    util.LengthMaps.TargetPosition,
    util.BrightnessMaps.ConstantLow
)

// Map the breath data to a bar drawn on the NeoPixel's LED matrix.
// The `length` of the bar is mapped to the target breath position.

myNeopixel.mapToBar(
    breathData,
    util.LengthMaps.TargetPosition,
    util.ColorMaps.ConstantRed,
    util.BrightnessMaps.ConstantLow
)

// Map the breath data to the motor.
// The `speed` of the motor is mapped to the target breath position.

myMotor.setMapping(
    breathData,
    bioW_Motor.SpeedMaps.TargetPosition,
    bioW_Motor.DirectionMaps.Constant
)

// In the `||forever||` loop we simply enact the three mappings.

basic.forever(function () {
    myMicrobit.drawMapping()
    myNeopixel.drawMapping()
    myMotor.run()
})
