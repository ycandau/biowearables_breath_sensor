/**
 * Custom blocks for the BioWearable workshop.
 *
 * Navigation:
 *   ::util
 *     ::util:maps:length
 *     ::util:maps:color
 *     ::util:maps:brightness
 *   ::micro
 *     ::micro:class
 *     ::micro:map
 *     ::micro:do
 *     ::micro:draw
 *   ::neo
 *     ::neo:class
 *     ::neo:map
 *     ::neo:do
 *     ::neo:draw
 *   ::breath
 *     ::breath:class
 *     ::breath:get
 *     ::breath:osc
 *   ::motor
 *     ::motor:class
 *   ::radio
 *     ::radio:class
 *
 * Notes:
 *   @todo
 *   @alternate
 *   @debug
 */

/****************************************************************
 * Utilities
 */

namespace util {
    // ::util
    /**
     * Union type for classes that provide breath data: `BreathSensor` and `BreathOverRadio`.
     */
    export type BreathData =
        | bioW_Breath.BreathSensor
        | bioW_Radio.BreathOverRadio

    /**
     * Union type for classes that provide displays: `Microbit` and `Neopixel`.
     */
    export type Displays = bioW_Microbit.Microbit | bioW_Neopixel.Neopixel

    /**
     * Function type for to map `BreathData` to a number
     */
    export type Map = (breathData: BreathData) => number

    // ----------------------------------------------------------------
    // Length maps  ::util:maps:length
    // ----------------------------------------------------------------

    /**
     * Enumeration of all possible mappings for the drawing length.
     */
    export enum LengthMaps {
        Constant = 100,
        Position,
        Velocity,
        Frequency,
        //% block="Target position"
        TargetPosition,
        //% block="Target velocity"
        TargetVelocity,
        //% block="Target frequency"
        TargetFrequency,
        //% block="Target position random frequency"
        TargetPositionRandomFrequency
    }

    /**
     * Get a map from breath data to drawing length.
     * @param lengthMapId The id of the chosen length mapping.
     * @return A `Map` of type `(BreathData) => number`.
     */
    function getLengthMap(lengthMapId: LengthMaps): Map {
        switch (lengthMapId) {
            case LengthMaps.Constant:
                return (breathData) => {
                    return 100
                }
            case LengthMaps.Position:
                return (breathData) => {
                    return breathData.position
                }
            case LengthMaps.Velocity:
                return (breathData) => {
                    return breathData.velocity
                }
            case LengthMaps.Frequency:
                return (breathData) => {
                    return breathData.frequency
                }
            case LengthMaps.TargetPosition:
                return (breathData) => {
                    return breathData.targetPosition
                }
            case LengthMaps.TargetVelocity:
                return (breathData) => {
                    return breathData.targetVelocity
                }
            case LengthMaps.TargetFrequency:
                return (breathData) => {
                    return breathData.targetFrequency
                }
            case LengthMaps.TargetPositionRandomFrequency:
                // @todo switch target frequency
                return (breathData) => {
                    return breathData.targetFrequency
                }
            default:
                throw 'Unexpected lengthMapId' // @debug
        }
    }

    // @alternate
    // Could also use an object literal:
    // function getLengthMap2(lengthMapId: LengthMaps): Map {
    //     const maps: { [index: number]: Map } = {
    //         [LengthMaps.Constant]: (breathData) => {
    //             return 100
    //         }
    //     }
    //     return maps[lengthMapId]
    // }

    // ----------------------------------------------------------------
    // Color maps  ::util:maps:color
    // ----------------------------------------------------------------

