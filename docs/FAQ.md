# FAQ

- [Runtime errors](#runtime-errors)
  - [The micro:bit is showing me a sad face and then a number](#the-microbit-is-showing-me-a-sad-face-and-then-a-number)
  - [The micro:bit crashes with error 020](#the-microbit-crashes-with-error-020)

----

### Runtime errors

#### *The micro:bit is showing me a sad face and then a number*

This is a runtime error. It means that something in the program is wrong, and that the mistake is crashing the micro:bit. The number is an error code that lets you know what kind of issue is taking place. Look up the error code below.

#### *The micro:bit crashes with error 020*

It is running out of memory. Most likely you are doing something that requires memory in a `||forever||` loop. Go back to your program and double check that you don't have a block meant to be used once `||on start||` that is incorrectly placed in a `||forever||` loop. For instance, all the creation blocks should only be placed `||on start||`: `||new breath sensor||`, `||new microbit||`, `||new neopixel||`, `||new motor||`, `||new radio receiver||`...

----

### Sensor issues

#### The sensor is not working well

The sensor should be worn fairly loose but with no slack. Check that it is neither too tight, nor too loose. You can also adjust the sensitivity of the sensor up and down using the two buttons on the micro:bit: A to amplify the signal, B to attenuate it.
