/**
 * Custom blocks for the pinwheel and display.
 */

// ==== ::bt:top ====

//% weight=200
//% color=#F7931E
//% icon="\uf012"

namespace bioW_Bluetooth {
    // ==== ::bt ====

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

        time: number = 0
        phase: number = 0
        hasReceived: number = 0

        draw: () => void = () => {}
        countOnTarget: number = 0

        run: () => void = () => {}
        motorSpeed: number = 0

        constructor() {
            this.setFrequency(8)
            radio.setGroup(0)

            radio.onReceivedBuffer((buffer) => {
                const prevDirection = this.direction
                this.position = buffer.getNumber(NumberFormat.UInt16LE, 0)
                this.velocity = buffer.getNumber(NumberFormat.UInt16LE, 2)
                this.direction = buffer.getNumber(NumberFormat.UInt16LE, 4)
                this.speed = buffer.getNumber(NumberFormat.UInt16LE, 6)
                if (this.direction === 0xffff && prevDirection !== 0xffff) {
                    this.inhales++
                } else if (this.direction === 0 && prevDirection !== 0) {
                    this.exhales++
                }
                this.hasReceived = -5
            })

            control.inBackground(() => {
                while (true) {
                    const newTime = control.millis()
                    this.phase =
                        (Math.PI / 30000) *
                            this.targetFrequency *
                            (newTime - this.time) +
                        this.phase
                    this.time = newTime
                    this.targetPosition =
                        ((Math.sin(this.phase) + 1) * 0x7fff) >> 0
                    this.targetVelocity =
                        ((Math.cos(this.phase) + 1) * 0x7fff) >> 0

                    this.run()
                    this.draw()

                    basic.clearScreen()
                    if (this.hasReceived < 0) {
                        this.drawBar(0, (this.targetPosition * 5) >> 16)
                        this.drawBar(3, (this.position * 5) >> 16)
                    } else {
                        this.drawCross()
                    }

                    this.hasReceived = (this.hasReceived + 1) % 16
                    basic.pause(this.time + 100 - control.millis())
                }
            })
        }

        drawBar(x: number, length: number): void {
            length = 4 - length
            for (let i = 4; i > length; i--) {
                led.plotBrightness(x, i, 10)
                led.plotBrightness(x + 1, i, 10)
            }
            led.plotBrightness(x, length, 255)
            led.plotBrightness(x + 1, length, 255)
        }

        drawCross(): void {
            const pattern = 'aegimqsuy'
            basic.clearScreen()
            if (this.hasReceived < 8) {
                for (let i = 0; i < 9; i++) {
                    const n = pattern.charCodeAt(i) - 97
                    led.plotBrightness(n % 5, Math.idiv(n, 5), 255)
                }
            }
        }

        //% block="set $this(breath) target speed to $freq breaths per minute"
        //% freq.min=2 freq.max=60 freq.defl=8
        //% group="Set target speed"
        //% weight=190

        setFrequency(freq: number): void {
            this.targetFrequency = freq
            this.targetSpeed =
                (0xffff -
                    (0xffff / Math.log(20)) *
                        Math.log(Math.clamp(1, 20, 60 / freq))) >>
                0
        }

        // block="get $this(breath) depth"
        // advanced=true
        // weight=200

        // getDepth(): number {
        //     return (100 / 0xffff) * this.position
        // }

        // block="get $this(breath) strength"
        // advanced=true
        // weight=190

        // getStrength(): number {
        //     return (100 / 0xffff) * this.velocity
        // }

        // block="get $this(breath) speed"
        // advanced=true
        // weight=180

        // getSpeed(): number {
        //     return (100 / 0xffff) * this.speed
        // }

        // block="get $this(breath) target depth"
        // advanced=true
        // weight=170

        // getTargetDepth(): number {
        //     return (100 / 0xffff) * this.targetPosition
        // }

