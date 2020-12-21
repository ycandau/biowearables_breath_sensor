//****************************************************************
// Moving average
let avg = this.positions.reduce((a, b) => a + b, 0) / this.positions.length
serial.writeValue('avg', avg)

//****************************************************************
// Finite difference: Derivative / 5 values
let fd5_dx =
    (200 *
        (this.positions[(index + 1) % this.nSamples] -
            8 * this.positions[(index + 2) % this.nSamples] +
            8 * this.positions[(index + 4) % this.nSamples] -
            this.positions[index])) /
        (12 * this.samplingPeriod) +
    50
serial.writeValue('fd5_dx', fd5_dx)

//****************************************************************
// Savitzky–Golay filter: Quadratic / Cubic / 5 values
let savgol =
    (-3 * this.positions[(index + 1) % this.nSamples] +
        12 * this.positions[(index + 2) % this.nSamples] +
        17 * this.positions[(index + 3) % this.nSamples] +
        12 * this.positions[(index + 4) % this.nSamples] -
        3 * this.positions[index]) /
    35
serial.writeValue('savgol', savgol)

//****************************************************************
// Savitzky–Golay filter: Derivative / Cubic / Quartic / 5 values
let dsavgol =
    (1 * this.positions[(index + 1) % this.nSamples] -
        8 * this.positions[(index + 2) % this.nSamples] +
        0 * this.positions[(index + 3) % this.nSamples] +
        8 * this.positions[(index + 4) % this.nSamples] -
        1 * this.positions[index]) /
    12
serial.writeValue('dsavgol', dsavgol)
