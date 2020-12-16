/**
 * Custom blocks for the BioWearable workshop.
 *
 * Navigation:
 *   ::util
 *     ::maps:length
 *     ::maps:color
 *     ::maps:brightness
 *     ::util:misc
 *   ::radio
 *     ::radio:class
 *     ::radio:get
 *     ::radio:osc
 *   ::neo
 *     ::neo:class
 *     ::neo:map
 *     ::neo:do
 *     ::neo:draw
 *   ::motor
 *     ::motor:class
 *     ::map:speed
 *     ::map:direction
 *
 * Notes:
 *   @todo
 *   @alternate
 *   @debug
 *   @issue
 */

/****************************************************************
 * Utilities
 */

namespace util {
    // ::util

    /**
     * Function type for a map from `BreathData` to a number
     */
    export type Map = (breath: bioW_Radio.BreathData) => number

    /**
     * Get a mapping function from its identifier.
     * @param id The mapping identifier.
     * @return The mapping function.
     */
    export function getMap(id: number): Map {
        if (id < 200) {
            return getLengthMap(id)
        } else if (id < 300) {
            return getColorMap(id)
        } else if (id < 400) {
            return getBrightnessMap(id)
        } else if (id < 500) {
            return bioW_Motor.getSpeedMap(id)
        } else {
            return bioW_Motor.getDirectionMap(id)
        }
    }

    // ----------------------------------------------------------------
    // Length maps  ::maps:length
    // ----------------------------------------------------------------

    /**
     * Enumeration of all possible mappings for the drawing length.
     */
    export enum LengthMaps {
        //% block="Depth"
        Position = 100,
        //% block="Strength"
        Velocity,
        //% block="Speed"
        Frequency,
        //% block="Target depth"
        TargetPosition,
        //% block="Target strength"
        TargetVelocity,
        //% block="Target speed"
        TargetFrequency
        // block="Random target depth"
        // TargetPositionRandomFrequency
    }

    /**
     * Get a map from breath data to drawing length.
     * @param lengthMapId The id of the chosen length mapping.
     * @return A `Map` of type `(BreathData) => number`.
     */
    function getLengthMap(lengthMapId: LengthMaps): Map {
        switch (lengthMapId) {
            default:
            // throw 'Unexpected lengthMapId' // @debug
            case LengthMaps.Position:
                return (breath) => {
                    return breath.position
                }
            case LengthMaps.Velocity:
                return (breath) => {
                    return breath.velocity
                }
            case LengthMaps.Frequency:
                return (breath) => {
                    return breath.frequency
                }
            case LengthMaps.TargetPosition:
                return (breath) => {
                    return breath.targetPosition
                }
            case LengthMaps.TargetVelocity:
                return (breath) => {
                    return breath.targetVelocity
                }
            case LengthMaps.TargetFrequency:
                return (breath) => {
                    return breath.targetFrequency
                }
            // case LengthMaps.TargetPositionRandomFrequency:
            //     return (breath) => {
            //         return breath.targetFrequency
            //     }
        }
    }

    // ----------------------------------------------------------------
    // Color maps  ::maps:color
    // ----------------------------------------------------------------

    /**
     * Enumeration of all possible mappings for the drawing color.
     */
    export enum ColorMaps {
        //% block="Red"
        ConstantRed = 200,
        //% block="Green"
        ConstantGreen,
        //% block="Blue"
        ConstantBlue,
        //% block="Depth"
        Position,
        //% block="Strength"
        Velocity,
        //% block="Speed"
        Frequency,
        //% block="Target depth"
        TargetPosition,
        //% block="Target strength"
        TargetVelocity,
        //% block="Target speed"
        TargetFrequency,
        //% block="Delta speed"
        DeltaFrequency,
        //% block="Zero crossing"
        ZeroCrossing,
        //% block="Increment Color"
        IncrementColor
    }

