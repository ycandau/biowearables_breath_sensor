/**
 * Custom blocks for the pinwheel and display.
 */

// ==== ::bt:top ====

//% weight=200
//% color=#F7931E
//% icon="\uf012"

namespace bioW_Bluetooth {
    // ==== ::bt ====

    function freqToSpeed(freq: number): number {
        return (
            (0xffff -
                (0xffff / Math.log(20)) *
                    Math.log(Math.clamp(1, 20, 60 / freq))) >>
            0
        )
    }

    //% block="new bluetooth receiver"
    //% blockSetVariable="breath"
    //% group="Create: Receiver"
    //% weight=200

    export function createBreathOverBluetooth(): BreathData {
        return new BreathData()
    }

    export class BreathData {
        position: number = 0x7fff
        posAmpl: number = 0
        velocity: number = 0x7fff
        velAmpl: number = 0
        direction: number = 0
        speed: number = 0
        inhales: number = 0
        exhales: number = 0

        targetPosition: number = 0
        targetVelocity: number = 0
        targetFrequency: number = 0
        targetSpeed: number = 0

        timeAtFreqChange: number = 0
        phaseAtFreqChange: number = 0
        lastEventTime: number = 0

        draw: () => void = () => {}
        onTargetTime: number = 0
        lastTargetTime: number = 0

        run: () => void = () => {}
        motorSpeed: number = 0

        constructor() {
            this.setFrequency(8)
            radio.setGroup(0)

            radio.onReceivedBuffer((buffer) => {
                this.lastEventTime = control.millis()
                const prevDirection = this.direction

                this.position = buffer.getNumber(NumberFormat.UInt16LE, 0)
                this.velocity = buffer.getNumber(NumberFormat.UInt16LE, 4)
                this.direction = buffer.getNumber(NumberFormat.UInt16LE, 8)
                this.speed = buffer.getNumber(NumberFormat.UInt16LE, 10)
                if (this.direction === 0xffff && prevDirection !== 0xffff) {
                    this.inhales++
                } else if (this.direction === 0 && prevDirection !== 0) {
                    this.exhales++
                }

                const phase = this.getPhase(this.lastEventTime)
                this.targetPosition = ((Math.sin(phase) + 1) * 0x7fff) >> 0
                this.targetVelocity = ((Math.cos(phase) + 1) * 0x7fff) >> 0
                this.run()
                this.draw()
            })

            control.inBackground(() => {
                while (true) {
                    let length = 9 * (Math.idiv(control.millis(), 800) % 2)
                    let pattern = 'aegimqsuy'
                    let brightness = 255
                    basic.clearScreen()
                    if (control.millis() - this.lastEventTime < 1000) {
                        length = (breath.position * 25) >> 16
                        pattern = 'mnihglqrstojedcbafkpuvwxy'
                        brightness = 10
                        const n = pattern.charCodeAt(length) - 97
                        led.plotBrightness(n % 5, Math.idiv(n, 5), 255)
                    }
                    for (let i = 0; i < length; i++) {
                        const n = pattern.charCodeAt(i) - 97
                        led.plotBrightness(n % 5, Math.idiv(n, 5), brightness)
                    }
                    basic.pause(100)
                }
            })
        }

        getPhase(time: number): number {
            return (
                (Math.PI / 30000) *
                    this.targetFrequency *
                    (time - this.timeAtFreqChange) +
                this.phaseAtFreqChange
            )
        }

        //% block="$this(breath)|set the target speed to $freq breaths per minute"
        //% freq.min=2 freq.max=60 freq.defl=8
        //% group="Set target speed"
        //% weight=190

        setFrequency(freq: number): void {
            if (freq !== this.targetFrequency) {
                const time = control.millis()
                this.phaseAtFreqChange = this.getPhase(time)
                this.timeAtFreqChange = time
                this.targetFrequency = freq
                this.targetSpeed = freqToSpeed(freq)
            }
        }
    }
}

//% weight=170
//% color=#F7931E
//% icon="\uf110"

namespace bioW_Display {
    // ==== ::maplength ====

