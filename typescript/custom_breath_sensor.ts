/****************************************************************
 * BioWearables library
 * --------------------
 * Custom blocks for the breath sensor
 *
 * Navigation:
 *  ::gain
 *  ::maps
 *  ::draw
 *  ::block:create
 *  ::properties
 *  ::block:map
 *  ::methods
 *  ::loop
 *  ::position
 *  ::velocity
 *  ::direction
 *  ::posrange
 *  ::velrange
 *  ::speed
 *  ::radio
 */

//% weight=200
//% color=#F7931E
//% icon="\uf08b" sign-out
// icon="\uf289" mixcloud
// icon="\uf21e" heartbeat

namespace bioW_Breath {
    const period = 100 // sampling period

    // ==== ::gain ====

    export enum GainIds {
        // block="1"
        G1,
        // block="2"
        G2,
        // block="3"
        G3
    }

    const gainValues = [3, 4, 5]
    const gainSymbols = ['1', '2', '3']

    // ==== ::maps ====

    export enum LengthMapIds {
        //% block="Depth"
        Position,
        //% block="Strength"
        Velocity,
        //% block="Speed"
        Speed,
        //% block="Target depth"
        TargetPosition
    }

    // ==== ::draw ====

    const low = 10

    // Uses a string to define an ordered pattern in the LED matrix
    // @unused
    function drawPattern(
        pattern: String,
        length: number,
        brightness: number
    ): void {
        basic.clearScreen()
        for (let i = 0; i < length; i++) {
            let n = pattern.charCodeAt(i) - 97
            led.plotBrightness(n % 5, Math.idiv(n, 5), brightness)
        }
    }

    // Draw a single bar
    function drawBar(x: number, length: number): void {
        length = (length * 5) >> 16
        length = 4 - length
        for (let i = 4; i > length; i--) {
            led.plotBrightness(x, i, low)
            led.plotBrightness(x + 1, i, low)
        }
        led.plotBrightness(x, length, 255)
        led.plotBrightness(x + 1, length, 255)
    }

    // ==== ::block:create ====

    /**
     * Create an object to manage a breath sensor connected to the micro:bit or the b.Board.
     * @return A new `BreathSensor` object.
     */

    // @deactivated
    // @param gain The gain level applied to amplify the signal from the sensor.

    //% block="new breath sensor"
    // block="new breath sensor with a boost level of $gain"
    //% gain.defl=GainIds.G1
    //% blockSetVariable="breath"
    //% group="On start: Create"
    //% weight=200

    export function createBreathSensor(): BreathSensor {
        // gain: GainIds = GainIds.G1,
        return new BreathSensor(AnalogPin.P2, GainIds.G1)
    }

    /**
     * A class to manage the inputs from the breath sensor.
     * Creating a new instance starts a forever loop to poll the sensor,
     * store the value, and calculate the associated values.
     */
    export class BreathSensor {
        // ==== ::properties ====

        // Input
        index: number = 0 // index of polling cycles
        t_offset: number = 0 // offset for reading time
        t_read: number = 0 // last reading time
        x_offset: number = 0 // offset for reading value
        x_read: number = 0 // last reading value

        // Circular buffers for signal processing
        x0 = [0, 0, 0, 0, 0] // interpolated
        x1 = [0, 0, 0, 0, 0] // low-pass Butterworth filter
        x2 = [0, 0, 0] // DC offset with high-pass filter
        a1 = [0, 0, 0] // position range
        a2 = [0, 0, 0] // low-pass Butterworth filter
        i1 = [0, 0, 0] // velocity range
        i2 = [0, 0, 0] // low-pass Butterworth filter
        d1 = [0, 0, 0] // zero-crossings
        d2 = [0, 0, 0] // low-pass Butterworth filter
        dx = 0

        // Features
        position = 0 // sigmoid scaled
        posAmpl = 0
        velocity = 0
        velAmpl = 0
        direction = 0x7fff // zero crossing
        speed = 0 // log scaled

        // Settings
        hp_alpha: number = 0.995
        gainId: number = 0
        mapId: number = 0