    /**
     * Get a map from breath data to drawing color.
     * @param colorMapId The id of the chosen color mapping.
     * @return A `Map` of type `(BreathData) => number`.
     */
    function getColorMap(colorMapId: ColorMaps): Map {
        switch (colorMapId) {
            default:
            // throw 'Unexpected colorMapId' // @debug
            case ColorMaps.ConstantRed:
                return (breath) => {
                    return neopixel.colors(NeoPixelColors.Red)
                }
            case ColorMaps.ConstantGreen:
                return (breath) => {
                    return neopixel.colors(NeoPixelColors.Green)
                }
            case ColorMaps.ConstantBlue:
                return (breath) => {
                    return neopixel.colors(NeoPixelColors.Blue)
                }
            case ColorMaps.Position:
                return (breath) => {
                    return breath.position > 50
                        ? neopixel.colors(NeoPixelColors.Green)
                        : neopixel.colors(NeoPixelColors.Blue)
                }
            case ColorMaps.Velocity:
                return (breath) => {
                    return breath.velocity > 50
                        ? neopixel.colors(NeoPixelColors.Green)
                        : neopixel.colors(NeoPixelColors.Blue)
                }
            case ColorMaps.TargetPosition:
                return (breath) => {
                    const radius = 20
                    const distance = Math.abs(
                        breath.targetPosition - breath.position
                    )
                    if (distance <= radius) {
                        return neopixel.colors(NeoPixelColors.Green)
                    } else if (distance <= 2 * radius) {
                        return neopixel.colors(NeoPixelColors.Blue)
                    } else {
                        return neopixel.colors(NeoPixelColors.Red)
                    }
                }
            case ColorMaps.TargetVelocity:
                return (breath) => {
                    const radius = 20
                    const distance = Math.abs(
                        breath.targetVelocity - breath.velocity
                    )
                    if (distance <= radius) {
                        return neopixel.colors(NeoPixelColors.Green)
                    } else if (distance <= 2 * radius) {
                        return neopixel.colors(NeoPixelColors.Blue)
                    } else {
                        return neopixel.colors(NeoPixelColors.Red)
                    }
                }
            case ColorMaps.TargetFrequency:
                return (breath) => {
                    const radius = 20
                    const distance = breath.frequency - breath.targetFrequency
                    if (distance < -radius) {
                        return neopixel.colors(NeoPixelColors.Blue)
                    } else if (distance > radius) {
                        return neopixel.colors(NeoPixelColors.Red)
                    } else {
                        return neopixel.colors(NeoPixelColors.Green)
                    }
                }
            // case ColorMaps.DeltaFrequency:
            //     return (breath) => {
            //         const delta =
            //             breath.frequency / breath.targetFrequency - 1
            //         if (delta < -0.1) {
            //             return neopixel.colors(NeoPixelColors.Green)
            //         } else if (delta > 0.1) {
            //             return neopixel.colors(NeoPixelColors.Red)
            //         } else {
            //             return neopixel.colors(NeoPixelColors.Blue)
            //         }
            //     }
            // case ColorMaps.ZeroCrossing: // @todo needs props
            //     return (breath) => {
            //         return neopixel.colors(NeoPixelColors.Red)
            //     }
            // case ColorMaps.IncrementColor:
            //     // Using a closure to store color and limit calls to hsl()
            //     // @alternate could use scheduler
            //     return ((): Map => {
            //         let N = -1
            //         let color = 0
            //         return (breath) => {
            //             let n = control.millis() % 1000
            //             if (n !== N) {
            //                 color = neopixel.hsl((n * 60) % 360, 99, 50)
            //                 N = n
            //             }
            //             return color
            //         }
            //     })()
        }
    }

    // ----------------------------------------------------------------
    // Brightness maps  ::maps:brightness
    // ----------------------------------------------------------------

    /**
     * Enumeration of all possible mappings for the drawing brightness.
     */
    export enum BrightnessMaps {
        //% block="Low"
        ConstantLow = 300,
        //% block="Medium"
        ConstantMedium,
        //% block="High"
        ConstantHigh,
        //% block="Depth"
        Position,
        //% block="Strength"
        Velocity,
        //% block="Speed"
        Frequency,
        //% block="Target depth"
        TargetPosition,
        //% block="Target strength"
        TargetVelocity,
        //% block="Target speed"
        TargetFrequency,
        //% block="Delta speed"
        DeltaFrequency
    }