        // block="get $this(breath) target strength"
        // advanced=true
        // weight=160

        // getTargetStrength(): number {
        //     return (100 / 0xffff) * this.targetVelocity
        // }

        // block="get $this(breath) target speed"
        // advanced=true
        // weight=150

        // getTargetSpeed(): number {
        //     return (100 / 0xffff) * this.targetSpeed
        // }
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
        TargetDepth,
        //% block="Target strength"
        TargetStrength,
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
            case LengthMaps.TargetDepth:
                return breath.targetPosition
            case LengthMaps.TargetStrength:
                return breath.targetVelocity
            case LengthMaps.TargetSpeed:
                return breath.targetSpeed
            case LengthMaps.TargetPositionRandomSpeed:
                if (Math.abs(breath.speed - breath.targetSpeed) < 0x1000) {
                    breath.countOnTarget++
                    if (breath.countOnTarget >= 50) {
                        breath.countOnTarget = 0
                        breath.setFrequency(Math.random() * 26 + 4)
                    }
                }
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
        //% block="Match target depth"
        MatchTargetDepth,
        //% block="Match target speed"
        MatchTargetSpeed,
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
            case ColorMaps.MatchTargetDepth:
                return colorCloseFar(
                    breath.position - breath.targetPosition,
                    0x2000
                )
            case ColorMaps.MatchTargetSpeed:
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
                const h = (breath.time / 20 + 60) % 360
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
        TargetDepth,
        //% block="Target strength"
        TargetStrength,
        //% block="Match target speed"
        MatchTargetSpeed
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
            case BrightnessMaps.TargetDepth:
                return scaleToBrightness(breath.targetPosition)
            case BrightnessMaps.TargetStrength:
                return scaleToBrightness(breath.targetVelocity)
            case BrightnessMaps.MatchTargetSpeed:
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
    //% pin.defl=DigitalPin.P16
    //% blockSetVariable=display
    //% group="Create: Display"
    //% weight=200

    export function createDisplay(pin: DigitalPin): neopixel.Strip {
        return neopixel.create(pin, 64, NeoPixelMode.RGB)
    }

    // ==== ::draw ====

    //% block="map $breath=variables_get(breath)|to draw fill on $display=variables_get(display)|color: $colMapId|brightness: $brightMapId"
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

    //% block="map $breath=variables_get(breath)|to draw disk on $display=variables_get(display)|radius: $lenMapId|color: $colMapId|brightness: $brightMapId"
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

    //% block="map $breath=variables_get(breath)|to draw spiral on $display=variables_get(display)|length: $lenMapId|color: $colMapId|brightness: $brightMapId"
    //% inlineInputMode=inline
    //% group="Map: Display"
    //% weight=170

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

    //% block="map $breath=variables_get(breath)|to draw bar on $display=variables_get(display)|length: $lenMapId|color: $colMapId|brightness: $brightMapId"
    //% inlineInputMode=inline
    //% group="Map: Display"
    //% weight=160

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

    // For distinct brightness settings

    function fadeRGB(rgb: number, fade: number): number {
        let r = (rgb >> 16) & 0xff
        let g = (rgb >> 8) & 0xff
        let b = (rgb >> 0) & 0xff

        const lum =
            (Math.max(Math.max(r, g), b) + Math.min(Math.min(r, g), b)) >> 1
        fade = lum * fade
        let a = Math.min(lum, 255 - lum)
        a = a !== 0 ? Math.min(fade, 255 - fade) / a : 0
        const c = fade - a * lum

        r = (a * r + c) & 0xff
        g = (a * g + c) & 0xff
        b = (a * b + c) & 0xff

        return (r << 16) | (g << 8) | b
    }

    //% block="map $breath=variables_get(breath)|to draw double bars on $display=variables_get(display)|length 1: $lenMapId1|color 1: $colMapId1|brightness 1: $brightMapId1|length 2: $lenMapId2|color 2: $colMapId2|brightness 2: $brightMapId2"
    //% group="Map: Display"
    //% weight=150