    export enum LengthMaps {
        On,
        Depth,
        Strength,
        Speed,
        //% block="Target depth"
        TargetPosition,
        //% block="Target strength"
        TargetVelocity,
        //% block="Target speed"
        TargetSpeed,
        //% block="Target depth random speed"
        TargetPositionRandomSpeed
    }

    function mapToLength(
        lenMapId: LengthMaps,
        breath: bioW_Bluetooth.BreathData
    ): number {
        switch (lenMapId) {
            default:
            case LengthMaps.On:
                return 0xffff
            case LengthMaps.Depth:
                return breath.position
            case LengthMaps.Strength:
                return breath.velocity
            case LengthMaps.Speed:
                return breath.speed
            case LengthMaps.TargetPosition:
                return breath.targetPosition
            case LengthMaps.TargetVelocity:
                return breath.targetVelocity
            case LengthMaps.TargetSpeed:
                return breath.targetSpeed
            case LengthMaps.TargetPositionRandomSpeed:
                const time = control.millis()
                if (Math.abs(breath.speed - breath.targetSpeed) < 6500) {
                    breath.onTargetTime += time - breath.lastTargetTime
                    if (breath.onTargetTime >= 5000) {
                        breath.onTargetTime = 0
                        breath.setFrequency(Math.random() * 26 + 4)
                    }
                }
                breath.lastTargetTime = time
                return breath.targetPosition
        }
    }

    // ==== ::mapcolor ====

    export enum ColorMaps {
        Red = 0,
        Green = 1,
        Blue = 2,
        Depth,
        Strength,
        Speed,
        //% block="Target depth"
        TargetPosition,
        //% block="Target strength"
        TargetVelocity,
        //% block="Target speed"
        TargetSpeed,
        Inhale,
        Exhale,
        //% block="Cycle all"
        CycleAll
    }

    const rgb = [0xff0000, 0x00ff00, 0x0000ff]

    function colorAboveBelow(x: number, low: number, high: number): number {
        if (x < low) {
            return 0x0000ff
        } else if (x < high) {
            return 0x00ff00
        } else {
            return 0xff0000
        }
    }

    function colorCloseFar(d: number, radius: number): number {
        d = Math.abs(d)
        if (d <= radius) {
            return 0x00ff00
        } else if (d <= radius << 1) {
            return 0x0000ff
        } else {
            return 0xff0000
        }
    }

    function mapToColor(
        colMapId: ColorMaps,
        breath: bioW_Bluetooth.BreathData
    ): number {
        switch (colMapId) {
            default:
                colMapId = 0
            case ColorMaps.Red:
            case ColorMaps.Green:
            case ColorMaps.Blue:
                return rgb[colMapId]
            case ColorMaps.Depth:
                return colorAboveBelow(breath.position, 0x5fff, 0x9fff)
            case ColorMaps.Strength:
                return colorAboveBelow(breath.velocity, 0x5fff, 0x9fff)
            case ColorMaps.Speed:
                return colorAboveBelow(breath.speed, 21456, 26338)
            case ColorMaps.TargetPosition:
                return colorCloseFar(
                    breath.position - breath.targetPosition,
                    0x2000
                )
            case ColorMaps.TargetVelocity:
                return colorCloseFar(
                    breath.velocity - breath.targetVelocity,
                    0x2000
                )
            case ColorMaps.TargetSpeed:
                return colorAboveBelow(
                    breath.speed - breath.targetSpeed,
                    -0x1000,
                    0x1000
                )
            case ColorMaps.Inhale:
                return rgb[breath.inhales % 3]
            case ColorMaps.Exhale:
                return rgb[breath.exhales % 3]
            case ColorMaps.CycleAll:
                const h = (control.millis() / 20 + 60) % 360
                const x = Math.idiv(Math.abs((h % 120) - 60) * 255, 60)
                const alpha = (2 - Math.idiv(h, 120)) << 3
                const beta = Math.idiv(h % 180, 60) << 3
                return (255 << alpha) | (x << beta)
        }
    }

