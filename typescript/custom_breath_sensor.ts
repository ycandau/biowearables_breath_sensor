/****************************************************************
 * Custom blocks for the BioWearables workshop
 * Breath sensor
 */

//% weight=200
//% color=#F7931E
//% icon="\uf08b" sign-out
// icon="\uf289" mixcloud
// icon="\uf21e" heartbeat

namespace bioW_Breath {
    export enum GainLevel {
        //% block="3"
        G3 = 3,
        //% block="1"
        G1 = 1,
        //% block="2"
        G2 = 2,
        //% block="4"
        G4 = 4,
        //% block="5"
        G5 = 5
    }

    /**
     * Create an object to manage a breath sensor connected to the micro:bit or the b.Board.
     * @param pin The pin to which the breath sensor is connected.
     * @param gain The gain applied to amplify the signal from the sensor.
     * @return A new `BreathSensor` object.
     */

    //% block="new breath sensor on pin %pin|with a gain of %gain"
    //% pin.defl=AnalogPin.P2
    //% gain.defl=GainLevel.G2
    //% blockSetVariable="breath"
    //% group="On start: Create"
    //% weight=200

    export function createBreathSensor(
        pin: AnalogPin = AnalogPin.P2,
        gain: GainLevel = GainLevel.G3
    ): BreathSensor {
        return new BreathSensor(pin, gain)
    }

    /**
     * A class to manage the inputs from the breath sensor.
     * Creating a new instance starts a forever loop to poll the sensor,
     * store the value, and calculate the associated values.
     */
    export class BreathSensor {
        // Input
        period: number = 100 // sampling period
        index: number = 0 // index of polling cycles
        t_offset: number = 0 // offset for reading time
        t_read: number = 0 // last reading time
        x_offset: number = 0 // offset for reading value
        x_read: number = 0 // last reading value

        // Circular buffers for signal processing
        x0 = [0, 0, 0, 0, 0] // interpolated
        x1 = [0, 0, 0, 0, 0] // low-pass Butterworth filter
        x2 = [0, 0, 0, 0, 0] // DC offset with high-pass filter
        d1 = [0, 0, 0, 0, 0] // zero-crossings
        d2 = [0, 0, 0, 0, 0] // low-pass Butterworth filter

        // Features extracted
        position = 0 // sigmoid scaled
        dx = 0
        velocity = 0
        speed = 0 // log scaled

        // Scaling
        hp_alpha: number = 0.995
        gain: number = 3

        // Zero crossing
        dx_min = 0 // min over current cycle
        dx_max = 0 // max over current cycle
        dx_sign = 0 // velocity sign
        zx_up = [0, 0, 0] // circular buffer for crossings up
        zx_up_i = 0 // buffer index
        zx_down = [0, 0, 0] // circular buffer for crossings down
        zx_down_i = 0 // buffer index

        // Radio
        stream: boolean = false

        // Draw
        map: Map = positionMap
        pauseDrawUntil: number = 0 // pause drawing after button pressed

        init() {
            this.x_offset = Math.clamp(400, 700, pins.analogReadPin(this.pin))
            this.hp_alpha = 0.8 // transient parameter value for DC offset
        }

        changeGain(gain: number = 3, delta: number = 0) {
            this.gain = Math.clamp(1, 5, gain + delta)
            this.pauseDrawUntil = control.millis() + 1000
            basic.showNumber(this.gain)
        }

        // Constructor
        constructor(private pin: AnalogPin, gain: number) {
            this.t_offset = control.millis()
            this.init()
            this.changeGain(gain, 0)

            input.onButtonPressed(Button.B, function () {
                this.init()
                this.changeGain(this.gain, 1)
            })

            input.onButtonPressed(Button.A, function () {
                this.init()
                this.changeGain(this.gain, -1)
            })

            // Start sampling loop
            control.inBackground(() => {
                this.samplingLoop()
            })
        }

