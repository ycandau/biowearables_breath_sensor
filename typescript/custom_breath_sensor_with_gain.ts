/****************************************************************
 * BioWearables library
 * --------------------
 * Custom blocks for the breath sensor
 *
 * Navigation:
 *  ::draw
 *  ::create
 *  ::properties
 *  ::methods
 *  ::loop
 *  ::position
 *  ::velocity
 *  ::direction
 *  ::speed
 *  ::radio
 */

//% weight=200
//% color=#F7931E
//% icon='\uf08b' sign-out

namespace bioW_Breath {
    const period = 100 // sampling period

    // ==== ::draw ====

    // Draw a single bar
    function drawBar(x: number, length: number): void {
        length = (length * 5) >> 16
        length = 4 - length
        for (let i = 4; i > length; i--) {
            led.plotBrightness(x, i, 10)
            led.plotBrightness(x + 1, i, 10)
        }
        led.plotBrightness(x, length, 255)
        led.plotBrightness(x + 1, length, 255)
    }

    // ==== ::create ====

    /**
     * Create an object to manage a breath sensor connected to the micro:bit or the b.Board.
     * @return A new `BreathSensor` object.
     */

    //% block='new breath sensor'
    //% blockSetVariable='breath'
    //% group='On start: Create'
    //% weight=200

    export function createBreathSensor(): BreathSensor {
        return new BreathSensor()
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
        d1 = [0, 0, 0] // zero-crossings
        d2 = [0, 0, 0] // low-pass Butterworth filter
        dx = 0

        // Features
        position = 0 // sigmoid scaled
        velocity = 0
        direction = 0x7fff // zero crossing
        speed = 0 // log scaled

        // Settings
        hp_alpha: number = 0.8 // initial value for adaptive DC offset
        mapId: number = 0

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

        // Temp
        gain: number = 10
        offset: number = 0

        //% block="set $this(breath) gain $gain and offset $offset"
        //% gain.min=1 gain.max=100 gain.defl=10
        //% offset.min=-50 offset.max=50 offset.defl=0
        //% weight=190

        setGain(gain: number, offset: number): void {
            this.gain = gain
            this.offset = offset
        }

        // ==== ::methods ====

        constructor() {
            this.t_offset = control.millis()
            this.x_offset = Math.clamp(
                450,
                750,
                pins.analogReadPin(AnalogPin.P2)
            )
            this.x_read = this.x_offset
            radio.setGroup(0)
            radio.setTransmitPower(6)

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
                let x_new_read = pins.analogReadPin(AnalogPin.P2)
                // serial.writeValue('dt', t_new_read - this.t_read)

                x_new_read =
                    x_new_read < 450 || x_new_read > 750
                        ? this.x_read // prevent false contact readings
                        : x_new_read - this.x_offset
                // serial.writeValue('x_new', x_new_read)

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
                    // serial.writeValue('x0', this.x0[i])

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
                    // serial.writeValue('x1', this.x1[i])

                    // DC offset
                    // Adaptive high-pass: alpha ramps from 0.8 to 0.995
                    this.x2[j] =
                        this.x1[i] - this.x1[i_1] + this.hp_alpha * this.x2[j_1]
                    this.hp_alpha = 0.8 * this.hp_alpha + 0.2 * 0.995
                    // serial.writeValue('x2', this.x2[j])

                    // Scale the position
                    this.position =
                        Math.clamp(
                            0,
                            0xffff,
                            this.x2[j] * 70 * this.gain +
                                0x7fff -
                                7000 +
                                this.offset * 1000
                        ) >> 0
                    // serial.writeValue('pos', this.position)

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

                    let s = 0.008 * this.dx
                    this.velocity =
                        (0x7fff * (s / Math.sqrt(1 + s ** 2) + 1)) >> 0
                    // serial.writeValue('vel', this.velocity)

                    // ==== ::direction ====

                    // Zero crossings
                    // And filter cycles that are too short or too shallow
                    this.dx_min = Math.min(this.dx, this.dx_min)
                    this.dx_max = Math.max(this.dx, this.dx_max)
                    if (this.direction !== 0xffff && this.dx > 10) {
                        // Upward
                        this.direction = 0xffff
                        // Log if long enough or preceded by deep dip
                        if (
                            this.index - this.zx_down[this.zx_down_i] > 5 ||
                            this.dx_min < -8
                        ) {
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
                    } else if (this.direction !== 0 && this.dx < -15) {
                        // Downward
                        this.direction = 0
                        if (
                            this.index - this.zx_up[this.zx_up_i] > 5 ||
                            this.dx_max > 8
                        ) {
                            this.dx_min = this.dx
                            this.dx_min_prev = this.dx_min
                            this.dx_max_prev = this.dx_min
                            this.zx_down_i = (this.zx_down_i + 1) % 3
                            this.zx_down[this.zx_down_i] = this.index
                        } else {
                            this.zx_up_i = (this.zx_up_i + 2) % 3
                        }
                    }
                    // serial.writeValue('dir', this.direction)

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
                    const buffer = pins.createBuffer(8)
                    buffer.setNumber(NumberFormat.UInt16LE, 0, this.position)
                    buffer.setNumber(NumberFormat.UInt16LE, 2, this.velocity)
                    buffer.setNumber(NumberFormat.UInt16LE, 4, this.direction)
                    buffer.setNumber(NumberFormat.UInt16LE, 6, this.speed)
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

                basic.clearScreen()
                drawBar(0, targetPosition)
                drawBar(3, this.position)

                // Pause for remaining time
                basic.pause(t - control.millis() + this.t_offset)
            }
        }
    }
}