        // Position extrema
        x_min = 0
        x_min_prev = 0
        x_max = 0
        x_max_prev = 0

        // Velocity extrema
        dx_min = 0 // min over current cycle
        dx_min_prev = 0
        dx_max = 0 // max over current cycle
        dx_max_prev = 0

        // Zero crossing
        zx_up = [0, 0, 0] // circular buffer for crossings up
        zx_up_i = 0 // buffer index
        zx_down = [0, 0, 0] // circular buffer for crossings down
        zx_down_i = 0 // buffer index

        // Draw
        lengthMapId1: LengthMapIds
        lengthMapId2: LengthMapIds
        // pauseDrawUntil: number = 0 // pause drawing after button pressed

        // ==== ::block:map ====

        /**
         * Set the length mappings for the double bar display on the micro:bit.
         * @param lengthMapId1 The mapping for the length of the first bar.
         * @param lengthMapId2 The mapping for the length of the second bar.
         * @return A new `BreathSensor` object.
         */

        //% block="map $this(breath)|to draw double bars|length 1: $lengthMapId1|length 2: $lengthMapId2"
        //% lengthMapId1.defl=LengthMapIds.TargetPosition
        //% lengthMapId2.defl=LengthMapIds.Position
        //% group="On start: Map"
        //% inlineInputMode=external
        //% weight=190

        setLengthMaps(
            lengthMapId1: LengthMapIds,
            lengthMapId2: LengthMapIds
        ): void {
            this.lengthMapId1 = lengthMapId1
            this.lengthMapId2 = lengthMapId2
        }

        // ==== ::methods ====

        init(): void {
            this.t_offset = control.millis()
            this.reset()
            radio.setGroup(0)
            radio.setTransmitPower(6)
        }

        reset(): void {
            this.x_offset = Math.clamp(400, 700, pins.analogReadPin(this.pin))
            this.hp_alpha = 0.8 // initial value for adaptive DC offset
        }

        setGain(gainId: GainIds): void {
            this.reset()
            this.gainId = gainId
            // @deactivated
            // this.pauseDrawUntil = control.millis() + 1000
            // basic.showString(gainSymbols[id])
        }

        constructor(private pin: AnalogPin, gainId: GainIds) {
            this.init()
            this.setGain(gainId)
            this.setLengthMaps(
                LengthMapIds.TargetPosition,
                LengthMapIds.Position
            )

            // Start sampling loop
            control.inBackground(() => {
                this.samplingLoop()
            })
        }

        // ==== ::loop ====