    /**
     * Get a map from breath data to drawing brightness.
     * @param brightnessMapId The id of the chosen brightness mapping.
     * @return A `Map` of type `(BreathData) => number`.
     */
    function getBrightnessMap(brightnessMapId: BrightnessMaps): Map {
        switch (brightnessMapId) {
            default:
            // throw 'Unexpected brightnessMapId' // @debug
            case BrightnessMaps.ConstantLow:
                return (breath) => {
                    return 10
                }
            case BrightnessMaps.ConstantMedium:
                return (breath) => {
                    return 50
                }
            case BrightnessMaps.ConstantHigh:
                return (breath) => {
                    return 100
                }
            case BrightnessMaps.Position:
                return (breath) => {
                    return breath.position
                }
            case BrightnessMaps.Velocity:
                return (breath) => {
                    return breath.velocity
                }
            case BrightnessMaps.Frequency:
                return (breath) => {
                    return breath.frequency // @todo scaling is reversed
                }
            case BrightnessMaps.TargetPosition:
                return (breath) => {
                    return breath.targetPosition
                }
            case BrightnessMaps.TargetVelocity:
                return (breath) => {
                    const radius = 20
                    const low = breath.targetVelocity - radius
                    const high = breath.targetVelocity + radius
                    if (breath.velocity < low) {
                        // dim to max
                        return map(0, low, 0, 100, breath.velocity)
                    } else if (breath.velocity > high) {
                        // max to dim
                        return map(high, 100, 100, 0, breath.velocity)
                    } else {
                        // max
                        return 100
                    }
                }
            // case BrightnessMaps.DeltaFrequency: // @todo not finished in Arduino code
            //     return (breath) => {
            //         const delta =
            //             breath.frequency / breath.targetFrequency - 1
            //         if (delta < -0.1) {
            //             return 100
            //         } else if (delta > 0.1) {
            //             return 100
            //         } else {
            //             return 255
            //         }
            //     }
        }
    }

    // ----------------------------------------------------------------
    // Misc ::util:misc
    // ----------------------------------------------------------------

    /**
     * Scale an input ranging from 0 to 100 to an integer value from 0 to max.
     * @param x The input value to scale (0 to 100).
     * @param max The maximum integer value to scale to.
     * @return The scaled value rounded to an integer.
     */
    export function iscale(x: number, max: number): number {
        return Math.clamp(0, max, Math.idiv(x * (max + 1), 100))
    }

    /**
     * Scale an input from an input range to an output range.
     * @param in1 First border of the input range.
     * @param in2 Second border of the input range.
     * @param out1 First border of the output range.
     * @param out2 Second border of the output range.
     * @param x The input value.
     * @return The scaled value.
     */
    export function map(
        in1: number,
        in2: number,
        out1: number,
        out2: number,
        x: number
    ): number {
        return ((x - in1) * (out2 - out1)) / (in2 - in1) + out1
    }

    /**
     * The error messages used to report issues.
     */
    export const errorMessage: { [key: string]: string } = {
        neopixel: 'You need to create a Neopixel.',
        breath: 'You need to create a breath sensor.',
        motor: 'You need to create a motor.',
        radio: 'You need to create a radio receiver providing breath data.'
    }

    /**
     * Test a predicate and throw an error if false.
     * @param test The boolean value to assert.
     * @param string The error message to throw.
     * @example
     * assert(test, util.errorMessage.type)
     */
    export function assert(test: boolean, error: string): void {
        if (!test) throw error

        // Alternatives are found in the control library
        // (control.assert() / control.fail() / control.panic()).
        // But in block mode, the user only sees an error code.
        // Throw instead displays the error message directly.
    }
}

/****************************************************************
 * Radio communication to receive breath data
 */

//% weight=200
//% color=#F7931E
//% icon="\uf012" signal (same as generic Radio)

namespace bioW_Radio {
    // ::radio

    /**
     * Create an object to manage receiving values from a breath sensor connected to another micro:bit.
     * @param channel The group ID for radio communications.
     * @return A new `BreathData` object.
     */

    //% block="new radio receiver on group $group"
    //% channel.min=0 channel.max=255 channel.defl=0
    //% blockSetVariable="breath"
    //% group="On start: Receiver"
    //% weight=200

    export function createBreathOverRadio(channel: number = 0): BreathData {
        return new BreathData(channel)
    }

    /**
     * A class to manage receiving values from a breath sensor connected to another micro:bit.
     */
    export class BreathData {
        // ::radio:class
        position: number = 0
        velocity: number = 0
        frequency: number = 0