    // ==== ::mapbrightness ====

    export enum BrightnessMaps {
        Low,
        Medium,
        High,
        Depth,
        Strength,
        Speed,
        //% block="Target depth"
        TargetPosition,
        //% block="Target speed"
        TargetSpeed
    }

    function scaleToBrightness(x: number): number {
        return 5.82094e-8 * x ** 2 + 5
    }

    function mapToBrightness(
        brightMapId: BrightnessMaps,
        breath: bioW_Bluetooth.BreathData
    ): number {
        switch (brightMapId) {
            default:
            case BrightnessMaps.Low:
                return 10
            case BrightnessMaps.Medium:
                return 80
            case BrightnessMaps.High:
                return 255
            case BrightnessMaps.Depth:
                return scaleToBrightness(breath.position)
            case BrightnessMaps.Strength:
                return scaleToBrightness(breath.velocity)
            case BrightnessMaps.Speed:
                return scaleToBrightness(0xffff - breath.speed)
            case BrightnessMaps.TargetPosition:
                return scaleToBrightness(breath.targetPosition)
            case BrightnessMaps.TargetSpeed:
                return scaleToBrightness(
                    Math.max(
                        0,
                        0xffff - 3 * Math.abs(breath.speed - breath.targetSpeed)
                    )
                )
        }
    }

    // ==== ::display ====

    //% block="new display on pin $pin"
    //% pin.defl=neoPin.P16
    //% blockSetVariable=display
    //% group="Create: Display"
    //% weight=200

    export function createDisplay(pin: neoPin): neopixel.Strip {
        return neopixel.createbBoadrAdvStrip(
            BoardID.zero,
            ClickID.Zero,
            pin,
            64,
            NeoPixelMode.RGB
        )
    }

    // ==== ::draw ====

    //% block="map $breath=variables_get(breath)|to fill $display=variables_get(display)|color: $colMapId|brightness: $brightMapId"
    //% inlineInputMode=inline
    //% group="Map: Display"
    //% weight=190

    export function mapToFill(
        breath: bioW_Bluetooth.BreathData,
        display: neopixel.Strip,
        colMapId: ColorMaps,
        brightMapId: BrightnessMaps
    ): void {
        breath.draw = () => {
            display.clear()
            display.setBrightness(mapToBrightness(brightMapId, breath))
            display.showColor(mapToColor(colMapId, breath))
        }
    }

    //% block="map $breath=variables_get(breath)|to disk on $display=variables_get(display)|radius: $lenMapId|color: $colMapId|brightness: $brightMapId"
    //% inlineInputMode=inline
    //% group="Map: Display"
    //% weight=180

    export function mapToDisk(
        breath: bioW_Bluetooth.BreathData,
        display: neopixel.Strip,
        lenMapId: LengthMaps,
        colMapId: ColorMaps,
        brightMapId: BrightnessMaps
    ): void {
        breath.draw = () => {
            const radius = (mapToLength(lenMapId, breath) >> 14) + 1
            const color = mapToColor(colMapId, breath)
            display.setBrightness(mapToBrightness(brightMapId, breath))
            display.clear()
            for (let n = 0, x = -3.5; x < 4; x++) {
                for (let y = -3.5; y < 4; y++, n++) {
                    if (x * x + y * y <= radius * radius) {
                        display.setPixelColor(n, color)
                    }
                }
            }
            display.show()
        }
    }

    //% block="map $breath=variables_get(breath)|to bar on $display=variables_get(display)|length: $lenMapId|color: $colMapId|brightness: $brightMapId"
    //% inlineInputMode=inline
    //% group="Map: Display"
    //% weight=170

    export function mapToBar(
        breath: bioW_Bluetooth.BreathData,
        display: neopixel.Strip,
        lenMapId: LengthMaps,
        colMapId: ColorMaps,
        brightMapId: BrightnessMaps
    ): void {
        breath.draw = () => {
            const length = ((mapToLength(lenMapId, breath) >> 13) << 3) + 8
            const color = mapToColor(colMapId, breath)
            display.setBrightness(mapToBrightness(brightMapId, breath))
            display.clear()
            for (let n = 2; n < length; ) {
                display.setPixelColor(n, color)
                n += n % 8 === 5 ? 5 : 1
            }
            display.show()
        }
    }

