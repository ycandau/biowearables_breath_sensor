# FAQ

- [Issues with the breath sensor](#issues-with-the-breath-sensor)
  - [The sensor is unresponsive](#the-sensor-is-unresponsive)
  - [The sensor is not working well](#the-sensor-is-not-working-well)
  - [Adjusting the boost level](#adjusting-the-boost-level)
  - [The wires or the rubber stretch sensor broke off](#the-wires-or-the-rubber-stretch-sensor-broke-off)
- [Issues with the pinwheel and display](#issues-with-the-pinwheel-and-display)
  - [The pinwheel and display micro:bit is flashing a cross](#the-pinwheel-and-display-microbit-is-flashing-a-cross)
  - [The pinwheel is hitting the pole of the box](#the-pinwheel-is-hitting-the-pole-of-the-box)
  - [The pinwheel is sliding or comes off the motor](#the-pinwheel-is-sliding-or-comes-off-the-motor)
  - [The pinwheel stopped working after turning the b.Board off](#the-pinwheel-stopped-working-after-turning-the-bboard-off)
- [Issues with MakeCode](#issues-with-makecode)
    - [I can't find some of the mappings](#i-cant-find-some-of-the-mappings)
- [General issues with the micro:bit](#general-issues-with-the-microbit)
  - [The micro:bit is showing me a sad face and then a number](#the-microbit-is-showing-me-a-sad-face-and-then-a-number)
  - [The micro:bit crashes with error 020](#the-microbit-crashes-with-error-020)

----

### Issues with the breath sensor

#### *The sensor is unresponsive*

Make sure that the wires and the resistor are well connected to the micro:bit:

- Resistor between pin 2 and pin 3
- Red wire on pin 2
- Black wire on GND

@todo photo

#### *The sensor is not working well*

The sensor should be worn fairly loose but with no slack. Check that it is neither too tight, nor too loose. You can also adjust the boost level of the sensor to magnify its signal, by pressing Button A to cycle through different settings.

#### *Adjusting the boost level*

The sensor can be adjusted to magnify its signal by changing its `boost level`. This is like adjusting the loudness of a song when you listen to it. Ideally the signal should be neither too loud nor too low.

Press Button A to adjust the `boost level` by cycling through the various settings. You will see a number from 1 to 3 displayed on the micro:bit for a second, to confirm the new level that has been chosen.

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

### Issues with the pinwheel and display

#### *The pinwheel and display micro:bit is flashing a cross*

The flashing cross indicates that the micro:bit is not receiving any Bluetooth messages from a breath sensor. Make sure that you have another micro:bit up and running with the breath sensor.

@todo photo

#### *The pinwheel is hitting the pole of the box*

First, make sure that the two wooden disks holding the pinwheel are close to the end of the motor shaft, to keep the wings of the pinwheel away from the pole. If necessary slide them forward as needed. Then, if the issue remains you can try bending the paper to get the wings further away.

@todo photo

#### *The pinwheel is sliding or comes off the motor*

First try pinching the two wooden disks together to hold the sheet of paper tightly. If the disks keep sliding or are coming off the motor, you can use glue between the disks and the paper, and between the various layers of paper, to hold everything together. Do that while all the pieces are on the motor so they remain aligned.

#### *The pinwheel stopped working after turning the b.Board off*

The motor will stop working if the b.Board is turned OFF and ON while the micro:bit is connected over USB. This is because the b.Board is rebooted, but not the micro:bit, as it remains powered over USB.

To reset the micro:bit and get the motor to work again, you can flash it with a new program, or make sure to disconnect the USB cable when you turn the b.Board OFF and ON.

----

### Issues with MakeCode

#### *I can't find some of the mappings*

Make sure to scroll down to see all the available mappings for each display or motor parameter.

----

### General issues with the micro:bit

#### *The micro:bit is showing me a sad face and then a number*

This is a runtime error. It means that something in the program is wrong, and that the mistake is crashing the micro:bit. The number is an error code that lets you know what kind of issue is taking place. Look up the error code below.

#### *The micro:bit crashes with error 020*

The micro:bit is running out of memory. Most likely you have incorrectly placed a block to run in a `||forever||` loop, instead of only once `||on start||`. All BioWearables blocks are meant to be run `||on start||`.