    /**
     * Enumeration of all possible mappings for the drawing color.
     */
    export enum ColorMaps {
        //% block="Constant Red"
        ConstantRed = 200,
        //% block="Constant Green"
        ConstantGreen,
        //% block="Constant Blue"
        ConstantBlue,
        Position,
        Velocity,
        //% block="Target position"
        TargetPosition,
        //% block="Target velocity"
        TargetVelocity,
        //% block="Target frequency"
        TargetFrequency,
        //% block="Delta frequency"
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
            case ColorMaps.ConstantRed:
                return (breathData) => {
                    return neopixel.colors(NeoPixelColors.Red)
                }
            case ColorMaps.ConstantGreen:
                return (breathData) => {
                    return neopixel.colors(NeoPixelColors.Green)
                }
            case ColorMaps.ConstantBlue:
                return (breathData) => {
                    return neopixel.colors(NeoPixelColors.Blue)
                }
            case ColorMaps.Position:
                return (breathData) => {
                    return breathData.position > 50
                        ? neopixel.colors(NeoPixelColors.Green)
                        : neopixel.colors(NeoPixelColors.Blue)
                }
            case ColorMaps.Velocity:
                return (breathData) => {
                    return breathData.velocity > 50
                        ? neopixel.colors(NeoPixelColors.Green)
                        : neopixel.colors(NeoPixelColors.Blue)
                }
            case ColorMaps.TargetPosition:
                return (breathData) => {
                    const radius = 20
                    const distance = Math.abs(
                        breathData.targetPosition - breathData.position
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
                return (breathData) => {
                    const radius = 20
                    const distance = Math.abs(
                        breathData.targetVelocity - breathData.velocity
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
                return (breathData) => {
                    const radius = 20
                    const distance =
                        breathData.frequency - breathData.targetFrequency
                    if (distance < -radius) {
                        return neopixel.colors(NeoPixelColors.Blue)
                    } else if (distance > radius) {
                        return neopixel.colors(NeoPixelColors.Red)
                    } else {
                        return neopixel.colors(NeoPixelColors.Green)
                    }
                }
            case ColorMaps.DeltaFrequency:
                return (breathData) => {
                    const delta =
                        breathData.frequency / breathData.targetFrequency - 1
                    if (delta < -0.1) {
                        return neopixel.colors(NeoPixelColors.Green)
                    } else if (delta > 0.1) {
                        return neopixel.colors(NeoPixelColors.Red)
                    } else {
                        return neopixel.colors(NeoPixelColors.Blue)
                    }
                }
            case ColorMaps.ZeroCrossing: // @todo needs props
                return (breathData) => {
                    return neopixel.colors(NeoPixelColors.Red)
                }
            case ColorMaps.IncrementColor:
                // Using a closure to store color and limit calls to hsl()
                // @alternate could use scheduler
                return ((): Map => {
                    let N = -1
                    let color = 0
                    return (breathData) => {
                        let n = input.runningTime() % 1000
                        if (n !== N) {
                            color = neopixel.hsl((n * 60) % 360, 99, 50)
                            N = n
                        }
                        return color
                    }
                })()
            default:
                throw 'Unexpected colorMapId' // @debug
        }
    }

    // ----------------------------------------------------------------
    // Brightness maps  ::util:maps:brightness
    // ----------------------------------------------------------------

    /**
     * Enumeration of all possible mappings for the drawing brightness.
     */
    export enum BrightnessMaps {
        //% block="Constant low"
        ConstantLow = 300,
        //% block="Constant medium"
        ConstantMedium,
        //% block="Constant high"
        ConstantHigh,
        Position,
        Velocity,
        Frequency,
        //% block="Target position"
        TargetPosition,
        //% block="Target velocity"
        TargetVelocity,
        //% block="Delta frequency"
        DeltaFrequency
    }

    /**
     * Get a map from breath data to drawing brightness.
     * @param brightnessMapId The id of the chosen brightness mapping.
     * @return A `Map` of type `(BreathData) => number`.
     */
    function getBrightnessMap(brightnessMapId: BrightnessMaps): Map {
        switch (brightnessMapId) {
            case BrightnessMaps.ConstantLow:
                return (breathData) => {
                    return 16
                }
            case BrightnessMaps.ConstantMedium:
                return (breathData) => {
                    return 127
                }
            case BrightnessMaps.ConstantHigh:
                return (breathData) => {
                    return 255
                }
            case BrightnessMaps.Position:
                return (breathData) => {
                    return breathData.position
                }
            case BrightnessMaps.Velocity:
                return (breathData) => {
                    return breathData.velocity
                }
            case BrightnessMaps.Frequency:
                return (breathData) => {
                    return breathData.frequency // @todo scaling is reversed
                }
            case BrightnessMaps.TargetPosition:
                return (breathData) => {
                    return breathData.targetPosition
                }
            case BrightnessMaps.TargetVelocity:
                return (breathData) => {
                    const radius = 20
                    const low = breathData.targetVelocity - radius
                    const high = breathData.targetVelocity + radius
                    if (breathData.velocity < low) {
                        // dim to max
                        return map(0, low, 0, 100, breathData.velocity)
                    } else if (breathData.velocity > high) {
                        // max to dim
                        return map(high, 100, 100, 0, breathData.velocity)
                    } else {
                        // max
                        return 100
                    }
                }
            case BrightnessMaps.DeltaFrequency: // @todo not finished in Arduino code
                return (breathData) => {
                    const delta =
                        breathData.frequency / breathData.targetFrequency - 1
                    if (delta < -0.1) {
                        return 100
                    } else if (delta > 0.1) {
                        return 100
                    } else {
                        return 255
                    }
                }
            default:
                throw 'Unexpected brightnessMapId' // @debug
        }
    }

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
 * Microbit LED matrix
 */

//% weight=180
//% color=#F7931E
//% icon="\uf0ce" table
// icon="\uf2db" microchip
// icon="\uf073" calendar alternate

namespace bioW_Microbit {
    // ::micro

    /**
     * Create an object to manage drawing on a micro:bit LED matrix.
     * @return A new `Microbit` object.
     */

    //% block="new microbit"
    //% blockSetVariable=myMicrobit
    //% group="On start: Create"
    //% weight=200

    export function createMicrobit(): Microbit {
        return new Microbit()
    }

    /**
     * A class to manage drawing to the micro:bit.
     * The instance is also used to store breath mappings.
     */
    export class Microbit {
        // ::micro:class

        draw: () => void = null

        constructor() {}

        // ----------------------------------------------------------------
        // Mapping methods  ::micro:map
        // ----------------------------------------------------------------

        //% block="map $breathData=variables_get(breathData)|to fill $this(myMicrobit)|brightness: $brightnessMapId"
        //% inlineInputMode=inline
        //% group="On start: Map"
        //% weight=190

        mapToFill(
            breathData: util.BreathData,
            brightnessMapId: util.BrightnessMaps
        ): void {
            this.draw = () => {
                drawFill(util.getMap(brightnessMapId)(breathData))
            }
        }

        //% block="map $breathData=variables_get(breathData)|to disk on $this(myMicrobit)|radius: $lengthMapId|brightness: $brightnessMapId"
        //% inlineInputMode=inline
        //% group="On start: Map"
        //% weight=180

        mapToDisk(
            breathData: util.BreathData,
            lengthMapId: util.LengthMaps,
            brightnessMapId: util.BrightnessMaps
        ): void {
            this.draw = () => {
                drawDisk(
                    util.getMap(lengthMapId)(breathData),
                    util.getMap(brightnessMapId)(breathData)
                )
            }
        }

        //% block="map $breathData=variables_get(breathData)|to bar on $this(myMicrobit)|length: $lengthMapId|brightness: $brightnessMapId"
        //% inlineInputMode=inline
        //% group="On start: Map"
        //% weight=170

        mapToBar(
            breathData: util.BreathData,
            lengthMapId: util.LengthMaps,
            brightnessMapId: util.BrightnessMaps
        ): void {
            this.draw = () => {
                drawBar(
                    util.getMap(lengthMapId)(breathData),
                    util.getMap(brightnessMapId)(breathData)
                )
            }
        }

        //% block="map $breathData=variables_get(breathData)|to double bars on $this(myMicrobit)|length 1: $lengthMapId1|brightness 1: $brightnessMapId1|length 2: $lengthMapId2|brightness 2: $brightnessMapId2"
        // inlineInputMode=inline
        //% group="On start: Map"
        //% weight=160

        mapToDoubleBars(
            breathData: util.BreathData,
            lengthMapId1: util.LengthMaps,
            brightnessMapId1: util.BrightnessMaps,
            lengthMapId2: util.LengthMaps,
            brightnessMapId2: util.BrightnessMaps
        ): void {
            this.draw = () => {
                drawDoubleBars(
                    util.getMap(lengthMapId1)(breathData),
                    util.getMap(brightnessMapId1)(breathData),
                    util.getMap(lengthMapId2)(breathData),
                    util.getMap(brightnessMapId2)(breathData)
                )
            }
        }

        //% block="map $breathData=variables_get(breathData)|to spiral on $this(myMicrobit)|length: $lengthMapId|brightness: $brightnessMapId"
        //% inlineInputMode=inline
        //% group="On start: Map"
        //% weight=150

        mapToSpiral(
            breathData: util.BreathData,
            lengthMapId: util.LengthMaps,
            brightnessMapId: util.BrightnessMaps
        ): void {
            this.draw = () => {
                drawSpiral(
                    util.getMap(lengthMapId)(breathData),
                    util.getMap(brightnessMapId)(breathData)
                )
            }
        }

        // ----------------------------------------------------------------
        // Draw the mapping  ::micro:do
        // ----------------------------------------------------------------

        //% block="draw mapping from breath to $this(myMicrobit)"
        //% inlineInputMode=inline
        //% group="Forever: Draw"
        //% weight=200

        drawMapping() {
            this.draw()
        }
    }

    // ----------------------------------------------------------------
    // Drawing functions  ::micro:draw
    // ----------------------------------------------------------------

    /**
     * Draw the full LED matrix on the Microbit.
     * @param brightness The brightness of the matrix (0 to 100).
     */

    //% block="draw fill: brightness = $brightness"
    //% brightness.min=0 brightness.max=100 brightness.defl=10
    //% inlineInputMode=inline
    //% advanced=true
    //% weight=200

    export function drawFill(brightness: number = 10): void {
        led.setBrightness(util.iscale(brightness, 255))
        for (let n = 0; n < 25; n++) {
            led.plot(n % 5, Math.idiv(n, 5))
        }
    }

    /**
     * Draw a disk on the Microbit LED matrix.
     * @param radius The radius of the disk (0 to 100).
     * @param brightness The brightness of the disk (0 to 100).
     */

    //% block="draw disk: radius = $radius|brightness = $brightness"
    //% radius.min=0 radius.max=100 radius.defl=100
    //% brightness.min=0 brightness.max=100 brightness.defl=10
    //% inlineInputMode=inline
    //% advanced=true
    //% weight=190

    export function drawDisk(radius: number, brightness: number = 10): void {
        // @todo Could use symmetry
        brightness = util.iscale(brightness, 255)
        radius = 0.03 * Math.clamp(0, 100, radius)
        for (let x = -2; x < 3; x++) {
            for (let y = -2; y < 3; y++) {
                let d = radius - Math.sqrt(x * x + y * y)
                d = Math.clamp(0, 1, d)
                d *= d *= d // power 4 to curve low values
                led.plotBrightness(x + 2, y + 2, d * brightness)
            }
        }
    }

    /**
     * Draw a single bar on the Microbit LED matrix.
     * @param length The length of the bar (0 to 100).
     * @param brightness The brightness of the bar (0 to 100).
     */

    //% block="draw bar: length = $length|brightness = $brightness"
    //% length.min=0 length.max=100 length.defl=25
    //% brightness.min=0 brightness.max=100 brightness.defl=10
    //% inlineInputMode=inline
    //% advanced=true
    //% weight=170

    export function drawBar(length: number, brightness: number = 10): void {
        length = util.iscale(length, 5)
        led.setBrightness(util.iscale(brightness, 255))
        basic.clearScreen()
        for (let y = 5 - length; y < 5; y++) {
            led.plot(1, y)
            led.plot(2, y)
            led.plot(3, y)
        }
    }

    /**
     * Draw double bars on the Microbit LED matrix.
     * @param length1 The length of the first bar (0 to 100).
     * @param brightness1 The brightness of the first bar (0 to 100).
     * @param length2 The length of the second bar (0 to 100).
     * @param brightness2 The brightness of the second bar (0 to 100).
     */

    //% block="draw double bars: length 1 = $length1|brightness 1 = $brightness1|length 2 = $length2|brightness 2 = $brightness2"
    //% length1.min=0 length1.max=100 length1.defl=25
    //% brightness1.min=0 brightness1.max=100 brightness1.defl=10
    //% length2.min=0 length2.max=100 length2.defl=25
    //% brightness2.min=0 brightness2.max=100 brightness2.defl=10
    // inlineInputMode=inline
    //% advanced=true
    //% weight=160

    export function drawDoubleBars(
        length1: number,
        brightness1: number = 10,
        length2: number,
        brightness2: number = 10
    ): void {
        length1 = util.iscale(length1, 5)
        length2 = util.iscale(length2, 5)
        brightness1 = util.iscale(brightness1, 255)
        brightness2 = util.iscale(brightness2, 255)

        basic.clearScreen()
        for (let y = 5 - length1; y < 5; y++) {
            led.plotBrightness(0, y, brightness1)
            led.plotBrightness(1, y, brightness1)
        }
        for (let y = 5 - length2; y < 5; y++) {
            led.plotBrightness(3, y, brightness2)
            led.plotBrightness(4, y, brightness2)
        }
    }

    /**
     * Draw a spiral on the Microbit LED matrix.
     * @param length The length of the spiral (0 to 100).
     * @param brightness The brightness of the spiral (0 to 100).
     */

    //% block="draw spiral: length = $length|brightness = $brightness"
    //% length.min=0 length.max=100 length.defl=25
    //% brightness.min=0 brightness.max=100 brightness.defl=10
    //% inlineInputMode=inline
    //% advanced=true
    //% weight=1850

    export function drawSpiral(length: number, brightness: number = 10): void {
        let n = 12 // (2, 2)
        const dn = [1, -5, -1, 5] // right, up, left, down
        // Clockwise is [1, 5, -1, -5] // right, down, left, up

        length = util.iscale(length, 25)
        led.setBrightness(util.iscale(brightness, 255))

        // Unplot LEDs manually because basic.clearScreen() creates a lot flickering
        for (
            let segmentIndex = 0, count = 0;
            segmentIndex < 9;
            segmentIndex++
        ) {
            for (let i = 0; i < (segmentIndex >> 1) + 1; i++, count++) {
                if (count < length) {
                    led.plot(n % 5, Math.idiv(n, 5))
                } else {
                    led.unplot(n % 5, Math.idiv(n, 5))
                }
                n += dn[segmentIndex % 4]
            }
        }
    }

    /**
     * Draw the LED matrix over time on the Microbit.
     * @param value The value to plot (0 to 100).
     * @param frequency The brightness of the first bar (0 to 100).
     */

    // block="draw"
    // value.min=0 value.max=100 value.defl=25
    // frequency.min=0 frequency.max=100 frequency.defl=10
    // inlineInputMode=inline

    export function drawPixel(value: number, frequency: number): void {
        // @todo
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
    //% pin.defl=neoPin.P0
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
        breath: util.BreathData = null
        draw: () => void = null

        constructor(pin: neoPin = neoPin.P0) {
            super(BoardID.zero, ClickID.Zero, pin, 64, NeoPixelMode.RGBW)
        }

        // ----------------------------------------------------------------
        // Mapping methods  ::neo:map
        // ----------------------------------------------------------------

        //% block="map $breathData=variables_get(breathData)|to fill $this(myNeopixel)|color: $colorMapId|brightness: $brightnessMapId"
        //% inlineInputMode=inline
        //% group="On start: Map"
        //% weight=190

        mapToFill(
            breathData: util.BreathData,
            colorMapId: util.ColorMaps,
            brightnessMapId: util.BrightnessMaps
        ): void {
            this.draw = () => {
                drawFill(
                    this,
                    util.getMap(colorMapId)(breathData),
                    util.getMap(brightnessMapId)(breathData)
                )
            }
        }

        //% block="map $breathData=variables_get(breathData)|to disk on $this(myNeopixel)|radius: $lengthMapId|color: $colorMapId|brightness: $brightnessMapId"
        //% inlineInputMode=inline
        //% group="On start: Map"
        //% weight=180

        mapToDisk(
            breathData: util.BreathData,
            lengthMapId: util.LengthMaps,
            colorMapId: util.ColorMaps,
            brightnessMapId: util.BrightnessMaps
        ): void {
            this.draw = () => {
                drawDisk(
                    this,
                    util.getMap(lengthMapId)(breathData),
                    util.getMap(colorMapId)(breathData),
                    util.getMap(brightnessMapId)(breathData)
                )
            }
        }

        //% block="map $breathData=variables_get(breathData)|to bar on $this(myNeopixel)|length: $lengthMapId|color: $colorMapId|brightness: $brightnessMapId"
        //% inlineInputMode=inline
        //% group="On start: Map"
        //% weight=170

        mapToBar(
            breathData: util.BreathData,
            lengthMapId: util.LengthMaps,
            colorMapId: util.ColorMaps,
            brightnessMapId: util.BrightnessMaps
        ): void {
            this.draw = () => {
                drawBar(
                    this,
                    util.getMap(lengthMapId)(breathData),
                    util.getMap(colorMapId)(breathData),
                    util.getMap(brightnessMapId)(breathData)
                )
            }
        }

        //% block="map $breathData=variables_get(breathData)|to double bars on $this(myNeopixel)|length 1: $lengthMapId1|color 1: $colorMapId1|length 2: $lengthMapId2|color 2: $colorMapId2|brightness: $brightnessMapId"
        // inlineInputMode=inline
        //% group="On start: Map"
        //% weight=160

        mapToDoubleBars(
            breathData: util.BreathData,
            lengthMapId1: util.LengthMaps,
            colorMapId1: util.ColorMaps,
            lengthMapId2: util.LengthMaps,
            colorMapId2: util.ColorMaps,
            brightnessMapId: util.BrightnessMaps
        ): void {
            this.draw = () => {
                drawDoubleBars(
                    this,
                    util.getMap(lengthMapId1)(breathData),
                    util.getMap(colorMapId1)(breathData),
                    util.getMap(lengthMapId2)(breathData),
                    util.getMap(colorMapId2)(breathData),
                    util.getMap(brightnessMapId)(breathData)
                )
            }
        }

        //% block="map $breathData=variables_get(breathData)|to spiral on $this(myNeopixel)|length: $lengthMapId|color: $colorMapId|brightness: $brightnessMapId"
        //% inlineInputMode=inline
        //% group="On start: Map"
        //% weight=150

        mapToSpiral(
            breathData: util.BreathData,
            lengthMapId: util.LengthMaps,
            colorMapId: util.ColorMaps,
            brightnessMapId: util.BrightnessMaps
        ): void {
            this.draw = () => {
                drawSpiral(
                    this,
                    util.getMap(lengthMapId)(breathData),
                    util.getMap(colorMapId)(breathData),
                    util.getMap(brightnessMapId)(breathData)
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

    //% block="draw fill on $myNeopixel=variables_get(myNeopixel)|color = $color|brightness = $brightness"
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
     * Draw a diagonal gradient on the Neopixel. Make sure to provide an initialized `Neopixel`.
     * @param myNeopixel The Neopixel to draw to.
     * @param color The color of the gradient (24 bit).
     * @param brightness The brightness of the matrix (0 to 100).
     */

    //% block="draw gradient on $myNeopixel=variables_get(myNeopixel)|color = $color|brightness = $brightness"
    //% color.shadow=neopixel_colors
    //% brightness.min=0 brightness.max=100 brightness.defl=10
    //% inlineInputMode=inline
    //% advanced=true
    //% weight=180

    export function drawGradient(
        myNeopixel: Neopixel,
        color: number,
        brightness: number
    ): void {
        util.assert(!!myNeopixel, util.errorMessage.neopixel)
        myNeopixel.setBrightness(util.iscale(brightness, 255))
        const param = rgbFadeColorInit(color)
        myNeopixel.clear()

        for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
                const r = (x + y) / 14
                const faded = rgbFadeColor(
                    param,
                    (100 * (r * r * r + 0.02)) / 1.02
                )
                myNeopixel.setPixelColor(x + 8 * y, faded)
            }
        }
        myNeopixel.show()
    }

    /**
     * Draw a disk on the Neopixel LED matrix. Make sure to provide an initialized `Neopixel`.
     * @param myNeopixel The Neopixel to draw to.
     * @param radius The radius of the disk (0 to 100).
     * @param color The color of the disk (24 bit).
     * @param brightness The brightness of the disk (0 to 100).
     */

    //% block="draw disk on $myNeopixel=variables_get(myNeopixel)|radius = $radius|color = $color|brightness = $brightness"
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

    //% block="draw bar on $myNeopixel=variables_get(myNeopixel)|length = $length|color = $color|brightness = $brightness"
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

    //% block="draw double bars on $myNeopixel=variables_get(myNeopixel)|length 1 = $length1|color 1 = $color1|length 2 = $length2|color 2 = $color2|brightness = $brightness"
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

    //% block="draw spiral on $myNeopixel=variables_get(myNeopixel)|length = $length|color = $color|brightness = $brightness"
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

    /**
     * Interface for temporary color parameters used to fade a color by luminosity.
     */
    interface RGBFadeParameters {
        red: number
        green: number
        blue: number
        luminosity: number
    }

    /**
     * Initial calculation to get the color parameters to fade a color by luminosity.
     * @param rgb A color defined by RGB components (0 to 0xFFFFFF).
     * @return Color parameters used to calculated faded shades by luminosity.
     */
    function rgbFadeColorInit(rgb: number): RGBFadeParameters {
        const r = (rgb >> 16) & 0xff
        const g = (rgb >> 8) & 0xff
        const b = (rgb >> 0) & 0xff
        const lum =
            (Math.max(Math.max(r, g), b) + Math.min(Math.min(r, g), b)) >> 1
        const minLum = Math.min(lum, 255 - lum)

        return {
            red: Math.idiv(lum - r, minLum),
            green: Math.idiv(lum - g, minLum),
            blue: Math.idiv(lum - b, minLum),
            luminosity: lum
        }
    }

    /**
     * Fade an RGB color by using a brightness parameter, consistent with a luminosity scaling.
     * @param param A set of parameters obtained from `rgbFadeColorInit(rgb)`.
     * @param brightness The brightness of the faded color (0 to 100).
     * @return The faded color defined by RGB components (0 to 0xFFFFFF).
     *
     * The function is necessary because the Neopixel library only
     * allows a brightness setting for the whole strip. Pixel by pixel
     * brightness has to be controlled through the RGB values. The
     * function is equivalent to: converting to HSL, scaling L,
     * converting back to RGB. But it does through a shortcut using
     * the initial RGB values.
     */
    function rgbFadeColor(
        param: RGBFadeParameters,
        brightness: number
    ): number {
        const lum = Math.idiv(param.luminosity * brightness, 100)
        const minLum = Math.min(lum, 255 - lum)
        const r = (lum - minLum * param.red) & 0xff
        const g = (lum - minLum * param.green) & 0xff
        const b = (lum - minLum * param.blue) & 0xff

        return (r << 16) | (g << 8) | b
    }
}

/****************************************************************
 * Breath sensor
 */

//% weight=200
//% color=#F7931E
//% icon="\uf08b" sign-out
// icon="\uf289" mixcloud
// icon="\uf21e" heartbeat

namespace bioW_Breath {
    // ::breath
    // The number of samples used to calculate the velocity
    const accuracy = 5
    // The sampling period used in the independent forever loop
    const samplingPeriod = 50

    /**
     * Create an object to manage a breath sensor connected to the micro:bit or the b.Board.
     * @param pin The pin to which the breath sensor is connected.
     * @return A new `BreathSensor` object.
     */

    //% block="new breath sensor on pin $pin"
    //% pin.defl=AnalogPin.P2
    //% blockSetVariable="breathData"
    //% group="On start: Create"
    //% weight=200

    export function createBreathSensor(pin: AnalogPin): BreathSensor {
        return new BreathSensor(pin)
    }

    /**
     * A class to manage the inputs from the breath sensor.
     * Creating a new instance starts a forever loop to poll the sensor,
     * store the value, and calculate the associated values.
     */
    export class BreathSensor {
        // ::breath:class
        position: number = 0
        velocity: number = 0
        frequency: number = 0

        targetPosition: number = 0
        targetVelocity: number = 0
        targetFrequency: number = 12

        index: number = 0 // for ring buffers
        positions: number[] // = [0,0,0,0,0] @todo when length finalized
        timestamps: number[] // = [0,0,0,0,0]

        // To avoid discontinuities in target breath on frequency changes
        timeAtFreqChange: number = 0
        phaseAtFreqChange: number = 0

        // To stream over radio
        stream: boolean = false

        // Constructor
        constructor(private pin: AnalogPin) {
            // Initialize arrays
            this.positions = []
            this.timestamps = []
            for (let i = 0; i < accuracy; i++) {
                this.positions.push(0)
                this.timestamps.push(0)
            }
            // Start sampling loop
            control.inBackground(() => {
                this.samplingLoop()
            })
        }

        // @todo Could also try `control.setInterval()` and compare.
        //
        // https://github.com/microsoft/pxt-common-packages/blob/f460cc8ac025fc93ac82cd9d5dcb61b47e3a2dfb/libs/base/scheduling.ts
        // control.setInterval(function() { }, 0, control.IntervalMode.Interval)
        //
        // control.setInterval(
        //     () => {
        //         this.samplingLoop()
        //     },
        //     period,
        //     control.IntervalMode.Interval
        // )

        /**
         * Change the target frequency and adjust the phase calculation.
         */
        changeFrequency(newFrequency: number = 12): void {
            if (newFrequency !== this.targetFrequency) {
                const time = input.runningTime()
                this.phaseAtFreqChange =
                    0.00425 *
                        this.targetFrequency *
                        (time - this.timeAtFreqChange) +
                    this.phaseAtFreqChange
                this.timeAtFreqChange = time
                this.targetFrequency = newFrequency
            }
        }

        /**
         * Read the sensor data on a separate forever loop
         * for more reliable sampling frequency and to avoid issues
         * such as multiple readings in the public forever loop.
         */
        samplingLoop() {
            // @todo Improve by only doing what is necessary based on mapping requests.
            while (true) {
                const time = input.runningTime()
                const index = this.index % accuracy

                // New position and time
                this.position = pins.analogReadPin(this.pin)
                this.timestamps[index] = time
                this.position = (100 / 1023) * this.position
                this.positions[index] = this.position

                // Velocity
                // @todo Just trying central finite difference with 5 values for now
                this.velocity =
                    (200 *
                        (this.positions[(index - 4) % accuracy] -
                            8 * this.positions[(index - 3) % accuracy] +
                            8 * this.positions[(index - 1) % accuracy] -
                            this.positions[index])) /
                        (12 * samplingPeriod) +
                    50

                // Target position and velocity
                // Keep track of frequency changes to avoid discontinuities
                const phase =
                    0.00425 *
                        this.targetFrequency *
                        (time - this.timeAtFreqChange) +
                    this.phaseAtFreqChange
                this.targetPosition = 0.393701 * (Math.isin(phase) - 1)
                this.targetVelocity = 0.393701 * (Math.isin(phase + 64) - 1)

                // Radio streaming
                // @todo Should we also send target data?
                if (this.stream) {
                    const buffer = pins.createBuffer(24)
                    buffer.setNumber(NumberFormat.Float32LE, 0, this.position)
                    buffer.setNumber(NumberFormat.Float32LE, 4, this.velocity)
                    buffer.setNumber(NumberFormat.Float32LE, 8, this.frequency)
                    buffer.setNumber(
                        NumberFormat.Float32LE,
                        12,
                        this.targetPosition
                    )
                    buffer.setNumber(
                        NumberFormat.Float32LE,
                        16,
                        this.targetVelocity
                    )
                    buffer.setNumber(
                        NumberFormat.Float32LE,
                        20,
                        this.targetFrequency
                    )
                    radio.sendBuffer(buffer)
                }

                // @debug
                // serial.writeValue("delta_time", this.timestamps[index] - this.timestamps[(index - 1) % accuracy])
                // serial.writeValue("position", this._position)
                // serial.writeValue("velocity", this._velocity)

                this.index++
                basic.pause(samplingPeriod) // @todo try to improve sampling accuracy
            }
        }
    }

    // ----------------------------------------------------------------
    // Getters  ::breath:get
    // ----------------------------------------------------------------

    /**
     * Get the breathing position from an object with a `BreathData` interface.
     * @param breathSource A source of breath data such as `BreathSensor` or `BreathOverRadio`.
     * @return The breathing position.
     */

    //% block="$breathData=variables_get(breathData) position"
    //% advanced=true
    //% weight=200

    export function position(breathData: util.BreathData = null): number {
        util.assert(!!breathData, util.errorMessage.breath)
        return breathData.position
    }

    /**
     * Get the breathing velocity from an object with a `BreathData` interface.
     * @param breathSource A source of breath data such as `BreathSensor` or `BreathOverRadio`.
     * @return The breathing velocity.
     */

    //% block="$breathData=variables_get(breathData) velocity"
    //% advanced=true
    //% weight=190

    export function velocity(breathData: util.BreathData = null): number {
        util.assert(!!breathData, util.errorMessage.breath)
        return breathData.velocity
    }

    /**
     * Get the breathing frequency from an object with a `BreathData` interface.
     * @param breathSource A source of breath data such as `BreathSensor` or `BreathOverRadio`.
     * @return The breathing frequency.
     */

    //% block="$breathData=variables_get(breathData) frequency"
    //% advanced=true
    //% weight=180

    export function frequency(breathData: util.BreathData = null): number {
        util.assert(!!breathData, util.errorMessage.breath)
        return breathData.frequency
    }

    /**
     * Get the target breathing position from an object with a `BreathData` interface.
     * @param breathSource A source of breath data such as `BreathSensor` or `BreathOverRadio`.
     * @return The breathing position.
     */

    //% block="$breathData=variables_get(breathData) target position"
    //% advanced=true
    //% weight=170

    export function targetPosition(breathData: util.BreathData = null): number {
        util.assert(!!breathData, util.errorMessage.breath)
        return breathData.targetPosition
    }

    /**
     * Get the target breathing velocity from an object with a `BreathData` interface.
     * @param breathSource A source of breath data such as `BreathSensor` or `BreathOverRadio`.
     * @return The breathing velocity.
     */

    //% block="$breathData=variables_get(breathData) target velocity"
    //% advanced=true
    //% weight=160

    export function targetVelocity(breathData: util.BreathData = null): number {
        util.assert(!!breathData, util.errorMessage.breath)
        return breathData.targetVelocity
    }

    /**
     * Get the breathing frequency from an object with a `BreathData` interface.
     * @param breathSource A source of breath data such as `BreathSensor` or `BreathOverRadio`.
     * @return The breathing frequency.
     */

    //% block="$breathData=variables_get(breathData) target frequency"
    //% advanced=true
    //% weight=150

    export function targetFrequency(
        breathData: util.BreathData = null
    ): number {
        util.assert(!!breathData, util.errorMessage.breath)
        return breathData.targetFrequency
    }

    // ----------------------------------------------------------------
    // Oscillator  ::breath:osc
    // ----------------------------------------------------------------

    /**
     * A sinusoidal oscillator to simulate breath for instance.
     * Changing the frequency creates a discontinuity.
     * @param frequency The frequency of the oscillator (cycles per minute).
     * @param shift The phase shift (0 to 360).
     * @return The oscillator value (0 to 100).
     */

    //% block="cycle $frequency times per min|with a $shift shift"
    //% frequency.min=2 frequency.max=30 frequency.defl=12
    //% shift.min=0 shift.max=360 shift.defl=0
    //% group="Utility"
    //% weight=200

    export function oscillator(frequency: number, shift: number): number {
        // Using regular Math.sin():
        // 50 * (Math.sin(Math.PI * frequency * input.runningTime() / 30000) + 1)
        // Using faster Math.isin() approximation ([0 - 255] to [1 - 128 - 255])
        // 100 / 254 * (Math.isin(255 * frequency * input.runningTime() / 60000) - 1)

        return (
            (100 / 254) *
            Math.isin(
                0.00425 * frequency * input.runningTime() -
                    1 +
                    (255 / 360) * shift
            )
        )
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
    export enum SpeedMaps {
        Off = 400,
        Velocity,
        Frequency,
        //% block="Target position"
        TargetPosition,
        //% block="Target velocity"
        TargetVelocity,
        //% block="Target Frequency Slow"
        TargetFrequencySlow,
        //% block="Target Frequency Fast"
        TargetFrequencyFast,
        //% block="Delta frequency"
        DeltaFrequency,
        //% block="Exhale Only"
        ExhaleOnly,
        //% block="Physical Simulation"
        PhysicalSimulation
    }

    /**
     * Get a map from breath data to motor speed.
     * @param speedMapId The id of the chosen speed mapping.
     * @return A `Map` of type `(BreathData) => number`.
     */
    export function getSpeedMap(speedMapId: SpeedMaps): util.Map {
        switch (speedMapId) {
            default:
                throw 'Unexpected speedMapId' // @debug
            case SpeedMaps.Off:
                return (breathData) => {
                    return 0
                }
            case SpeedMaps.Velocity:
                return (breathData) => {
                    return 0
                }
            case SpeedMaps.Frequency:
                return (breathData) => {
                    return 0
                }
            case SpeedMaps.TargetPosition:
                return (breathData) => {
                    return 0
                }
            case SpeedMaps.TargetVelocity:
                return (breathData) => {
                    return 0
                }
            case SpeedMaps.TargetFrequencySlow:
                return (breathData) => {
                    return 0
                }
            case SpeedMaps.TargetFrequencyFast:
                return (breathData) => {
                    return 0
                }
            case SpeedMaps.DeltaFrequency:
                return (breathData) => {
                    return 0
                }
            case SpeedMaps.ExhaleOnly:
                return (breathData) => {
                    return 0
                }
            case SpeedMaps.PhysicalSimulation:
                return (breathData) => {
                    return 0
                }
        }
    }

    /**
     * Enumeration of all possible mappings for the motor direction.
     */
    export enum DirectionMaps {
        Constant = 500,
        Velocity,
        //% block="Target velocity"
        TargetVelocity,
        //% block="Delta frequency"
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
                throw 'Unexpected directionMapId' // @debug
            case DirectionMaps.Constant:
                return (breathData) => {
                    return bBoard_Motor.motorDirection.forward
                }
            case DirectionMaps.Velocity:
                return (breathData) => {
                    return bBoard_Motor.motorDirection.forward
                }
            case DirectionMaps.TargetVelocity:
                return (breathData) => {
                    return bBoard_Motor.motorDirection.forward
                }
            case DirectionMaps.TargetFrequency:
                return (breathData) => {
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
    //% blockSetVariable="myMotor"
    //% group="On start: Create"
    //% weight=200

    export function createMotor(side: bBoard_Motor.motorDriver): Motor {
        return new Motor(side)
    }

    /**
     * A class to manage receiving values from a breath sensor connected to another micro:bit.
     */
    export class Motor extends bBoard_Motor.BBOARD_MOTOR {
        // ::motor:class
        breath: util.BreathData = null
        speedMap: util.Map = null
        directionMap: util.Map = null

        constructor(
            side: bBoard_Motor.motorDriver = bBoard_Motor.motorDriver.right
        ) {
            super(BoardID.zero, ClickID.Zero, side)
        }

        //% block="map $breathData=variables_get(breathData) to run $this(myMotor)|speed: $speedMapId|direction: $directionMapId"
        //% inlineInputMode=inline
        //% group="On start: Map"
        //% weight=200

        setMapping(
            breathData: util.BreathData,
            speedMapId: SpeedMaps,
            directionMapId: DirectionMaps
        ): void {
            this.breath = breathData
            this.speedMap = getSpeedMap(speedMapId)
            this.directionMap = getDirectionMap(directionMapId)
        }

        //% block="run mapping from breath to $this(myMotor)"
        //% inlineInputMode=inline
        //% group="Forever: Run"
        //% weight=200

        run(): void {
            this.motorDutyDirection(
                this.speedMap(this.breath),
                this.directionMap(this.breath)
            )
        }
    }
}

/****************************************************************
 * Radio communication
 */

//% weight=150
//% color=#F7931E
//% icon="\uf012" signal (same as generic Radio)

namespace bioW_Radio {
    // ::radio

    /**
     * Start streaming values over radio from a `BreathSensor` object. Make sure to have it initialized.
     * @param breathData A `BreathSensor` object to stream from.
     * @param group The group ID for radio communications.
     * @param power The output power of the radio sender.
     */

    //% block="send $breathData=variables_get(breathData)|to group $group|with power of $power"
    //% group.min=0 group.max=255 group.defl=0
    //% power.min=0 power.max=7 power.defl=6
    //% group="On start: Sender"
    //% weight=200

    export function startRadioStreaming(
        breathData: bioW_Breath.BreathSensor,
        group: number = 0,
        power: number = 7
    ): void {
        util.assert(!!breathData, util.errorMessage.breath)
        radio.setGroup(group)
        radio.setTransmitPower(power)
        breathData.stream = true
    }

    /**
     * Stop streaming values over radio from a `BreathSensor` object. Make sure to have it initialized.
     * @param breathData A `BreathSensor` object to stop streaming from.
     */

    //% block="$breathData=variables_get(breathData)|stop sending"
    //% advanced=true
    //% weight=190

    export function stopRadioStreaming(
        breathData: bioW_Breath.BreathSensor
    ): void {
        util.assert(!!breathData, util.errorMessage.breath)
        breathData.stream = false
    }

    /**
     * A class to manage receiving values from a breath sensor connected to another micro:bit.
     */
    export class BreathOverRadio {
        // ::radio:class
        position: number = 0
        velocity: number = 0
        frequency: number = 0

        targetPosition: number = 0
        targetVelocity: number = 0
        targetFrequency: number = 12

        constructor(group: number) {
            radio.setGroup(group & 0xff)
            radio.onReceivedBuffer((buffer) => {
                this.position = buffer.getNumber(NumberFormat.Float32LE, 0)
                this.velocity = buffer.getNumber(NumberFormat.Float32LE, 4)
                this.frequency = buffer.getNumber(NumberFormat.Float32LE, 8)
                this.targetPosition = buffer.getNumber(
                    NumberFormat.Float32LE,
                    12
                )
                this.targetVelocity = buffer.getNumber(
                    NumberFormat.Float32LE,
                    16
                )
                this.targetFrequency = buffer.getNumber(
                    NumberFormat.Float32LE,
                    20
                )
            })
        }
    }

    /**
     * Create an object to manage receiving values from a breath sensor connected to another micro:bit.
     * @param group The group ID for radio communications.
     * @return A new `BreathOverRadio` object.
     */

    //% block="new radio receiver on group $group"
    //% group.min=0 group.max=255 group.defl=0
    //% blockSetVariable="breathData"
    //% group="On start: Receiver"
    //% weight=200

    export function createBreathOverRadio(group: number = 0): BreathOverRadio {
        return new BreathOverRadio(group)
    }

    /**
     * Stop the receiver.
     * @param breathData The receiver object.
     */

    //% block="$breathData=variables_get(breathData) stop listening"
    //% advanced=true
    //% weight=170

    export function stopListening(breathData: BreathOverRadio = null): void {
        util.assert(!!breathData, util.errorMessage.radio)
        radio.onReceivedBuffer(() => {})
        // There does not seem to be a way to unregister event handlers.
        // See: https://makecode.microbit.org/reference/event-handler
    }

    /**
     * Change the group ID for radio communications.
     * @param breathData The receiver object.
     * @param group The new group ID.
     */

    //% block="$breathData=variables_get(breathData) change group to $group"
    //% group.min=0 group.max=255 group.defl=0
    //% advanced=true
    //% weight=160

    export function changeGroup(
        breathData: BreathOverRadio = null,
        group: number
    ): void {
        util.assert(!!breathData, util.errorMessage.radio)
        radio.setGroup(group & 0xff)
    }
}