    //% block="map $breath=variables_get(breath)|to double bars on $display=variables_get(display)|length 1: $lenMapId1|color 1: $colMapId1|length 2: $lenMapId2|color 2: $colMapId2|brightness: $brightMapId"
    // inlineInputMode=inline
    //% group="Map: Display"
    //% weight=160

    export function mapToDoubleBars(
        breath: bioW_Bluetooth.BreathData,
        display: neopixel.Strip,
        lenMapId1: LengthMaps,
        colMapId1: ColorMaps,
        lenMapId2: LengthMaps,
        colMapId2: ColorMaps,
        brightMapId: BrightnessMaps
    ): void {
        breath.draw = () => {
            const length1 = ((mapToLength(lenMapId1, breath) >> 13) << 3) + 8
            const length2 = ((mapToLength(lenMapId2, breath) >> 13) << 3) + 8
            const color1 = mapToColor(colMapId1, breath)
            const color2 = mapToColor(colMapId2, breath)
            display.setBrightness(mapToBrightness(brightMapId, breath))
            display.clear()
            for (let n = 5; n < length1; ) {
                display.setPixelColor(n, color1)
                n += n % 8 === 7 ? 6 : 1
            }
            for (let n = 0; n < length2; ) {
                display.setPixelColor(n, color2)
                n += n % 8 === 2 ? 6 : 1
            }
            display.show()
        }
    }

    //% block="map $breath=variables_get(breath)|to spiral on $display=variables_get(display)|length: $lenMapId|color: $colMapId|brightness: $brightMapId"
    //% inlineInputMode=inline
    //% group="Map: Display"
    //% weight=150

    export function mapToSpiral(
        breath: bioW_Bluetooth.BreathData,
        display: neopixel.Strip,
        lenMapId: LengthMaps,
        colMapId: ColorMaps,
        brightMapId: BrightnessMaps
    ): void {
        const pattern =
            'STLKJRZ[\\]UMEDCBAIQYabcdef^VNF>=<;:98@HPX`hijklmnog_WOG?76543210'
        breath.draw = () => {
            const length = (mapToLength(lenMapId, breath) >> 10) + 1
            const color = mapToColor(colMapId, breath)
            display.setBrightness(mapToBrightness(brightMapId, breath))
            display.clear()
            for (let i = 0; i < length; i++) {
                display.setPixelColor(pattern.charCodeAt(i) - 48, color)
            }
            display.show()
        }
    }
}

//% weight=160
//% color=#F7931E
//% icon="\uf085"

namespace bioW_Motor {
    // ==== ::mapspeed ====

    export enum SpeedMaps {
        Off,
        Slow,
        Medium,
        Fast,
        Strength,
        Speed,
        //% block="Target depth"
        TargetPosition,
        //% block="Target strength"
        TargetVelocity,
        //% block="Target speed slow"
        TargetSpeedSlow,
        //% block="Target speed fast"
        TargetSpeedFast,
        Exhale,
        //% block="Physical simulation"
        PhysicalSimulation
    }

    const constantSpeeds = [0, 18, 40, 100]

    function scaleSpeed(x: number, t: number): number {
        return x < t ? 0 : ((x - t) / (0xffff - t)) ** 2 * 82 + 18
    }