        targetPosition: number = 0
        targetVelocity: number = 0
        targetFrequency: number = 12

        timeAtFreqChange: number = 0
        phaseAtFreqChange: number = 0

        constructor(group: number) {
            radio.setGroup(group & 0xff)
            radio.onReceivedBuffer((buffer) => {
                this.position = buffer.getNumber(NumberFormat.Float32LE, 0)
                this.velocity = buffer.getNumber(NumberFormat.Float32LE, 4)
                this.frequency = buffer.getNumber(NumberFormat.Float32LE, 8)
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

        updateTarget(): void {
            const time = control.millis()
            const phase = this.getPhase(time)
            this.targetPosition = 50 * Math.sin(phase) + 50
            this.targetVelocity = 50 * Math.cos(phase) + 50
            serial.writeValue('phase', phase)
            serial.writeValue('tx', this.targetPosition)
            serial.writeValue('tdx', this.targetVelocity)
        }

        /**
         * Change the target frequency and adjust the phase calculation.
         */

        //% block="$this(breath)|set the target frequency to $freq per minute"
        //% freq.min=2 freq.max=60 freq.defl=12
        //% group="On start: Set parameters"
        //% weight=190

        setFrequency(freq: number = 12): void {
            if (freq !== this.targetFrequency) {
                const time = control.millis()
                this.phaseAtFreqChange = this.getPhase(time)
                this.timeAtFreqChange = time
                this.targetFrequency = freq
            }
        }
    }

    // ----------------------------------------------------------------
    // Oscillator  ::radio:osc
    // ----------------------------------------------------------------

    /**
     * A sinusoidal oscillator to simulate breath for instance.
     * Changing the frequency creates a discontinuity.
     * @param frequency The frequency of the oscillator (cycles per minute).
     * @param shift The phase shift (0 to 360).
     * @return The oscillator value (0 to 100).
     */

    // block="cycle $frequency times per minute"
    //% frequency.min=2 frequency.max=30 frequency.defl=12
    //% advanced=true
    //% weight=160

    export function oscillator(frequency: number): number {
        // Using regular Math.sin():
        // 50 * (Math.sin(Math.PI * frequency * control.millis() / 30000) + 1)
        // Using faster Math.isin() approximation ([0 - 255] to [1 - 128 - 255])
        // 100 / 254 * (Math.isin(255 * frequency * control.millis() / 60000) - 1)

        return (
            (100 / 254) * Math.isin(0.00425 * frequency * control.millis() - 1)
        )
    }
}

/****************************************************************
 * Neopixel LED matrix
 */

//% weight=170
//% color=#F7931E
//% icon="\uf110" spinner (same as generic Neopixel)
// icon="\uf0eb" lightbulb
// icon="\uf00a" th

namespace bioW_Neopixel {
    // ::neo

    /**
     * Create an object to manage a Neopixel LED matrix.
     * @param pin The pin on the b.Board to which the Neopixel is connected.
     * @return A new `Neopixel` object.
     */

    //% block="new neopixel on pin $pin"
    //% pin.defl=neoPin.P16
    //% blockSetVariable=myNeopixel
    //% group="On start: Create"
    //% weight=200

    export function createNeopixel(pin: neoPin): Neopixel {
        return new Neopixel(pin)
    }

    /**
     * A class to manage drawing to the Neopixel.
     * The instance is also used to store breath mappings.
     */
    export class Neopixel extends neopixel.Strip {
        // ::neo:class
        breath: bioW_Radio.BreathData = null
        draw: () => void = null

        constructor(pin: neoPin = neoPin.P0) {
            super(BoardID.zero, ClickID.Zero, pin, 64, NeoPixelMode.RGB)
        }

        // ----------------------------------------------------------------
        // Mapping methods  ::neo:map
        // ----------------------------------------------------------------

        //% block="map $breath=variables_get(breath)|to fill $this(myNeopixel)|color: $colorMapId|brightness: $brightnessMapId"
        //% inlineInputMode=inline
        //% group="On start: Map"
        //% weight=190

        mapToFill(
            breath: bioW_Radio.BreathData,
            colorMapId: util.ColorMaps,
            brightnessMapId: util.BrightnessMaps
        ): void {
            this.breath = breath
            this.draw = () => {
                drawFill(
                    this,
                    util.getMap(colorMapId)(breath),
                    util.getMap(brightnessMapId)(breath)
                )
            }
        }

        //% block="map $breath=variables_get(breath)|to disk on $this(myNeopixel)|radius: $lengthMapId|color: $colorMapId|brightness: $brightnessMapId"
        //% inlineInputMode=inline
        //% group="On start: Map"
        //% weight=180

        mapToDisk(
            breath: bioW_Radio.BreathData,
            lengthMapId: util.LengthMaps,
            colorMapId: util.ColorMaps,
            brightnessMapId: util.BrightnessMaps
        ): void {
            this.breath = breath
            this.draw = () => {
                drawDisk(
                    this,
                    util.getMap(lengthMapId)(breath),
                    util.getMap(colorMapId)(breath),
                    util.getMap(brightnessMapId)(breath)
                )
            }
        }

        //% block="map $breath=variables_get(breath)|to bar on $this(myNeopixel)|length: $lengthMapId|color: $colorMapId|brightness: $brightnessMapId"
        //% inlineInputMode=inline
        //% group="On start: Map"
        //% weight=170

        mapToBar(
            breath: bioW_Radio.BreathData,
            lengthMapId: util.LengthMaps,
            colorMapId: util.ColorMaps,
            brightnessMapId: util.BrightnessMaps
        ): void {
            this.breath = breath
            this.draw = () => {
                drawBar(
                    this,
                    util.getMap(lengthMapId)(breath),
                    util.getMap(colorMapId)(breath),
                    util.getMap(brightnessMapId)(breath)
                )
            }
        }

        //% block="map $breath=variables_get(breath)|to double bars on $this(myNeopixel)|length 1: $lengthMapId1|color 1: $colorMapId1|length 2: $lengthMapId2|color 2: $colorMapId2|brightness: $brightnessMapId"
        // inlineInputMode=inline
        //% group="On start: Map"
        //% weight=160

        mapToDoubleBars(
            breath: bioW_Radio.BreathData,
            lengthMapId1: util.LengthMaps,
            colorMapId1: util.ColorMaps,
            lengthMapId2: util.LengthMaps,
            colorMapId2: util.ColorMaps,
            brightnessMapId: util.BrightnessMaps
        ): void {
            this.breath = breath
            this.draw = () => {
                drawDoubleBars(
                    this,
                    util.getMap(lengthMapId1)(breath),
                    util.getMap(colorMapId1)(breath),
                    util.getMap(lengthMapId2)(breath),
                    util.getMap(colorMapId2)(breath),
                    util.getMap(brightnessMapId)(breath)
                )
            }
        }

        //% block="map $breath=variables_get(breath)|to spiral on $this(myNeopixel)|length: $lengthMapId|color: $colorMapId|brightness: $brightnessMapId"
        //% inlineInputMode=inline
        //% group="On start: Map"
        //% weight=150

        mapToSpiral(
            breath: bioW_Radio.BreathData,
            lengthMapId: util.LengthMaps,
            colorMapId: util.ColorMaps,
            brightnessMapId: util.BrightnessMaps
        ): void {
            this.breath = breath
            this.draw = () => {
                drawSpiral(
                    this,
                    util.getMap(lengthMapId)(breath),
                    util.getMap(colorMapId)(breath),
                    util.getMap(brightnessMapId)(breath)
                )
            }
        }

        // ----------------------------------------------------------------
        // Draw the mapping  ::neo:do
        // ----------------------------------------------------------------

        //% block="draw mapping from breath to $this(myNeopixel)"
        //% inlineInputMode=inline
        //% group="Forever: Draw"
        //% weight=200

        drawMapping() {
            this.breath.updateTarget()
            this.draw()
        }
    }

    // ----------------------------------------------------------------
    // Drawing methods  ::neo:draw
    // ----------------------------------------------------------------

    /**
     * Draw the full LED matrix on the Neopixel. Make sure to provide an initialized `Neopixel`.
     * @param myNeopixel The Neopixel to draw to.
     * @param color The color of the matrix (24 bit).
     * @param brightness The brightness of the matrix (0 to 100).
     */

    // block="draw fill on $myNeopixel=variables_get(myNeopixel)|color = $color|brightness = $brightness"
    //% color.shadow=neopixel_colors
    //% brightness.min=0 brightness.max=100 brightness.defl=10
    //% inlineInputMode=inline
    //% advanced=true
    //% weight=190

    export function drawFill(
        myNeopixel: Neopixel,
        color: number,
        brightness: number = 10
    ): void {
        util.assert(!!myNeopixel, util.errorMessage.neopixel)
        myNeopixel.clear()
        myNeopixel.setBrightness(util.iscale(brightness, 255))
        myNeopixel.showColor(color)
    }

    /**
     * Draw a disk on the Neopixel LED matrix. Make sure to provide an initialized `Neopixel`.
     * @param myNeopixel The Neopixel to draw to.
     * @param radius The radius of the disk (0 to 100).
     * @param color The color of the disk (24 bit).
     * @param brightness The brightness of the disk (0 to 100).
     */

    // block="draw disk on $myNeopixel=variables_get(myNeopixel)|radius = $radius|color = $color|brightness = $brightness"
    //% radius.min=0 radius.max=100 radius.defl=100
    //% color.shadow=neopixel_colors
    //% brightness.min=0 brightness.max=100 brightness.defl=10
    //% inlineInputMode=inline
    //% advanced=true
    //% weight=170

    export function drawDisk(
        myNeopixel: Neopixel,
        radius: number,
        color: number,
        brightness: number = 10
    ): void {
        util.assert(!!myNeopixel, util.errorMessage.neopixel)
        radius = util.iscale(radius, 4)
        myNeopixel.setBrightness(util.iscale(brightness, 255))

        // @todo: Brightness gradient by ramping RGB values
        myNeopixel.clear()
        for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
                if (
                    Math.sqrt((x - 3.5) * (x - 3.5) + (y - 3.5) * (y - 3.5)) <=
                    radius
                ) {
                    myNeopixel.setPixelColor(x + y * 8, color)
                }
            }
        }
        myNeopixel.show()
    }

