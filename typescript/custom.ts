/**
 * Custom blocks for the BioWearable workshop.
 */

/****************************************************************
 * Utilities
 */

type Color = number

namespace util {
  /**
   * To start or stop a process.
   * Examples: For radio streaming or listening.
   */
  export enum StartStop {
    //% block="Start"
    Start,
    //% block="Stop"
    Stop
  }

  /**
   * To indicate the direction of a rotation.
   * Examples: Drawing a spiral, activating a motor.
   */
  export enum RotationDir {
    //% block="Clockwise"
    Clockwise = 1,
    //% block="Counter-clockwise"
    CounterClockwise = -1
  }

  /**
   * An interface used for classes that provide breath data,
   * such as from `BreathSensor` or `BreathOverRadio` instances.
   */
  export interface BreathData {
    position: number
    velocity: number
    frequency: number
    targetPosition: number
    targetVelocity: number
    targetFrequency: number
  }

  /**
   * Scale an input ranging from 0 to 100 to an integer value from 0 to max.
   * @param x The input value to scale (0 to 100).
   * @param max The maximum integer value to scale to.
   * @return The scaled value rounded to an integer.
   */
  export function iscale(x: number, max: number): number {
    return Math.clamp(0, 100, Math.idiv(x * (max + 1), 100))
  }