    export function mapToSpeed(
        speedMapId: SpeedMaps,
        breath: bioW_Bluetooth.BreathData
    ): number {
        switch (speedMapId) {
            default:
            case SpeedMaps.Off:
            case SpeedMaps.Slow:
            case SpeedMaps.Medium:
            case SpeedMaps.Fast:
                return constantSpeeds[speedMapId]
            case SpeedMaps.Strength:
                return scaleSpeed(
                    Math.abs(breath.velocity - 0x7fff) << 1,
                    0x1000
                )
            case SpeedMaps.Speed:
                return scaleSpeed(breath.speed, 0)
            case SpeedMaps.TargetPosition:
                return scaleSpeed(
                    Math.max(
                        0,
                        0xffff -
                            (Math.abs(
                                breath.position - breath.targetPosition
                            ) <<
                                1)
                    ),
                    0
                )
            case SpeedMaps.TargetVelocity:
                return scaleSpeed(
                    Math.max(
                        0,
                        0xffff -
                            (Math.abs(
                                breath.velocity - breath.targetVelocity
                            ) <<
                                1)
                    ),
                    0
                )
            case SpeedMaps.TargetSpeedSlow:
                return scaleSpeed(
                    Math.min(
                        0xffff,
                        3 * Math.abs(breath.speed - breath.targetSpeed)
                    ),
                    0x1000
                )
            case SpeedMaps.TargetSpeedFast:
                return scaleSpeed(
                    Math.max(
                        0,
                        0xffff - 3 * Math.abs(breath.speed - breath.targetSpeed)
                    ),
                    0
                )
            case SpeedMaps.Exhale:
                return scaleSpeed(
                    Math.max(0, 0x7fff - breath.velocity) << 1,
                    0x1000
                )
            case SpeedMaps.PhysicalSimulation: //curr
                let s = scaleSpeed(
                    Math.max(0, 0x7fff - breath.velocity) << 1,
                    0x1000
                )
                s = Math.max(s, breath.motorSpeed)
                breath.motorSpeed = s * 0.97
                return s
        }
    }

    // ==== ::mapdir ====

    export enum DirectionMaps {
        Clockwise,
        //% block="Counter-clockwise"
        CounterClockwise,
        Strength,
        //% block="Target strength"
        TargetVelocity,
        //% block="Target speed"
        TargetSpeed
    }

    function dirAboveBelow(x: number, low: number, high: number): number {
        if (x < low) {
            return bBoard_Motor.motorDirection.forward
        } else if (x < high) {
            return bBoard_Motor.motorDirection.brake
        } else {
            return bBoard_Motor.motorDirection.backward
        }
    }

    export function mapToDirection(
        dirMapId: DirectionMaps,
        breath: bioW_Bluetooth.BreathData
    ): number {
        switch (dirMapId) {
            default:
            case DirectionMaps.Clockwise:
                return bBoard_Motor.motorDirection.forward
            case DirectionMaps.CounterClockwise:
                return bBoard_Motor.motorDirection.backward
            case DirectionMaps.Strength:
                return dirAboveBelow(breath.velocity, 0x5fff, 0x9fff)
            case DirectionMaps.TargetVelocity:
                return dirAboveBelow(breath.targetVelocity, 0x5fff, 0x9fff)
            case DirectionMaps.TargetSpeed:
                return dirAboveBelow(
                    breath.speed - breath.targetSpeed,
                    -0x1000,
                    0x1000
                )
        }
    }

    // ==== ::motor ====

    //% block="new motor on $side side"
    //% side.defl=bBoard_Motor.motorDriver.left
    //% blockSetVariable="motor"
    //% group="Create: Motor"
    //% weight=200

    export function createMotor(
        side: bBoard_Motor.motorDriver
    ): bBoard_Motor.BBOARD_MOTOR {
        return bBoard_Motor.createMotor(
            side,
            BoardID.zero,
            ClickID.Zero,
            bBoard_Motor.motorState.enabled
        )
    }

    //% block="map $breath=variables_get(breath) to run $motor=variables_get(motor)|speed: $speedMapId|direction: $dirMapId"
    //% inlineInputMode=inline
    //% group="Map: Motor"
    //% weight=200

    export function setMotorMap(
        breath: bioW_Bluetooth.BreathData,
        motor: bBoard_Motor.BBOARD_MOTOR,
        speedMapId: SpeedMaps,
        dirMapId: DirectionMaps
    ): void {
        breath.run = () =>
            motor.motorDutyDirection(
                mapToSpeed(speedMapId, breath),
                mapToDirection(dirMapId, breath)
            )
    }
}