    /**
     * Draw a single bar on the Neopixel LED matrix. Make sure to provide an initialized `Neopixel`.
     * @param myNeopixel The Neopixel to draw to.
     * @param length The length of the bar (0 to 100).
     * @param color The color of the bar (24 bit).
     * @param brightness The brightness of the bar (0 to 100).
     */

    // block="draw bar on $myNeopixel=variables_get(myNeopixel)|length = $length|color = $color|brightness = $brightness"
    //% length.min=0 length.max=100 length.defl=25
    //% color.shadow=neopixel_colors
    //% brightness.min=0 brightness.max=100 brightness.defl=10
    //% inlineInputMode=inline
    //% advanced=true
    //% weight=160

    export function drawBar(
        myNeopixel: Neopixel,
        length: number,
        color: number,
        brightness: number = 10
    ): void {
        util.assert(!!myNeopixel, util.errorMessage.neopixel)
        length = util.iscale(length, 8)
        myNeopixel.setBrightness(util.iscale(brightness, 255))

        myNeopixel.clear()
        for (let y = 8 - length; y < 8; y++) {
            const n = y << 3
            myNeopixel.setPixelColor(n + 2, color)
            myNeopixel.setPixelColor(n + 3, color)
            myNeopixel.setPixelColor(n + 4, color)
            myNeopixel.setPixelColor(n + 5, color)
        }
        myNeopixel.show()
    }

