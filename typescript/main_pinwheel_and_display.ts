let breath = bioW_Bluetooth.createBreathOverBluetooth()
breath.setFrequency(8)
let display = bioW_Display.createDisplay(neoPin.P16)
bioW_Display.mapToDoubleBars(
    breath,
    display,
    bioW_Display.LengthMaps.TargetDepth,
    bioW_Display.ColorMaps.MatchTargetDepth,
    bioW_Display.LengthMaps.Depth,
    bioW_Display.ColorMaps.MatchTargetDepth,
    bioW_Display.BrightnessMaps.Medium
)
let motor = bioW_Motor.createMotor(bBoard_Motor.motorDriver.left)
bioW_Motor.setMotorMap(
    breath,
    motor,
    bioW_Motor.SpeedMaps.MatchTargetDepth,
    bioW_Motor.DirectionMaps.Clockwise
)
