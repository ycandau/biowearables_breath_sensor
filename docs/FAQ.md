# FAQ

[[_TOC_]]

----

### Runtime errors

#### *The micro:bit is showing me a sad face and then a number*

This is a runtime error. It means that something in the program is wrong, and that the mistake is crashing the micro:bit. The number is an error code that lets you know what kind of issue is taking places. Look up the error code below.

#### *The micro:bit crashes with error 020*

It is running out of memory. Most likely you are doing something that requires memory in a `[forever]` loop. Go back to your program and double check that you don't have a block meant to be used once `[on start]` that is incorrectly placed in a `[forever]` loop. For instance, all the creation blocks should only be placed `[on start]`: `[new breath sensor]`, `[new neopixel]`, `[new motor]`, `[new radio]`...