    /**
     * Draw double bars on the Neopixel LED matrix. Make sure to provide an initialized `Neopixel`.
     * @param myNeopixel The Neopixel to draw to.
     * @param length1 The length of the first bar (0 to 100).
     * @param color1 The color of the first bar (24 bit).
     * @param length2 The length of the second bar (0 to 100).
     * @param color2 The color of the second bar (24 bit).
     * @param brightness The brightness of the two bars (0 to 100).
     */

    // block="draw double bars on $myNeopixel=variables_get(myNeopixel)|length 1 = $length1|color 1 = $color1|length 2 = $length2|color 2 = $color2|brightness = $brightness"
    //% length1.min=0 length1.max=100 length1.defl=25
    //% color1.shadow=neopixel_colors
    //% length2.min=0 length2.max=100 length2.defl=25
    //% color2.shadow=neopixel_colors
    //% brightness.min=0 brightness.max=100 brightness.defl=10
    // inlineInputMode=inline
    //% advanced=true
    //% weight=150

    export function drawDoubleBars(
        myNeopixel: Neopixel,
        length1: number,
        color1: number = NeoPixelColors.Red,
        length2: number,
        color2: number = NeoPixelColors.Red,
        brightness: number = 10
    ): void {
        util.assert(!!myNeopixel, util.errorMessage.neopixel)
        length1 = util.iscale(length1, 8)
        length2 = util.iscale(length2, 8)
        myNeopixel.setBrightness(util.iscale(brightness, 255))

        // @todo: Brightness gradient by ramping RGB values
        myNeopixel.clear()
        for (let y = 8 - length1; y < 8; y++) {
            const n = y * 8
            myNeopixel.setPixelColor(n + 0, color1)
            myNeopixel.setPixelColor(n + 1, color1)
            myNeopixel.setPixelColor(n + 2, color1)
        }
        for (let y = 8 - length2; y < 8; y++) {
            const n = y * 8
            myNeopixel.setPixelColor(n + 5, color2)
            myNeopixel.setPixelColor(n + 6, color2)
            myNeopixel.setPixelColor(n + 7, color2)
        }
        myNeopixel.show()
    }