        /**
         * Read the sensor data on a separate forever loop
         * for more reliable sampling frequency and to avoid issues
         * such as multiple readings in the public forever loop.
         */
        samplingLoop() {
            while (true) {
                // Read analog input
                const t_new_read = control.millis() - this.t_offset
                const x_new_read = pins.analogReadPin(this.pin) - this.x_offset
                // serial.writeValue("x_new", x_new_read)

                let t = (this.index + 1) * this.period
                while (t <= t_new_read) {
                    this.index++
                    const i = this.index % 5
                    const i_1 = (i + 4) % 5
                    const i_2 = (i + 3) % 5
                    const i_3 = (i + 2) % 5
                    const i_4 = (i + 1) % 5

                    // ==== Position ====

                    // Interpolate
                    this.x0[i] =
                        ((x_new_read - this.x_read) * (t - this.t_read)) /
                            (t_new_read - this.t_read) +
                        this.x_read
                    // serial.writeValue("x0", this.x0[i])

                    // Low-pass filter
                    // Butterworth: 3rd order, wc = 0.3
                    const low_pass_num = [
                        4.95329964e-2,
                        1.48598989e-1,
                        1.48598989e-1,
                        4.95329964e-2
                    ]
                    const low_pass_den = [
                        -1.16191748,
                        6.95942756e-1,
                        -1.37761301e-1
                    ]
                    this.x1[i] =
                        this.x0[i] * low_pass_num[0] +
                        this.x0[i_1] * low_pass_num[1] +
                        this.x0[i_2] * low_pass_num[2] +
                        this.x0[i_3] * low_pass_num[3] -
                        this.x1[i_1] * low_pass_den[0] -
                        this.x1[i_2] * low_pass_den[1] -
                        this.x1[i_3] * low_pass_den[2]
                    // serial.writeValue("x1", this.x1[i])

                    // DC offset
                    // Adaptive high-pass: alpha ramps from 0.8 to 0.995
                    this.x2[i] =
                        this.x1[i] - this.x1[i_1] + this.hp_alpha * this.x2[i_1]
                    this.hp_alpha = 0.8 * this.hp_alpha + 0.2 * 0.995
                    // serial.writeValue("x2", this.gain * this.x2[i])

                    // Scale the position
                    let s = this.gain * (this.x2[i] - 7)
                    if (s < -45) {
                        s = (s + 45) / 5
                        this.position = (5 * s) / (1 - s) + 5
                    } else if (s > 45) {
                        s = (s - 45) / 5
                        this.position = (5 * s) / (1 + s) + 95
                    } else {
                        this.position = s + 50
                    }
                    serial.writeValue('position', this.position)

                    // ==== Velocity ====

                    // Derivate
                    // Backward finite difference: Accuracy = 4
                    this.dx =
                        (((25 / 12) * this.x1[i] -
                            4 * this.x1[i_1] +
                            3 * this.x1[i_2] -
                            (4 / 3) * this.x1[i_3] +
                            (1 / 4) * this.x1[i_4]) *
                            1000) /
                        this.period
                    // serial.writeValue('dx', this.dx)

                    s = this.dx / 50
                    this.velocity = (50 * s) / Math.sqrt(1 + s * s) + 50
                    serial.writeValue('velocity', this.velocity)

                    // ==== Speed ====

                    // Zero crossings
                    // And filter cycles that are too short or too shallow
                    this.dx_min = Math.min(this.dx, this.dx_min)
                    this.dx_max = Math.max(this.dx, this.dx_max)
                    if (this.dx_sign !== 1 && this.dx > 3) {
                        // Upward
                        this.dx_sign = 1
                        // Log if long enough or preceded by deep dip
                        if (
                            this.index - this.zx_down[this.zx_down_i] > 5 ||
                            this.dx_min < -8
                        ) {
                            this.zx_up_i = (this.zx_up_i + 1) % 3
                            this.zx_up[this.zx_up_i] = this.index
                            this.dx_max = this.dx
                            // Otherwise discard previous crossing down
                        } else {
                            this.zx_down_i = (this.zx_down_i + 2) % 3
                        }
                    } else if (this.dx_sign !== -1 && this.dx < -3) {
                        // Downward
                        this.dx_sign = -1
                        if (
                            this.index - this.zx_up[this.zx_up_i] > 5 ||
                            this.dx_max > 8
                        ) {
                            this.zx_down_i = (this.zx_down_i + 1) % 3
                            this.zx_down[this.zx_down_i] = this.index
                            this.dx_min = this.dx
                        } else {
                            this.zx_up_i = (this.zx_up_i + 2) % 3
                        }
                    }
                    serial.writeValue('zx', this.dx_sign)

                    // Duration
                    this.d1[i] =
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
                    // serial.writeValue('d1', this.d1[i])

                    // Low-pass filter
                    // Butterworth: 2nd order, wc = 0.03
                    this.d2[i] =
                        2.08056714e-3 * this.d1[i] +
                        4.16113427e-3 * this.d1[i_1] +
                        2.08056714e-3 * this.d1[i_2] +
                        1.86689228 * this.d2[i_1] -
                        8.75214548e-1 * this.d2[i_2]
                    // serial.writeValue('d2', this.d2[i])

                    // Scale
                    this.speed =
                        (100 / Math.log(25)) *
                        Math.log(25 / Math.clamp(1, 25, this.d2[i]))
                    // (100 / Math.log(25)) * Math.log(Math.clamp(1, 25, this.d2[i]))
                    serial.writeValue('speed', this.speed)

                    // Send over radio
                    if (this.stream) {
                        const buffer = pins.createBuffer(12)
                        buffer.setNumber(
                            NumberFormat.Float32LE,
                            0,
                            this.position
                        )
                        buffer.setNumber(NumberFormat.Float32LE, 4, this.dx)
                        buffer.setNumber(NumberFormat.Float32LE, 8, this.speed)
                        radio.sendBuffer(buffer)
                    }
                    t += this.period
                }

                // Draw on micro:bit
                if (control.millis() > this.pauseDrawUntil) {
                    drawSpiral(this.map(this))
                }

                // Update the time and value of the latest reading
                this.t_read = t_new_read
                this.x_read = x_new_read
                basic.pause(t - control.millis() + this.t_offset)
            }
        }
    }