        /**
         * Read the sensor data on a separate forever loop
         * for a more reliable sampling frequency.
         */
        samplingLoop() {
            while (true) {
                // Read analog input
                const t_new_read = control.millis() - this.t_offset
                let x_new_read = pins.analogReadPin(this.pin)
                x_new_read =
                    x_new_read === 1023 || x_new_read === 0
                        ? this.x_read // prevent false contact readings
                        : x_new_read - this.x_offset
                // serial.writeValue("x_new", x_new_read + this.x_offset)

                // Loop and interpolate through even time points
                let t = (this.index + 1) * period
                while (t <= t_new_read) {
                    this.index++

                    // Indexes for ring buffers of length 5
                    const i = this.index % 5
                    const i_1 = (i + 4) % 5
                    const i_2 = (i + 3) % 5
                    const i_3 = (i + 2) % 5
                    const i_4 = (i + 1) % 5

                    const j = this.index % 3
                    const j_1 = (j + 2) % 3
                    const j_2 = (j + 1) % 3

                    // ==== ::position ====

                    // Interpolate
                    this.x0[i] =
                        ((x_new_read - this.x_read) * (t - this.t_read)) /
                            (t_new_read - this.t_read) +
                        this.x_read
                    // serial.writeValue("x0", this.x0[i])

                    // Low-pass filter
                    // Butterworth: 3rd order, wc = 0.3
                    this.x1[i] =
                        4.95329964e-2 *
                            (this.x0[i] +
                                3 * (this.x0[i_1] + this.x0[i_2]) +
                                this.x0[i_3]) +
                        1.16191748 * this.x1[i_1] -
                        6.95942756e-1 * this.x1[i_2] +
                        1.37761301e-1 * this.x1[i_3]
                    // serial.writeValue("x1", this.x1[i])

                    // DC offset
                    // Adaptive high-pass: alpha ramps from 0.8 to 0.995
                    this.x2[j] =
                        this.x1[i] - this.x1[i_1] + this.hp_alpha * this.x2[j_1]
                    this.hp_alpha = 0.8 * this.hp_alpha + 0.2 * 0.995
                    // serial.writeValue("x2", this.x2[j])

                    // Scale the position
                    let s = gainValues[this.gainId] * (this.x2[j] - 5)
                    this.position =
                        Math.clamp(0, 0xffff, s * 0x01ff + 0x7fff) >> 0
                    // serial.writeValue('position', this.position)

                    // ==== ::velocity ====

                    // Derivate
                    // Backward finite difference: Accuracy = 4
                    this.dx =
                        ((25 / 12) * this.x1[i] -
                            4 * this.x1[i_1] +
                            3 * this.x1[i_2] -
                            (4 / 3) * this.x1[i_3] +
                            (1 / 4) * this.x1[i_4]) *
                        (1000 / period)
                    // serial.writeValue('dx', this.dx)

                    s = 0.02 * this.dx
                    this.velocity =
                        (0x7fff * (s / Math.sqrt(1 + s ** 2) + 1)) >> 0
                    // serial.writeValue('velocity', this.velocity)

                    // ==== ::direction ====

                    // Zero crossings
                    // And filter cycles that are too short or too shallow
                    this.x_min = Math.min(this.x1[i], this.x_min)
                    this.x_max = Math.max(this.x1[i], this.x_max)
                    this.dx_min = Math.min(this.dx, this.dx_min)
                    this.dx_max = Math.max(this.dx, this.dx_max)
                    if (this.direction !== 0xffff && this.dx > 4) {
                        // Upward
                        this.direction = 0xffff
                        // Log if long enough or preceded by deep dip
                        if (
                            this.index - this.zx_down[this.zx_down_i] > 5 ||
                            this.dx_min < -8
                        ) {
                            // Store and reset position extrema
                            this.x_max = this.x_min
                            this.x_min_prev = this.x_min
                            // Store and reset velocity extrema
                            this.dx_max = this.dx
                            this.dx_min_prev = this.dx_max
                            this.dx_max_prev = this.dx_max
                            // Push index of crossing up
                            this.zx_up_i = (this.zx_up_i + 1) % 3
                            this.zx_up[this.zx_up_i] = this.index
                        } else {
                            // Otherwise discard previous crossing down
                            this.zx_down_i = (this.zx_down_i + 2) % 3
                        }
                    } else if (this.direction !== 0 && this.dx < -5) {
                        // Downward
                        this.direction = 0
                        if (
                            this.index - this.zx_up[this.zx_up_i] > 5 ||
                            this.dx_max > 8
                        ) {
                            this.x_min = this.x_max
                            this.x_max_prev = this.x_max
                            this.dx_min = this.dx
                            this.dx_min_prev = this.dx_min
                            this.dx_max_prev = this.dx_min
                            this.zx_down_i = (this.zx_down_i + 1) % 3
                            this.zx_down[this.zx_down_i] = this.index
                        } else {
                            this.zx_up_i = (this.zx_up_i + 2) % 3
                        }
                    }
                    // serial.writeValue('direction', this.direction)

                    // ==== ::posrange ====

                    this.a1[j] =
                        Math.max(this.x_max, this.x_max_prev) -
                        Math.min(this.x_min, this.x_min_prev)
                    // serial.writeValue('a1', this.a1[j])

                    // Low-pass filter
                    // Butterworth: 2nd order, wc = 0.03
                    this.a2[j] =
                        2.08056714e-3 *
                            (this.a1[j] + 2 * this.a1[j_1] + this.a1[j_2]) +
                        1.86689228 * this.a2[j_1] -
                        8.75214548e-1 * this.a2[j_2]
                    // serial.writeValue('a2', this.a2[j])

                    // Log scale
                    this.posAmpl =
                        ((0xffff / Math.log(10 / 60)) *
                            (Math.log(10) -
                                Math.log(Math.clamp(10, 60, this.a2[j])))) >>
                        0
                    // serial.writeValue('posampl', this.posAmpl)

                    // ==== ::velrange ====

                    this.i1[j] =
                        Math.max(this.dx_max, this.dx_max_prev) -
                        Math.min(this.dx_min, this.dx_min_prev)
                    // serial.writeValue('i1', this.i1[j])

                    // Low-pass filter
                    // Butterworth: 2nd order, wc = 0.03
                    this.i2[j] =
                        2.08056714e-3 *
                            (this.i1[j] + 2 * this.i1[j_1] + this.i1[j_2]) +
                        1.86689228 * this.i2[j_1] -
                        8.75214548e-1 * this.i2[j_2]
                    // serial.writeValue('i2', this.i2[j])

                    // @todo decay previous extrema
                    // Log scale
                    this.velAmpl =
                        ((0xffff / Math.log(15 / 260)) *
                            (Math.log(15) -
                                Math.log(Math.clamp(15, 260, this.i2[j])))) >>
                        0
                    // serial.writeValue('velampl', this.velAmpl)

                    // ==== ::speed ====

                    // Duration
                    this.d1[j] =
                        0.05 *
                        (Math.max(
                            this.zx_up[this.zx_up_i] -
                                this.zx_up[(this.zx_up_i + 2) % 3],
                            this.index - this.zx_up[this.zx_up_i]
                        ) +
                            Math.max(
                                this.zx_down[this.zx_down_i] -
                                    this.zx_down[(this.zx_down_i + 2) % 3],
                                this.index - this.zx_down[this.zx_down_i]
                            ))
                    // serial.writeValue('d1', this.d1[j])

                    // Low-pass filter
                    // Butterworth: 2nd order, wc = 0.03
                    this.d2[j] =
                        2.08056714e-3 *
                            (this.d1[j] + 2 * this.d1[j_1] + this.d1[j_2]) +
                        1.86689228 * this.d2[j_1] -
                        8.75214548e-1 * this.d2[j_2]
                    // serial.writeValue('d2', this.d2[j])

                    // Log scale
                    this.speed =
                        (0xffff -
                            (0xffff / Math.log(20)) *
                                Math.log(Math.clamp(1, 20, this.d2[j]))) >>
                        0
                    // serial.writeValue('speed', this.speed)

                    // ==== ::radio ====

                    // Send over radio
                    const buffer = pins.createBuffer(12)
                    buffer.setNumber(NumberFormat.UInt16LE, 0, this.position)
                    buffer.setNumber(NumberFormat.UInt16LE, 2, this.posAmpl)
                    buffer.setNumber(NumberFormat.UInt16LE, 4, this.velocity)
                    buffer.setNumber(NumberFormat.UInt16LE, 6, this.velAmpl)
                    buffer.setNumber(NumberFormat.UInt16LE, 8, this.direction)
                    buffer.setNumber(NumberFormat.UInt16LE, 10, this.speed)
                    radio.sendBuffer(buffer)

                    t += period
                }

                // Update the time and value of the latest reading
                this.t_read = t_new_read
                this.x_read = x_new_read

                // Draw on micro:bit
                const targetPosition =
                    ((Math.cos((Math.PI / 3750) * this.t_read) + 1) * 0xffff) >>
                    1
                const features = [
                    this.position,
                    this.velocity,
                    this.speed,
                    targetPosition
                ]
                basic.clearScreen()
                drawBar(0, features[this.lengthMapId1])
                drawBar(3, features[this.lengthMapId2])

                // Pause for remaining time
                basic.pause(t - control.millis() + this.t_offset)
            }
        }
    }
}