    /**
     * Draw a spiral on a Neopixel LED matrix based on mapped breath data. Make sure to provide an initialized `Neopixel`.
     * @param myNeopixel The Neopixel to draw to.
     * @param length The length of the spiral (0 to 100).
     * @param color The color of the spiral (24 bit).
     * @param brightness The brightness of the spiral (0 to 100).
     */

    // block="draw spiral on $myNeopixel=variables_get(myNeopixel)|length = $length|color = $color|brightness = $brightness"
    //% length.min=0 length.max=100 length.defl=25
    //% color.shadow=neopixel_colors
    //% brightness.min=0 brightness.max=100 brightness.defl=10
    // inlineInputMode=inline
    //% advanced=true
    //% weight=140

    export function drawSpiral(
        myNeopixel: Neopixel,
        length: number,
        color: number,
        brightness: number = 10
    ): void {
        util.assert(!!myNeopixel, util.errorMessage.neopixel)
        length = util.iscale(length, 64)
        myNeopixel.setBrightness(util.iscale(brightness, 255))

        let n = 36 // (4, 4)
        const dn = [-8, -1, 8, 1] // up, left, down, right
        // clockwise is [-1, -8, 1, 8]: left, up, right, down

        myNeopixel.clear()
        // Draw each segment or portion of the last segment
        for (let segmentIndex = 0, count = 0; count < length; segmentIndex++) {
            let segmentLength = (segmentIndex >> 1) + 1
            segmentLength = Math.min(segmentLength, length - count)
            for (let i = 0; i < segmentLength; i++) {
                myNeopixel.setPixelColor(n, color)
                n += dn[segmentIndex % 4]
            }
            count += segmentLength
        }
        myNeopixel.show()
    }
}

/****************************************************************
 * Motor and pinwheel
 */

//% weight=160
//% color=#F7931E
//% icon="\uf085" cogs (same as generic BBoard_Motor)
// icon="\uf013" cog
// icon="\uf185" sun

namespace bioW_Motor {
    // ::motor
    /**
     * Enumeration of all possible mappings for the motor speed.
     */
    // ::map:speed
    export enum SpeedMaps {
        Off = 400,
        //% block="Depth"
        Position,
        //% block="Speed"
        Frequency,
        //% block="Target depth"
        TargetPosition,
        //% block="Target strength"
        TargetVelocity,
        //% block="Target speed Slow"
        TargetFrequencySlow,
        //% block="Target speed Fast"
        TargetFrequencyFast,
        //% block="Delta speed"
        DeltaFrequency,
        //% block="Exhale Only"
        ExhaleOnly,
        //% block="Physical Simulation"
        PhysicalSimulation
    }