    export function mapToDoubleBars(
        breath: bioW_Bluetooth.BreathData,
        display: neopixel.Strip,
        lenMapId1: LengthMaps,
        colMapId1: ColorMaps,
        brightMapId1: BrightnessMaps,
        lenMapId2: LengthMaps,
        colMapId2: ColorMaps,
        brightMapId2: BrightnessMaps
    ): void {
        breath.draw = () => {
            const length1 = ((mapToLength(lenMapId1, breath) >> 13) << 3) + 8
            const length2 = ((mapToLength(lenMapId2, breath) >> 13) << 3) + 8
            let color1 = mapToColor(colMapId1, breath)
            let color2 = mapToColor(colMapId2, breath)
            let brightness1 = mapToBrightness(brightMapId1, breath)
            let brightness2 = mapToBrightness(brightMapId2, breath)

            if (brightness1 > brightness2 && brightness1 !== 0) {
                color2 = fadeRGB(color2, brightness2 / brightness1)
            } else if (brightness2 > brightness1 && brightness2 !== 0) {
                color1 = fadeRGB(color1, brightness1 / brightness2)
                brightness1 = brightness2
            }

            display.setBrightness(brightness1)
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

    // ==== ::display:more ====

    // block="draw fill on $display=variables_get(display)|color: $color|brightness: $brightness"
    // color.shadow=display_color
    // brightness.min=0 brightness.max=100 brightness.defl=10
    // advanced=true
    // weight=190

    // export function drawFill(
    //     display: neopixel.Strip,
    //     color: number,
    //     brightness: number
    // ): void {
    //     brightness = Math.clamp(0, 255, 0.025 * brightness ** 2 + 5) >> 0
    //     display.clear()
    //     display.setBrightness(brightness)
    //     display.showColor(color)
    // }

    // block="draw spiral on $display=variables_get(display)|length: $length|color: $color|brightness: $brightness"
    // inlineInputMode=inline
    // length.min=0 length.max=100 length.defl=10
    // color.shadow=display_color
    // brightness.min=0 brightness.max=100 brightness.defl=10
    // advanced=true
    // weight=180

    // export function drawSpiral(
    //     display: neopixel.Strip,
    //     length: number,
    //     color: number,
    //     brightness: number
    // ): void {
    //     const pattern =
    //         "STLKJRZ[\\]UMEDCBAIQYabcdef^VNF>=<;:98@HPX`hijklmnog_WOG?76543210"
    //     length = Math.clamp(0, 64, 1 + length * 0.64) >> 0
    //     brightness = Math.clamp(0, 255, 0.025 * brightness ** 2 + 5) >> 0
    //     display.setBrightness(brightness)
    //     display.clear()
    //     for (let i = 0; i < length; i++) {
    //         display.setPixelColor(pattern.charCodeAt(i) - 48, color)
    //     }
    //     display.show()
    // }

    // block="$color"
    // blockId=display_color
    // advanced=true
    // weight=170

    // export function getColor(color: NeoPixelColors): NeoPixelColors {
    //     return color
    // }
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
        Depth,
        Strength,
        Speed,
        //% block="Target depth"
        TargetDepth,
        //% block="Match target depth"
        MatchTargetDepth,
        //% block="Match target speed slow"
        MatchTargetSpeedSlow,
        //% block="Match target speed fast"
        MatchTargetSpeedFast,
        Exhale,
        //% block="Physical simulation"
        PhysicalSimulation
    }

    const constantSpeeds = [0, 22, 40, 100]

    function scaleSpeed(x: number, t: number): number {
        return x < t ? 0 : ((x - t) / (0xffff - t)) ** 2 * 78 + 22
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
            case SpeedMaps.Depth:
                return scaleSpeed(breath.position, 0)
            case SpeedMaps.Strength:
                return scaleSpeed(
                    Math.abs(breath.velocity - 0x7fff) << 1,
                    0x1000
                )
            case SpeedMaps.Speed:
                return scaleSpeed(breath.speed, 0)
            case SpeedMaps.TargetDepth:
                return scaleSpeed(breath.targetPosition, 0)
            case SpeedMaps.MatchTargetDepth:
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
            case SpeedMaps.MatchTargetSpeedSlow:
                return scaleSpeed(
                    Math.min(
                        0xffff,
                        3 * Math.abs(breath.speed - breath.targetSpeed)
                    ),
                    0x1000
                )
            case SpeedMaps.MatchTargetSpeedFast:
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
            case SpeedMaps.PhysicalSimulation:
                let s = scaleSpeed(
                    Math.max(0, 0x7fff - breath.velocity) << 1,
                    0x1700
                )
                s = Math.max(s, breath.motorSpeed) * 0.97
                return (breath.motorSpeed = s < 10 ? 0 : s)
        }
    }