  /**
   * The error messages used to report issues.
   */
  export const errorMessage: { [key: string]: string } = {
    neopixel: 'You need to create a Neopixel.',
    breath: 'You need to create a breath sensor.',
    motor: 'You need to create a motor.',
    radio: 'You need to create a radio listener providing breath data.',
    mapping: 'You need to create a mapping set.'
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
// groups=["Display"]

//microbit
namespace bioW_Microbit {
  /**
   * Draw the full LED matrix on the Microbit.
   * @param brightness The brightness of the matrix (0 to 100).
   */

  //% block="draw full matrix: brightness = $brightness"
  //% brightness.min=0 brightness.max=100 brightness.defl=10
  //% inlineInputMode=inline
  //% group="Display"
  //% weight=200

  export function drawFullMatrix(brightness: number = 10): void {
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
  //% expandableArgumentMode="enabled"
  //% inlineInputMode=inline
  //% group="Display"
  //% weight=190

  export function drawDiskMicrobit(
    radius: number,
    brightness: number = 10
  ): void {
    // Could redo using symmetry
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
  //% expandableArgumentMode="enabled"
  //% inlineInputMode=inline
  //% group="Display"
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
  //% expandableArgumentMode="toggle"
  // inlineInputMode=inline
  //% group="Display"
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
   * @param direction The direction of the spiral.
   */

  //% block="draw spiral: length = $length|brightness = $brightness|direction = $direction"
  //% length.min=0 length.max=100 length.defl=25
  //% brightness.min=0 brightness.max=100 brightness.defl=10
  //% expandableArgumentMode="enabled"
  //% inlineInputMode=inline
  //% group="Display"
  //% weight=180

  export function drawSpiral(
    length: number,
    brightness: number = 10,
    direction: util.RotationDir = util.RotationDir.Clockwise
  ): void {
    let n = 12 // (2, 2)
    const dn =
      direction === util.RotationDir.Clockwise
        ? [1, 5, -1, -5] // right, down, left, up
        : [1, -5, -1, 5] // right, up, left, down

    length = util.iscale(length, 25)
    led.setBrightness(util.iscale(brightness, 255))

    // Unplot LEDs manually because basic.clearScreen() creates a lot flickering
    for (let segmentIndex = 0, count = 0; segmentIndex < 9; segmentIndex++) {
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
  // group="Microbit"

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
// groups=["Start block", "Display"]
// @problem The space in the group name causes an issue.
// But it works by removing the line (// vs //%).

//neopixel
namespace bioW_Neopixel {
  /**
   * Create an object to manage a Neopixel LED matrix.
   * @param pin The pin on the b.Board to which the Neopixel is connected.
   * @return A new Neopixel strip object.
   */

  //% block="new Neopixel on $pin"
  //% pin.defl=neoPin.P0
  //% blockSetVariable=myNeopixel
  //% group="Start block"
  //% weight=200

  export function createNeopixel(pin: neoPin): neopixel.Strip {
    return neopixel.createStrip(
      BoardID.zero,
      ClickID.Zero,
      pin,
      64,
      NeoPixelMode.RGBW
    )
  }

  /**
   * Calculate the absolute distance between two values.
   * @param value1 The first value.
   * @param value2 The second value.
   * @return abs(value1 - value2)
   */

  //% block="distance from $value1 to $value2"
  //% value1.min=-100 value1.max=100 value1.defl=25
  //% value2.min=-100 value2.max=100 value2.defl=75
  //% group="Color mappings"
  //% weight=200

  export function distance(value1: number, value2: number): number {
    return Math.abs(value1 - value2)
  }

  /**
   * Map a value to three colors based on whether it is below, between or above two thresholds.
   * @param value The value to map.
   * @param low The low threshold.
   * @param high The high threshold.
   * @param below The color when the value is below the thresholds.
   * @param between The color when the value is between the thresholds.
   * @param above The color when the value is above the thresholds.
   * @return One of the three possible colors.
   */

  //% block="one color out of three based on|where $value is in relation to $low and $high|below: $below|between: $between|or above: $above|"
  //% value.min=-100 value.max=100 value.defl=30
  //% low.min=-100 low.max=100 low.defl=20
  //% high.min=-100 high.max=100 high.defl=40
  //% below.shadow=neopixel_colors below.defl=NeoPixelColors.Green
  //% between.shadow=neopixel_colors between.defl=NeoPixelColors.Blue
  //% above.shadow=neopixel_colors above.defl=NeoPixelColors.Red
  //% group="Color mappings"
  //% weight=190

  export function colorFromBelowBetweenAbove(
    value: number,
    low: number,
    high: number,
    below: number,
    between: number,
    above: number
  ): number {
    // Still works if low > high
    if (value <= low && value <= high) {
      return below & 0xffffff
    } else if (value > low && value > high) {
      return above & 0xffffff
    } else {
      return between & 0xffffff
    }
  }

  /**
   * Map a value to three colors based on whether its distance to a target is close, medium or far.
   * @param value The value to map.
   * @param target The target to define the distance between it and the value.
   * @param radius The radius at which the distance is considered close.
   * @param close The color when the distance is close (less than the radius).
   * @param medium The color when the distance is medium (between the radius and double the radius).
   * @param far The color for far distances (more than double the radius).
   * @return One of the three possible colors.
   */

  //% block="color from the distance between $value and $target|close: $close|medium: $medium|far: $far|radius: $radius"
  //% value.min=-100 value.max=100 value.defl=50
  //% target.min=-100 target.max=100 target.defl=50
  //% radius.min=0 radius.max=100 radius.defl=20
  //% close.shadow=neopixel_colors close.defl=NeoPixelColors.Green
  //% medium.shadow=neopixel_colors medium.defl=NeoPixelColors.Blue
  //% far.shadow=neopixel_colors far.defl=NeoPixelColors.Red
  //% group="Color mappings"
  //% weight=180

  export function colorFromCloseMediumFar(
    value: number,
    target: number,
    radius: number,
    close: number,
    medium: number,
    far: number
  ): number {
    const d = Math.abs(value - target)
    if (d <= radius) {
      return close & 0xffffff
    } else if (d <= 2 * radius) {
      return medium & 0xffffff
    } else {
      return far & 0xffffff
    }
  }

  /**
   * Draw the full LED matrix on the Neopixel. Make sure to provide an initialized `Neopixel`.
   * @param myNeopixel The Neopixel LED matrix.
   * @param color The color of the matrix (24 bit).
   * @param brightness The brightness of the matrix (0 to 100).
   */

  //% block="$myNeopixel=variables_get(myNeopixel)|draw full matrix: color = $color|brightness = $brightness"
  //% color.shadow=neopixel_colors
  //% brightness.min=0 brightness.max=100 brightness.defl=10
  //% expandableArgumentMode="enabled"
  //% inlineInputMode=inline
  //% group="Display"
  //% weight=190

  export function drawFullMatrix(
    myNeopixel: neopixel.Strip = null,
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
   * @param myNeopixel The Neopixel LED matrix.
   * @param color The color of the gradient (24 bit).
   * @param brightness The brightness of the matrix (0 to 100).
   */

  //% block="$myNeopixel=variables_get(myNeopixel)|draw gradient: color = $color|brightness = $brightness"
  //% color.shadow=neopixel_colors
  //% brightness.min=0 brightness.max=100 brightness.defl=10
  //% expandableArgumentMode="enabled"
  //% inlineInputMode=inline
  //% group="Display"
  //% weight=180

  export function drawGradient(
    myNeopixel: neopixel.Strip = null,
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
        const faded = rgbFadeColor(param, (100 * (r * r * r + 0.02)) / 1.02)
        myNeopixel.setPixelColor(x + 8 * y, faded)
      }
    }
    myNeopixel.show()
  }

  /**
   * Draw a disk on the Neopixel LED matrix. Make sure to provide an initialized `Neopixel`.
   * @param myNeopixel The Neopixel LED matrix.
   * @param radius The radius of the disk (0 to 100).
   * @param color The color of the disk (24 bit).
   * @param brightness The brightness of the disk (0 to 100).
   */

  //% block="$myNeopixel=variables_get(myNeopixel)|draw disk: radius = $radius|color = $color|brightness = $brightness"
  //% radius.min=0 radius.max=100 radius.defl=100
  //% color.shadow=neopixel_colors
  //% brightness.min=0 brightness.max=100 brightness.defl=10
  //% expandableArgumentMode="enabled"
  //% inlineInputMode=inline
  //% group="Display"
  //% weight=170

  export function drawDisk(
    myNeopixel: neopixel.Strip = null,
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
          Math.sqrt((x - 3.5) * (x - 3.5) + (y - 3.5) * (y - 3.5)) <= radius
        ) {
          myNeopixel.setPixelColor(x + y * 8, color)
        }
      }
    }
    myNeopixel.show()
  }

  /**
   * Draw a single bar on the Neopixel LED matrix. Make sure to provide an initialized `Neopixel`.
   * @param myNeopixel The Neopixel LED matrix.
   * @param length The length of the bar (0 to 100).
   * @param color The color of the bar (24 bit).
   * @param brightness The brightness of the bar (0 to 100).
   */

  //% block="$myNeopixel=variables_get(myNeopixel)|draw bar: length = $length|color = $color|brightness = $brightness"
  //% length.min=0 length.max=100 length.defl=25
  //% color.shadow=neopixel_colors
  //% brightness.min=0 brightness.max=100 brightness.defl=10
  //% expandableArgumentMode="enabled"
  //% inlineInputMode=inline
  //% group="Display"
  //% weight=160

  export function drawBar(
    myNeopixel: neopixel.Strip = null,
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
   * @param myNeopixel The Neopixel LED matrix.
   * @param length1 The length of the first bar (0 to 100).
   * @param color1 The color of the first bar (24 bit).
   * @param length2 The length of the second bar (0 to 100).
   * @param color2 The color of the second bar (24 bit).
   * @param brightness The brightness of the two bars (0 to 100).
   */

  //% block="$myNeopixel=variables_get(myNeopixel)|draw double bars: length 1 = $length1|color 1 = $color1|length 2 = $length2|color 2 = $color2|brightness = $brightness"
  //% length1.min=0 length1.max=100 length1.defl=25
  //% color1.shadow=neopixel_colors
  //% length2.min=0 length2.max=100 length2.defl=25
  //% color2.shadow=neopixel_colors
  //% brightness.min=0 brightness.max=100 brightness.defl=10
  //% expandableArgumentMode="enabled"
  // inlineInputMode=inline
  //% group="Display"
  //% weight=150

  export function drawDoubleBars(
    myNeopixel: neopixel.Strip = null,
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
   * Draw a spiral on a Neopixel LED matrix. Make sure to provide an initialized `Neopixel`.
   * @param myNeopixel The Neopixel LED matrix.
   * @param length The length of the spiral (0 to 100).
   * @param color The color of the spiral (24 bit).
   * @param brightness The brightness of the spiral (0 to 100).
   * @param direction The direction of the spiral.
   */

  //% block="$myNeopixel=variables_get(myNeopixel)|draw spiral: length = $length|color = $color|brightness = $brightness|direction = $direction"
  //% length.min=0 length.max=100 length.defl=25
  //% color.shadow=neopixel_colors
  //% brightness.min=0 brightness.max=100 brightness.defl=10
  //% expandableArgumentMode="enabled"
  // inlineInputMode=inline
  //% group="Display"
  //% weight=140

  export function drawSpiral(
    myNeopixel: neopixel.Strip = null,
    length: number,
    color: number,
    brightness: number = 10,
    direction: util.RotationDir = util.RotationDir.Clockwise
  ): void {
    util.assert(!!myNeopixel, util.errorMessage.neopixel)
    length = util.iscale(length, 64)
    myNeopixel.setBrightness(util.iscale(brightness, 255))

    let n = 36 // (4, 4)
    const dn =
      direction === util.RotationDir.Clockwise
        ? [-1, -8, 1, 8] // left, up, right, down
        : [-8, -1, 8, 1] // up, left, down, right

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
    const lum = (Math.max(Math.max(r, g), b) + Math.min(Math.min(r, g), b)) >> 1
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
  function rgbFadeColor(param: RGBFadeParameters, brightness: number): number {
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
// groups=["Start block", "Sensor input", "Target breath"]
// @problem The space in the group name causes an issue.
// But it works by removing the line (// vs //%).

//breath
namespace bioW_Breath {
  // The number of samples used to calculate the velocity
  const accuracy = 5
  // The sampling period used in the independent forever loop
  const period = 50

  // @todo Actually not necessary
  export enum ConnectedTo {
    BBoard,
    Microbit
  }

  /**
   * Create an object to manage a breath sensor connected to the b.Board.
   * @param pin The pin to which the breath sensor is connected.
   * @return A new `BreathSensor` object.
   */

  //% block="new breath sensor on b.Board|on $pin"
  //% pin.defl=AnalogPin.P2
  //% blockSetVariable="breathSensor"
  //% group="Start block"
  //% weight=200

  export function createBreathSensorBBoard(pin: AnalogPin): BreathSensor {
    return new BreathSensor(ConnectedTo.BBoard, pin)
  }

  /**
   * Create an object to manage a breath sensor connected to the micro:bit.
   * @param pin The pin to which the breath sensor is connected.
   * @return A new `BreathSensor` object.
   */

  //% block="new breath sensor on micro:bit|on $pin"
  //% pin.defl=AnalogPin.P2
  //% blockSetVariable="breathSensor"
  //% group="Start block"
  //% weight=190

  export function createBreathSensorMicrobit(pin: AnalogPin): BreathSensor {
    return new BreathSensor(ConnectedTo.Microbit, pin)
  }

  /**
   * A class to manage the inputs from the breath sensor.
   * Creating a new instance starts a forever loop to poll the sensor,
   * store the value, and calculate the associated values.
   */
  export class BreathSensor {
    position: number = 0
    velocity: number = 0
    frequency: number = 0

    targetPosition: number = 0
    targetVelocity: number = 0
    targetFrequency: number = 12

    index: number = 0
    positions: number[] // = [0,0,0,0,0] @todo when length finalized
    timestamps: number[] // = [0,0,0,0,0]

    timeAtFreqChange: number = 0
    phaseAtFreqChange: number = 0
    stream: boolean = false

    constructor(private connection: ConnectedTo, private pin: AnalogPin) {
      this.positions = []
      this.timestamps = []
      for (let i = 0; i < accuracy; i++) {
        this.positions.push(0)
        this.timestamps.push(0)
      }
      this.startInputLoop()
    }

    /**
     * Read the sensor input on a separate forever loop
     * for better consistency in timing and to avoid issues
     * such as multiple readings in the basic forever loop.
     */
    startInputLoop() {
      control.inBackground(() => {
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
              (12 * period) +
            50

          // Target position and velocity
          // Keep track of frequency changes to avoid discontinuities
          const phase =
            0.00425 * this.targetFrequency * (time - this.timeAtFreqChange) +
            this.phaseAtFreqChange
          this.targetPosition = 0.393701 * (Math.isin(phase) - 1)
          this.targetVelocity = 0.393701 * (Math.isin(phase + 64) - 1)

          // Radio streaming
          if (this.stream) {
            const buffer = pins.createBuffer(12)
            buffer.setNumber(NumberFormat.Float32LE, 0, this.position)
            buffer.setNumber(NumberFormat.Float32LE, 4, this.velocity)
            buffer.setNumber(NumberFormat.Float32LE, 8, this.frequency)
            radio.sendBuffer(buffer)
          }

          // @debug
          // serial.writeValue("delta_time", this.timestamps[index] - this.timestamps[(index - 1) % accuracy])
          // serial.writeValue("position", this._position)
          // serial.writeValue("velocity", this._velocity)

          this.index++
          basic.pause(period) // @todo try to improve polling accuracy
        }
      })
    }
  }

  /**
   * Get the current breathing position. Make sure to provide an initialized `BreathSensor`.
   * @param breathSensor The breathing sensor object.
   * @return The breathing position.
   */

  //% block="$breathSensor=variables_get(breathSensor) position"
  //% group="Sensor input"
  //% weight=200

  export function position(breathSensor: BreathSensor = null): number {
    util.assert(!!breathSensor, util.errorMessage.breath)
    return breathSensor.position
  }

  /**
   * Get the current breathing velocity. Make sure to provide an initialized `BreathSensor`.
   * @param breathSensor The breathing sensor object.
   * @return The breathing velocity.
   */

  //% block="$breathSensor=variables_get(breathSensor) velocity"
  //% group="Sensor input"
  //% weight=190

  export function velocity(breathSensor: BreathSensor = null): number {
    util.assert(!!breathSensor, util.errorMessage.breath)
    return breathSensor.velocity
  }

  /**
   * Get the current breathing frequency. Make sure to provide an initialized `BreathSensor`.
   * @param breathSensor The breathing sensor object.
   * @return The breathing frequency.
   */

  //% block="$breathSensor=variables_get(breathSensor) frequency"
  //% group="Sensor input"
  //% weight=180

  export function frequency(breathSensor: BreathSensor = null): number {
    util.assert(!!breathSensor, util.errorMessage.breath)
    return breathSensor.frequency
  }

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
        0.00425 * frequency * input.runningTime() - 1 + (255 / 360) * shift
      )
    )
  }
}

/****************************************************************
 * Mappings
 */

//% weight=190
//% color=#F7931E
//% icon="\uf279" map
// icon="\uf0a9" arrow circle right
// groups=["Start block", "Sensor input", "Target breath"]

//mapping
namespace bioW_Mapping {
  export enum LengthMapType {
    Constant = 0,
    Position,
    Velocity,
    Frequency,
    //% block="Target position"
    TargetPosition,
    //% block="Target velocity"
    TargetVelocity,
    //% block="Target frequency"
    TargetFrequency
  }

  export enum ColorMapType {
    Constant = 0,
    Position,
    Velocity,
    Frequency,
    //% block="Target position"
    TargetPosition,
    //% block="Target velocity"
    TargetVelocity,
    //% block="Target frequency"
    TargetFrequency,
    //% block="Zero crossing"
    ZeroCrossing,
    //% block="Increment Color"
    IncrementColor
  }

  export enum BrightnessMapType {
    Constant = 0,
    Position,
    Velocity,
    Frequency,
    //% block="Target position"
    TargetPosition,
    //% block="Target velocity"
    TargetVelocity,
    //% block="Target frequency"
    TargetFrequency
  }

  export enum MotorMapType {
    Off = 0,
    Position,
    Velocity,
    Frequency,
    //% block="Target position"
    TargetPosition,
    //% block="Target velocity"
    TargetVelocity,
    //% block="Target frequency"
    TargetFrequency
  }

  type Map = () => number

  interface MappingInterface {
    length1: Map
    length2: Map
    color: Map
    brightness: Map
    motor: Map
  }

  //% block="new mapping from $breath=variables_get(breathSensor)|length mapping 1: $length1|length mapping 2: $length2|color mapping: $color|brightness mapping: $brightness|motor mapping: $motor"
  //% length1.defl=LengthMapType.TargetPosition
  //% length2.defl=LengthMapType.TargetVelocity
  //% brightness.defl=BrightnessMapType.TargetPosition
  //% blockSetVariable=myMapping
  //% group="Start block"
  //% weight=200

  export function createMapping(
    breath: util.BreathData,
    length1: LengthMapType,
    length2: LengthMapType,
    color: ColorMapType,
    brightness: BrightnessMapType,
    motor: MotorMapType
  ): Mapping {
    return new Mapping(breath, length1, length2, color, brightness, motor)
  }

  //% block="new default mapping from $breath=variables_get(breathSensor)"
  //% blockSetVariable=myMapping
  //% group="Start block"
  //% weight=190

  export function createDefaultMapping(breath: util.BreathData): Mapping {
    return new Mapping(breath)
  }

  /**
   * Get the current first length calculated by the mapping.
   * Make sure to provide an initialized `Mapping`.
   * @param myMapping The mapping object.
   * @return The first length.
   */

  //% block="$myMapping=variables_get(myMapping) length 1"
  //% group="Mapping output"
  //% weight=200

  export function length1(myMapping: MappingInterface = null): number {
    util.assert(!!myMapping, util.errorMessage.mapping)
    return myMapping.length1()
  }

  /**
   * Get the current second length calculated by the mapping.
   * Make sure to provide an initialized `Mapping`.
   * @param myMapping The mapping object.
   * @return The second length.
   */

  //% block="$myMapping=variables_get(myMapping) length 2"
  //% group="Mapping output"
  //% weight=190

  export function length2(myMapping: MappingInterface = null): number {
    util.assert(!!myMapping, util.errorMessage.mapping)
    return myMapping.length2()
  }

  /**
   * Get the current color calculated by the mapping.
   * Make sure to provide an initialized `Mapping`.
   * @param myMapping The mapping object.
   * @return The color.
   */

  //% block="$myMapping=variables_get(myMapping) color"
  //% group="Mapping output"
  //% weight=180

  export function color(myMapping: MappingInterface = null): number {
    util.assert(!!myMapping, util.errorMessage.mapping)
    return myMapping.color()
  }

  /**
   * Get the current brightness calculated by the mapping.
   * Make sure to provide an initialized `Mapping`.
   * @param myMapping The mapping object.
   * @return The brightness.
   */

  //% block="$myMapping=variables_get(myMapping) brightness"
  //% group="Mapping output"
  //% weight=170

  export function brightness(myMapping: MappingInterface = null): number {
    util.assert(!!myMapping, util.errorMessage.mapping)
    return myMapping.brightness()
  }

  /**
   * Get the current color calculated by the mapping.
   * Make sure to provide an initialized `Mapping`.
   * @param myMapping The mapping object.
   * @return The color.
   */

  // block="$myMapping=variables_get(myMapping) color"
  // group="Mapping output"
  // weight=160

  function brightnessNP(myMapping: MappingInterface = null): number {
    util.assert(!!myMapping, util.errorMessage.mapping)
    return myMapping.color()
  }

  /**
   * A class to manage mappings from the breathing data.
   */
  export class Mapping {
    length1: Map
    length2: Map
    color: Map
    brightness: Map
    motor: Map

    constructor(
      private breath: util.BreathData = null,
      private lengthMapType: LengthMapType = LengthMapType.Position,
      private lengthMapType2: LengthMapType = LengthMapType.Constant,
      private colorMapType: ColorMapType = ColorMapType.Constant,
      private brightnessMapType: BrightnessMapType = BrightnessMapType.Constant,
      private motorMapType: MotorMapType = MotorMapType.Off
    ) {
      switch (lengthMapType) {
        default:
        case LengthMapType.Constant:
          this.length1 = () => {
            return 100
          }
          break
        case LengthMapType.Position:
          this.length1 = () => {
            return this.breath.position
          }
          break
        case LengthMapType.Velocity:
          this.length1 = () => {
            return this.breath.velocity
          }
          break
        case LengthMapType.TargetPosition:
          this.length1 = () => {
            return this.breath.targetPosition
          }
          break
        case LengthMapType.TargetVelocity:
          this.length1 = () => {
            return this.breath.targetVelocity
          }
          break
      }

      switch (lengthMapType2) {
        default:
        case LengthMapType.Constant:
          this.length2 = () => {
            return 100
          }
          break
        case LengthMapType.Position:
          this.length2 = () => {
            return this.breath.position
          }
          break
        case LengthMapType.Velocity:
          this.length2 = () => {
            return this.breath.velocity
          }
          break
        case LengthMapType.TargetPosition:
          this.length2 = () => {
            return this.breath.targetPosition
          }
          break
        case LengthMapType.TargetVelocity:
          this.length2 = () => {
            return this.breath.targetVelocity
          }
          break
      }

      switch (colorMapType) {
        default:
        case ColorMapType.Constant:
          this.color = () => {
            return NeoPixelColors.Red
          }
          break
        case ColorMapType.TargetPosition:
          this.color = newTargetPositionColorMap(this.breath)
          break
      }

      switch (brightnessMapType) {
        default:
        case BrightnessMapType.Constant:
          this.brightness = () => {
            return 100
          }
          break
        case BrightnessMapType.Position:
          this.brightness = () => {
            return this.breath.position
          }
          break
        case BrightnessMapType.Velocity:
          this.brightness = () => {
            return this.breath.velocity
          }
          break
        case BrightnessMapType.TargetPosition:
          this.brightness = () => {
            return this.breath.targetPosition
          }
          break
        case BrightnessMapType.TargetVelocity:
          this.brightness = () => {
            return this.breath.targetVelocity
          }
          break
      }
    }
  }

  function newTargetPositionColorMap(
    breath: util.BreathData = null,
    delta: number = 20,
    close: Color = NeoPixelColors.Green,
    medium: Color = NeoPixelColors.Blue,
    far: Color = NeoPixelColors.Red
  ): Map {
    return () => {
      const d = Math.abs(breath.position - breath.targetPosition)
      if (d <= delta) {
        return close
      } else if (d <= 2 * delta) {
        return medium
      } else {
        return far
      }
    }
  }

  // Using classes:
  // ==============
  // class TargetPositionColorMap {
  //     color: Map
  //     constructor (
  //         private delta: number = 20,
  //         private close: Color = NeoPixelColors.Green,
  //         private medium: Color = NeoPixelColors.Blue,
  //         private far: Color = NeoPixelColors.Red) {
  //
  //         this.color = (breath: util.BreathData) => {
  //             const d = Math.abs(breath.position - bioW_Breath.targetPosition(12))
  //             if (d <= this.delta) {
  //                 return this.close
  //             } else if (d <= 2 * this.delta) {
  //                 return this.medium
  //             } else {
  //                 return this.far
  //             }
  //         }
  //     }
  // }

  // Using closures:
  // ===============
  // function newTargetPositionColorMap(
  //     delta: number = 20,
  //     close: Color = NeoPixelColors.Green,
  //     medium: Color = NeoPixelColors.Blue,
  //     far: Color = NeoPixelColors.Red): Map {
  //
  //     return (breath: util.BreathData) => {
  //         const d = Math.abs(breath.position - bioW_Breath.targetPosition(12))
  //         if (d <= delta) {
  //             return close
  //         } else if (d <= 2 * delta) {
  //             return medium
  //         } else {
  //             return far
  //         }
  //     }
  // }
}

/****************************************************************
 * Motor and pinwheel
 */

//% weight=160
//% color=#F7931E
//% icon="\uf085" cogs (same as generic BBoard_Motor)
// icon="\uf013" cog
// icon="\uf185" sun
//% groups=["Initialize", "Use"]

//motor
namespace bioW_Motor {
  /**
   * A class to manage receiving values from a breath sensor connected to another micro:bit.
   */
  export class Motor {
    side: bBoard_Motor.motorDriver = bBoard_Motor.motorDriver.right

    // let leftMotor = bBoard_Motor.createMotor(BoardID.zero, ClickID.Zero, )

    constructor(group: number) {}
  }

  /**
   * Create an object to manage receiving values from a breath sensor connected to another micro:bit.
   * @param group The group ID for radio communications.
   * @return A new `BreathOverRadio` object.
   */

  //% block="new motor|on side $side"
  //% blockSetVariable="myMotor"
  //% group="Start block"
  //% weight=200

  export function createBreathOverRadio(side: bBoard_Motor.motorDriver): Motor {
    return new Motor(side)
  }
}

/****************************************************************
 * Radio communication
 */

//% weight=150
//% color=#F7931E
//% icon="\uf012" signal (same as generic Radio)
//% groups=["Sender", "Receiver"]

//radio
namespace bioW_Radio {
  /**
   * Start streaming values over radio from a `BreathSensor` object. Make sure to have it initialized.
   * @param breathSensor A `BreathSensor` object to stream from.
   * @param group The group ID for radio communications.
   * @param power The output power of the radio sender.
   */

  //% block="$breathSensor=variables_get(breathSensor)|start sending|on group $group|with power of $power"
  //% group.min=0 group.max=255 group.defl=0
  //% power.min=0 power.max=7 power.defl=6
  //% expandableArgumentMode="toggle"
  //% group="Sender"
  //% weight=200

  export function startRadioStreaming(
    breathSensor: bioW_Breath.BreathSensor,
    group: number = 0,
    power: number = 7
  ): void {
    util.assert(!!breathSensor, util.errorMessage.breath)
    radio.setGroup(group)
    radio.setTransmitPower(power)
    breathSensor.stream = true
  }

  /**
   * Stop streaming values over radio from a `BreathSensor` object. Make sure to have it initialized.
   * @param breathSensor A `BreathSensor` object to stop streaming from.
   */

  //% block="$breathSensor=variables_get(breathSensor)|stop sending"
  //% group="Sender"
  //% weight=190

  export function stopRadioStreaming(
    breathSensor: bioW_Breath.BreathSensor
  ): void {
    util.assert(!!breathSensor, util.errorMessage.breath)
    breathSensor.stream = false
  }

  /**
   * A class to manage receiving values from a breath sensor connected to another micro:bit.
   */
  export class BreathOverRadio {
    position: number = 0
    velocity: number = 0
    frequency: number = 0

    constructor(group: number) {
      radio.setGroup(group & 0xff)
      radio.onReceivedBuffer((buffer) => {
        this.position = buffer.getNumber(NumberFormat.Float32LE, 0)
        this.velocity = buffer.getNumber(NumberFormat.Float32LE, 4)
        this.frequency = buffer.getNumber(NumberFormat.Float32LE, 8)
      })
    }
  }

  /**
   * Create an object to manage receiving values from a breath sensor connected to another micro:bit.
   * @param group The group ID for radio communications.
   * @return A new `BreathOverRadio` object.
   */

  //% block="new radio listener|on group $group"
  //% group.min=0 group.max=255 group.defl=0
  //% blockSetVariable="breathOverRadio"
  //% group="Start block"
  //% weight=200

  export function createBreathOverRadio(group: number = 0): BreathOverRadio {
    return new BreathOverRadio(group)
  }

  /**
   * Get the breathing position sent over radio. Make sure to provide an initialized `BreathOverRadio`.
   * @param breathOverRadio The listener object.
   * @return The breathing position.
   */

  //% block="$breathOverRadio=variables_get(breathOverRadio) position"
  //% group="Listener input"
  //% weight=200

  export function position(breathOverRadio: BreathOverRadio = null): number {
    util.assert(!!breathOverRadio, util.errorMessage.radio)
    return breathOverRadio.position
  }

  /**
   * Get the breathing velocity sent over radio. Make sure to provide an initialized `BreathOverRadio`.
   * @param breathOverRadio The listener object.
   * @return The breathing velocity.
   */

  //% block="$breathOverRadio=variables_get(breathOverRadio) velocity"
  //% group="Listener input"
  //% weight=190

  export function velocity(breathOverRadio: BreathOverRadio = null): number {
    util.assert(!!breathOverRadio, util.errorMessage.radio)
    return breathOverRadio.velocity
  }

  /**
   * Get the breathing frequency sent over radio. Make sure to provide an initialized `BreathOverRadio`.
   * @param breathOverRadio The listener object.
   * @return The breathing frequency.
   */

  //% block="$breathOverRadio=variables_get(breathOverRadio) frequency"
  //% group="Listener input"
  //% weight=180

  export function frequency(breathOverRadio: BreathOverRadio = null): number {
    util.assert(!!breathOverRadio, util.errorMessage.radio)
    return breathOverRadio.frequency
  }

  /**
   * Stop the listener.
   * @param breathOverRadio The listener object.
   */

  //% block="$breathOverRadio=variables_get(breathOverRadio) stop listening"
  //% group="Listener input"
  //% weight=170

  export function stopListening(breathOverRadio: BreathOverRadio = null): void {
    util.assert(!!breathOverRadio, util.errorMessage.radio)
    radio.onReceivedBuffer(() => {})
    // There does not seem to be a way to unregister event handlers.
    // See: https://makecode.microbit.org/reference/event-handler
  }

  /**
   * Change the group ID for radio communications.
   * @param breathOverRadio The listener object.
   * @param group The new group ID.
   */

  //% block="$breathOverRadio=variables_get(breathOverRadio) change group to $group"
  //% group.min=0 group.max=255 group.defl=0
  //% group="Listener input"
  //% weight=160

  export function changeGroup(
    breathOverRadio: BreathOverRadio = null,
    group: number
  ): void {
    util.assert(!!breathOverRadio, util.errorMessage.radio)
    radio.setGroup(group & 0xff)
  }
}
