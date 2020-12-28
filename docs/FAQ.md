# FAQ

- [Sensor issues](#sensor-issues)
  - [The sensor is unresponsive](#the-sensor-is-unresponsive)
  - [The sensor is not working well](#the-sensor-is-not-working-well)
  - [Adjusting the boost level](#adjusting-the-boost-level)
  - [The wires or the rubber stretch sensor broke off](#the-wires-or-the-rubber-stretch-sensor-broke-off)
- [Runtime errors](#runtime-errors)
  - [The micro:bit is showing me a sad face and then a number](#the-microbit-is-showing-me-a-sad-face-and-then-a-number)
  - [The micro:bit crashes with error 020](#the-microbit-crashes-with-error-020)

----

### Sensor issues

#### *The sensor is unresponsive*

Make sure that the wires and the resistor are well connected to the micro:bit:

- Resistor between pin 2 and pin 3.
- Red wire on pin 2
- Black wire on in GND

@todo photo

#### *The sensor is not working well*

The sensor should be worn fairly loose but with no slack. Check that it is neither too tight, nor too loose. You can also adjust the boost level of the sensor to magnify its signal, by pressing Button A to cycle through different settings.

#### *Adjusting the boost level*

The sensor can be adjusted to magnify its signal by changing its `boost level`. This is like adjusting the loudness of a song when you listen to it. Ideally the signal should be neither too loud nor too low.

Press Button A to adjust the `boost level` by cycling through the various setting. You will see a number from 1 to 3 displayed on the micro:bit for a second, to confirm the new level that has been chosen.

Use the `Depth` mapping to confirm that the `boost level` is appropriate, neither too high nor too low:

- High enough that a full breath covers the whole available range, or close to that.
- A full inhale should get the spiral to fill the display, or close to that.
- A full exhale should get the spiral to shrink to the center point, or close to that.
- But not too high that the sensor easily jumps to extreme values, for instance a shallow inhale filling the display out.

@todo video?

#### *The wires or the rubber stretch sensor broke off*

If the wires or the stretch sensor break off, you can use the electrical tape to make a repair. You need a stretch of exposed wire, which you can then loop tightly around the stretch sensor. Then cover the repaired connection with electrical tape to hold things together and insulate everything.

@todo photo

----

### Runtime errors

#### *The micro:bit is showing me a sad face and then a number*

This is a runtime error. It means that something in the program is wrong, and that the mistake is crashing the micro:bit. The number is an error code that lets you know what kind of issue is taking place. Look up the error code below.

#### *The micro:bit crashes with error 020*

It is running out of memory. Most likely you are doing something that requires memory in a `||forever||` loop. Go back to your program and double check that you don't have a block meant to be used once `||on start||` that is incorrectly placed in a `||forever||` loop. For instance, all the creation blocks should only be placed `||on start||`: `||new breath sensor||`, `||new microbit||`, `||new neopixel||`, `||new motor||`, `||new radio receiver||`...