    // ==== ::mapdir ====

    export enum DirectionMaps {
        Clockwise,
        //% block="Counter-clockwise"
        CounterClockwise,
        Strength,
        //% block="Target strength"
        TargetStrength,
        //% block="Match target speed"
        MatchTargetSpeed
    }

    function dirAboveBelow(x: number, low: number, high: number): number {
        if (x < low) {
            return 1
        } else if (x < high) {
            return 0
        } else {
            return -1
        }
    }

    export function mapToDirection(
        dirMapId: DirectionMaps,
        breath: bioW_Bluetooth.BreathData
    ): number {
        switch (dirMapId) {
            default:
            case DirectionMaps.Clockwise:
                return 1
            case DirectionMaps.CounterClockwise:
                return -1
            case DirectionMaps.Strength:
                return dirAboveBelow(breath.velocity, 0x5fff, 0x9fff)
            case DirectionMaps.TargetStrength:
                return dirAboveBelow(breath.targetVelocity, 0x5fff, 0x9fff)
            case DirectionMaps.MatchTargetSpeed:
                return dirAboveBelow(
                    breath.speed - breath.targetSpeed,
                    -0x1000,
                    0x1000
                )
        }
    }

    // ==== ::motor ====

    //% block="new motor"
    //% blockSetVariable="motor"
    //% group="Create: Motor"
    //% weight=200

    export function createMotor(): number {
        return 0
    }

    //% block="map $breath=variables_get(breath) to run $motor=variables_get(motor)|speed: $speedMapId|direction: $dirMapId"
    //% inlineInputMode=inline
    //% group="Map: Motor"
    //% weight=200

    export function setMotorMap(
        breath: bioW_Bluetooth.BreathData,
        motor: number,
        speedMapId: SpeedMaps,
        dirMapId: DirectionMaps
    ): void {
        breath.run = () =>
            bBoard_Motor.motorLeftDuty(
                mapToSpeed(speedMapId, breath) *
                    mapToDirection(dirMapId, breath)
            )
    }

    // block="run $motor=variables_get(motor)|at a speed of $speed|and $direction"
    // speed.min=0 speed.max=100 speed.defl=50
    // direction.shadow=motor_direction
    // advanced=true
    // weight=190

    // export function runMotor(speed: number, direction: number): void {
    //     speed = Math.clamp(0, 100, speed) >> 0
    //     speed =
    //         direction === bBoard_Motor.motorDirection.forward ? 1
    //         : direction === bBoard_Motor.motorDirection.backward ? -1
    //         : 0
    //     bBoard_Motor.motorLeftDuty(speed)
    // }

    // block="$direction"
    // blockId=motor_direction
    // advanced=true
    // weight=180

    // export function getDirection(
    //     direction: bBoard_Motor.motorDirection
    // ): bBoard_Motor.motorDirection {
    //     return direction
    // }
}