    type Map = (breath: BreathSensor) => number

    const positionMap: Map = (breath: BreathSensor) => breath.position
    const velocityMap: Map = (breath: BreathSensor) => breath.velocity
    const speedMap: Map = (breath: BreathSensor) => breath.speed

    /**
     * Enumeration of all possible mappings for the drawing length.
     */
    export enum LengthMaps {
        //% block="Depth"
        Position,
        //% block="Strength"
        Velocity,
        //% block="Speed"
        Speed
    }

    /**
     * Set the mapping applied to the length of the spiral.
     * @param length The length of the spiral (0 to 100).
     * @param brightness The brightness of the spiral (0 to 100).
     */

    //% block="map the $breath=variables_get(breath)|$mapId to draw a spiral"
    //% inlineInputMode=inline
    //% group="On start: Map"
    //% weight=180

    export function mapToSpiral(breath: BreathSensor, mapId: LengthMaps): void {
        switch (mapId) {
            default:
            case LengthMaps.Position:
                breath.map = positionMap
                break
            case LengthMaps.Velocity:
                breath.map = velocityMap
                break
            case LengthMaps.Speed:
                breath.map = speedMap
                break
        }
    }

    /**
     * Start streaming values over radio from a `BreathSensor` object.
     * @param breath A `BreathSensor` object to stream from.
     * @param group The group ID for radio communications.
     * @param power The output power of the radio sender.
     */

    //% block="send the $breath=variables_get(breath) data|on channel $group|with a power of $power"
    //% group.min=0 group.max=255 group.defl=0
    //% power.min=0 power.max=7 power.defl=6
    //% group="On start: Send"
    //% weight=200

    export function startRadioStreaming(
        breath: bioW_Breath.BreathSensor,
        group: number = 0,
        power: number = 7
    ): void {
        radio.setGroup(group)
        radio.setTransmitPower(power)
        breath.stream = true
    }

    /**
     * Draw a spiral on the Microbit LED matrix.
     * @param length The length of the spiral (0 to 100).
     * @param brightness The brightness of the spiral (0 to 100).
     */

    // block="draw spiral: length = $length|brightness = $brightness"
    //% length.min=0 length.max=100 length.defl=25
    //% brightness.min=0 brightness.max=100 brightness.defl=10
    //% inlineInputMode=inline
    //% group="Forever: Draw"
    //% weight=1850

    export function drawSpiral(length: number): void {
        let n = 12 // (2, 2)
        const dn = [1, -5, -1, 5] // right, up, left, down
        // Clockwise is [1, 5, -1, -5] // right, down, left, up

        length = Math.clamp(1, 25, Math.idiv(length, 4) + 1)
        led.setBrightness(50)

        // Unplot LEDs manually because basic.clearScreen() creates flickering
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
}