    /**
     * Get a map from breath data to motor speed.
     * @param speedMapId The id of the chosen speed mapping.
     * @return A `Map` of type `(breath) => number`.
     */
    export function getSpeedMap(speedMapId: SpeedMaps): util.Map {
        switch (speedMapId) {
            default:
            // throw 'Unexpected speedMapId' // @debug
            case SpeedMaps.Off:
                return (breath) => {
                    return 0
                }
            case SpeedMaps.Position:
                return (breath) => {
                    return 10
                }
            case SpeedMaps.Frequency:
                return (breath) => {
                    return 0
                }
            case SpeedMaps.TargetPosition:
                return (breath) => {
                    return 0
                }
            case SpeedMaps.TargetVelocity:
                return (breath) => {
                    return 0
                }
            // case SpeedMaps.TargetFrequencySlow:
            //     return (breath) => {
            //         return 0
            //     }
            // case SpeedMaps.TargetFrequencyFast:
            //     return (breath) => {
            //         return 0
            //     }
            // case SpeedMaps.DeltaFrequency:
            //     return (breath) => {
            //         return 0
            //     }
            // case SpeedMaps.ExhaleOnly:
            //     return (breath) => {
            //         return 0
            //     }
            // case SpeedMaps.PhysicalSimulation:
            //     return (breath) => {
            //         return 0
            //     }
        }
    }

    /**
     * Enumeration of all possible mappings for the motor direction.
     */
    // ::map:direction
    export enum DirectionMaps {
        Forward = 500,
        Backward,
        //% block="Strength"
        Velocity,
        //% block="Target strength"
        TargetVelocity,
        //% block="Delta speed"
        TargetFrequency
    }

    /**
     * Get a map from breath data to motor direction.
     * @param directionMapId The id of the chosen direction mapping.
     * @return A `Map` of type `(BreathData) => number`.
     */
    export function getDirectionMap(directionMapId: DirectionMaps): util.Map {
        Direction
        switch (directionMapId) {
            default:
            // throw 'Unexpected directionMapId' // @debug
            case DirectionMaps.Forward:
                return (breath) => {
                    return bBoard_Motor.motorDirection.forward
                }
            case DirectionMaps.Backward:
                return (breath) => {
                    return bBoard_Motor.motorDirection.backward
                }
            case DirectionMaps.Velocity:
                return (breath) => {
                    return bBoard_Motor.motorDirection.forward
                }
            case DirectionMaps.TargetVelocity:
                return (breath) => {
                    return bBoard_Motor.motorDirection.forward
                }
            case DirectionMaps.TargetFrequency:
                return (breath) => {
                    return bBoard_Motor.motorDirection.forward
                }
        }
    }

    /**
     * Create a new motor.
     * @param side The side of the b.Board to which the motor is connected.
     * @return A new `Motor` object.
     */

    //% block="new motor on $side side"
    //% side.defl=bBoard_Motor.motorDriver.left
    //% blockSetVariable="myMotor"
    //% group="On start: Create"
    //% weight=200

    export function createMotor(side: bBoard_Motor.motorDriver): Motor {
        return new Motor(side)
    }

    /**
     * A class to manage receiving values from a breath sensor connected to another micro:bit.
     */
    export class Motor {
        // ::motor:class
        breath: bioW_Radio.BreathData = null
        speedMap: util.Map = null
        directionMap: util.Map = null
        motor: bBoard_Motor.BBOARD_MOTOR = null

        constructor(
            side: bBoard_Motor.motorDriver = bBoard_Motor.motorDriver.left
        ) {
            // super(BoardID.zero, ClickID.Zero, null)
            // see @issue

            this.motor = bBoard_Motor.createMotor(
                side,
                BoardID.zero,
                ClickID.Zero,
                bBoard_Motor.motorState.enabled
            )
        }

        //% block="map $breath=variables_get(breath) to run $this(myMotor)|speed: $speedMapId|direction: $directionMapId"
        //% inlineInputMode=inline
        //% group="On start: Map"
        //% weight=200

        setMapping(
            breath: bioW_Radio.BreathData,
            speedMapId: SpeedMaps,
            directionMapId: DirectionMaps
        ): void {
            this.breath = breath
            this.speedMap = getSpeedMap(speedMapId)
            this.directionMap = getDirectionMap(directionMapId)
        }

        //% block="run mapping from breath to $this(myMotor)"
        //% inlineInputMode=inline
        //% group="Forever: Run"
        //% weight=200

        run(): void {
            this.breath.updateTarget()
            //this.motor.motorDutyDirection()
            this.motor.motorPowerDirection(
                this.speedMap(this.breath),
                this.directionMap(this.breath)
            )
        }
    }
}
