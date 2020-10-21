# Examples

[[_TOC_]]

----

### Setting up the library

You will need the biowearables library of custom blocks to run these examples in the IDE.

You can either:

- Import a hex file with the library to a new project: [biowearables_library.hex](../hex/biowearables_library.hex)
- Copy a `custom.js` file into an existing project: [custom.ts](../typescript/custom.ts)

You should see new tabs in the IDE for the custom blocks:

![New tabs](../images/IDE_new_tabs.png)

More information on using hex files and TypeScript files is available [here](../README.md/#storing-and-retrieving-projects).

----

### Using JavaScript mode for more information

While these examples focus on how things look in `Blocks` mode, additional information on all the blocks can be accessed by switching to `JavaScript` mode.

In the text editor, hovering over a function or variable brings up contextual information. And on the side, opening a tab with custom blocks displays summary information for each:

![Summary information](../images/IDE_js_docs_1.png)

This information (generated from JSDoc style annotations in the source file) can be expanded by hovering over a block and clicking on the three vertical lines:

![Summary information](../images/IDE_js_docs_2.png)

----

### Drawing on the micro:bit: BioW_Microbit

Source for main file: [main_microbit_example.ts](../typescript/main_microbit_example.ts)

Block program:

![](../images/blocks_microbit_example.png)

This tab includes drawing functions for the 5x5 LED matrix on the micro:bit. Unlike the other components, there is no underlying class here. In terms of blocks, this means that there is no variable to first create in the `[on start]` block which remains empty.

We use `[cycle]` from the `BioW_Breath` tab to get a sinusoidal oscillator. It has a frequency of 12 cycles per minute, and a phase shift of 0.

The oscillating value is assigned to the length of `[draw bar]`. It also has a fixed brightness of 10.

The drawing block goes into the `[forever]` block.

You should see the oscillating bar in the simulator, or on an actual micro:bit if you flash it with this program.
