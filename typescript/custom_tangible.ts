/**
 * Custom blocks for the pinwheel and display.
 */

// ==== ::bt:top ====

//% weight=200
//% color=#F7931E
//% icon="\uf012"

namespace bioW_Bluetooth {
    // ==== ::bt:create ====

    export function freqToSpeed(freq: number): number {
        return (
            (0xffff -
                (0xffff / Math.log(20)) *
                    Math.log(Math.clamp(1, 20, 60 / freq))) >>
            0
        )
    }

    //% block="new bluetooth receiver"
    //% blockSetVariable="breath"
    //% group="On start: Receiver"
    //% weight=200

    export function createBreathOverBluetooth(): BreathData {
        return new BreathData()
    }

    // ==== ::bt:class ====

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

        onTargetTime: number = 0
        lastTime: number = 0
        motorSpeed: number = 0
        lastReceived: number = 0

        constructor() {
            this.setFrequency(8)
            radio.setGroup(0)
            radio.onReceivedBuffer((buffer) => {
                this.lastReceived = control.millis()
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

        update(): void {
            const time = control.millis()
            const phase = this.getPhase(time)
            this.targetPosition = ((Math.sin(phase) + 1) * 0x7fff) >> 0
            this.targetVelocity = ((Math.cos(phase) + 1) * 0x7fff) >> 0
            basic.clearScreen()
            const pattern =
                control.millis() - this.lastReceived < 1000
                    ? 33080895
                    : 18157905
            for (let i = 0; i < 25; i++) {
                led.plotBrightness(
                    i % 5,
                    Math.idiv(i, 5),
                    ((pattern >> i) & 1) << 8
                )
            }
        }

        // ==== ::bt:setspeed ====

        //% block="$this(breath)|set the target speed to $freq breaths per minute"
        //% freq.min=2 freq.max=60 freq.defl=12
        //% group="On start: Set target speed"
        //% weight=190

        setFrequency(freq: number = 8): void {
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

// ==== ::display:top ====

//% weight=170
//% color=#F7931E
//% icon="\uf110" spinner (same as generic Neopixel)

namespace bioW_Display {
    // ==== ::maps:length ====

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
        lengthMapId: LengthMaps,
        breath: bioW_Bluetooth.BreathData
    ): number {
        switch (lengthMapId) {
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
                    breath.onTargetTime += time - breath.lastTime
                    if (breath.onTargetTime >= 5000) {
                        breath.onTargetTime = 0
                        breath.setFrequency(Math.random() * 26 + 4)
                    }
                }
                breath.lastTime = time
                return breath.targetPosition
        }
    }

    // ==== ::maps:color ====

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
        colorMapId: ColorMaps,
        breath: bioW_Bluetooth.BreathData
    ): number {
        switch (colorMapId) {
            default:
                colorMapId = 0
            case ColorMaps.Red:
            case ColorMaps.Green:
            case ColorMaps.Blue:
                return rgb[colorMapId]
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

    // ==== ::maps:brightness ====

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
        brightnessMapId: BrightnessMaps,
        breath: bioW_Bluetooth.BreathData
    ): number {
        switch (brightnessMapId) {
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

    // ==== ::display:create ====

    //% block="new display on pin $pin"
    //% pin.defl=neoPin.P16
    //% blockSetVariable=display
    //% group="On start: Create"
    //% weight=200

    export function createDisplay(pin: neoPin): Display {
        return new Display(pin)
    }

    // ==== ::display:class ====

    export class Display extends neopixel.Strip {
        breath: bioW_Bluetooth.BreathData = null
        draw: () => void = null

        constructor(pin: neoPin = neoPin.P0) {
            super(BoardID.zero, ClickID.Zero, pin, 64, NeoPixelMode.RGB)
        }

        // ==== ::display:maps ====

        //% block="map $breath=variables_get(breath)|to fill $this(display)|color: $colorMapId|brightness: $brightnessMapId"
        //% inlineInputMode=inline
        //% group="On start: Map"
        //% weight=190

        mapToFill(
            breath: bioW_Bluetooth.BreathData,
            colorMapId: ColorMaps,
            brightnessMapId: BrightnessMaps
        ): void {
            this.breath = breath
            this.draw = () => {
                this.clear()
                this.setBrightness(mapToBrightness(brightnessMapId, breath))
                this.showColor(mapToColor(colorMapId, breath))
            }
        }

        //% block="map $breath=variables_get(breath)|to disk on $this(display)|radius: $lengthMapId|color: $colorMapId|brightness: $brightnessMapId"
        //% inlineInputMode=inline
        //% group="On start: Map"
        //% weight=180

        mapToDisk(
            breath: bioW_Bluetooth.BreathData,
            lengthMapId: LengthMaps,
            colorMapId: ColorMaps,
            brightnessMapId: BrightnessMaps
        ): void {
            this.breath = breath
            this.draw = () => {
                const radius = (mapToLength(lengthMapId, breath) >> 14) + 1
                const color = mapToColor(colorMapId, breath)
                this.setBrightness(mapToBrightness(brightnessMapId, breath))
                this.clear()
                for (let n = 0, x = -3.5; x < 4; x++) {
                    for (let y = -3.5; y < 4; y++, n++) {
                        if (x * x + y * y <= radius * radius) {
                            this.setPixelColor(n, color)
                        }
                    }
                }
                this.show()
            }
        }

        //% block="map $breath=variables_get(breath)|to bar on $this(display)|length: $lengthMapId|color: $colorMapId|brightness: $brightnessMapId"
        //% inlineInputMode=inline
        //% group="On start: Map"
        //% weight=170

        mapToBar(
            breath: bioW_Bluetooth.BreathData,
            lengthMapId: LengthMaps,
            colorMapId: ColorMaps,
            brightnessMapId: BrightnessMaps
        ): void {
            this.breath = breath
            this.draw = () => {
                const length =
                    ((mapToLength(lengthMapId, breath) >> 13) << 3) + 8
                const color = mapToColor(colorMapId, breath)
                this.setBrightness(mapToBrightness(brightnessMapId, breath))
                this.clear()
                for (let n = 2; n < length; ) {
                    this.setPixelColor(n, color)
                    n += n % 8 === 5 ? 5 : 1
                }
                this.show()
            }
        }

        //% block="map $breath=variables_get(breath)|to double bars on $this(display)|length 1: $lengthMapId1|color 1: $colorMapId1|length 2: $lengthMapId2|color 2: $colorMapId2|brightness: $brightnessMapId"
        // inlineInputMode=inline
        //% group="On start: Map"
        //% weight=160

        mapToDoubleBars(
            breath: bioW_Bluetooth.BreathData,
            lengthMapId1: LengthMaps,
            colorMapId1: ColorMaps,
            lengthMapId2: LengthMaps,
            colorMapId2: ColorMaps,
            brightnessMapId: BrightnessMaps
        ): void {
            this.breath = breath
            this.draw = () => {
                const length1 =
                    ((mapToLength(lengthMapId1, breath) >> 13) << 3) + 8
                const length2 =
                    ((mapToLength(lengthMapId2, breath) >> 13) << 3) + 8
                const color1 = mapToColor(colorMapId1, breath)
                const color2 = mapToColor(colorMapId2, breath)
                this.setBrightness(mapToBrightness(brightnessMapId, breath))
                this.clear()
                for (let n = 5; n < length1; ) {
                    this.setPixelColor(n, color1)
                    n += n % 8 === 7 ? 6 : 1
                }
                for (let n = 0; n < length2; ) {
                    this.setPixelColor(n, color2)
                    n += n % 8 === 2 ? 6 : 1
                }
                this.show()
            }
        }

        //% block="map $breath=variables_get(breath)|to spiral on $this(display)|length: $lengthMapId|color: $colorMapId|brightness: $brightnessMapId"
        //% inlineInputMode=inline
        //% group="On start: Map"
        //% weight=150

        mapToSpiral(
            breath: bioW_Bluetooth.BreathData,
            lengthMapId: LengthMaps,
            colorMapId: ColorMaps,
            brightnessMapId: BrightnessMaps
        ): void {
            this.breath = breath
            const pattern =
                'STLKJRZ[\\]UMEDCBAIQYabcdef^VNF>=<;:98@HPX`hijklmnog_WOG?76543210'
            this.draw = () => {
                const length = (mapToLength(lengthMapId, breath) >> 10) + 1
                const color = mapToColor(colorMapId, breath)
                this.setBrightness(mapToBrightness(brightnessMapId, breath))
                this.clear()
                for (let i = 0; i < length; i++) {
                    this.setPixelColor(pattern.charCodeAt(i) - 48, color)
                }
                this.show()
            }
        }

        // ====  ::display:do ====

        //% block="draw mapping from breath to $this(display)"
        //% inlineInputMode=inline
        //% group="Forever: Draw"
        //% weight=200

        drawMapping() {
            this.breath.update()
            this.draw()
        }
    }
}

// ==== ::motor ====

//% weight=160
//% color=#F7931E
//% icon="\uf085" cogs

namespace bioW_Motor {
    // ==== ::maps:speed ====
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

    const speeds = [0, 18, 40, 100]

    function scaleSpeed(x: number, t: number): number {
        return x < t ? 0 : ((x - t) / (0xffff - t)) ** 2 * 82 + 18
    }

    function mapToSpeed(
        speedMapId: SpeedMaps,
        breath: bioW_Bluetooth.BreathData
    ): number {
        switch (speedMapId) {
            default:
            case SpeedMaps.Off:
            case SpeedMaps.Slow:
            case SpeedMaps.Medium:
            case SpeedMaps.Fast:
                return speeds[speedMapId]
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
            case SpeedMaps.Exhale: // velocity on exhale only
                return scaleSpeed(
                    Math.max(0, 0x7fff - breath.velocity) << 1,
                    0x1000
                )
            case SpeedMaps.PhysicalSimulation: // ramp and fade velocity exhale only
                let s = scaleSpeed(
                    Math.max(0, 0x7fff - breath.velocity) << 1,
                    0x1000
                )
                s = Math.max(s, breath.motorSpeed)
                breath.motorSpeed = s * 0.99
                return s
        }
    }

    // ==== ::maps:direction ====
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

    function aboveBelow(x: number, low: number, high: number): number {
        if (x < low) {
            return bBoard_Motor.motorDirection.forward
        } else if (x < high) {
            return bBoard_Motor.motorDirection.brake
        } else {
            return bBoard_Motor.motorDirection.backward
        }
    }

    function mapToDirection(
        directionMapId: DirectionMaps,
        breath: bioW_Bluetooth.BreathData
    ): number {
        switch (directionMapId) {
            default:
            case DirectionMaps.Clockwise:
                return bBoard_Motor.motorDirection.forward
            case DirectionMaps.CounterClockwise:
                return bBoard_Motor.motorDirection.backward
            case DirectionMaps.Strength:
                return aboveBelow(breath.velocity, 0x5fff, 0x9fff)
            case DirectionMaps.TargetVelocity:
                return aboveBelow(breath.targetVelocity, 0x5fff, 0x9fff)
            case DirectionMaps.TargetSpeed:
                return aboveBelow(
                    breath.speed - breath.targetSpeed,
                    -0x1000,
                    0x1000
                )
        }
    }

    //% block="new motor on $side side"
    //% side.defl=bBoard_Motor.motorDriver.left
    //% blockSetVariable="motor"
    //% group="On start: Create"
    //% weight=200

    export function createMotor(side: bBoard_Motor.motorDriver): Motor {
        return new Motor(side)
    }

    // ==== ::motor:class ====

    export class Motor extends bBoard_Motor.BBOARD_MOTOR {
        breath: bioW_Bluetooth.BreathData = null
        speedMapId: number = 0
        directionMapId: number = null

        constructor(
            side: bBoard_Motor.motorDriver = bBoard_Motor.motorDriver.left
        ) {
            super(BoardID.zero, ClickID.Zero, side)
        }

        //% block="map $breath=variables_get(breath) to run $this(motor)|speed: $speedMapId|direction: $directionMapId"
        //% inlineInputMode=inline
        //% group="On start: Map"
        //% weight=200

        setMapping(
            breath: bioW_Bluetooth.BreathData,
            speedMapId: SpeedMaps,
            directionMapId: DirectionMaps
        ): void {
            this.breath = breath
            this.speedMapId = speedMapId
            this.directionMapId = directionMapId
        }

        //% block="run mapping from breath to $this(motor)"
        //% inlineInputMode=inline
        //% group="Forever: Run"
        //% weight=200

        run(): void {
            this.breath.update()
            this.motorDutyDirection(
                mapToSpeed(this.speedMapId, this.breath),
                mapToDirection(this.directionMapId, this.breath)
            )
        }
    }
}
