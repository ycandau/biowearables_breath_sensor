"""
Signal processing simulation for the breath sensor micro:bit
"""

import scipy.signal as sig
import matplotlib.pyplot as plt
import numpy as np
import math

def float_to_str(x):
    if x % 1 == 0:
        return '{:.8g}'.format(x)
    elif abs(x) < 1:
        return '{:.8e}'.format(x)
    else:
        return '{:.8f}'.format(x)

def iter_to_str(iter):
    return '[' + ', '.join(map(float_to_str, iter)) + ']'

def print_filter(filt, name):
    print(name + ':  Order: ' + str(max(len(filt[0]), len(filt[0])) - 1))
    print('Numerator:   ' + iter_to_str(filt[0]))
    print('Denominator: ' + iter_to_str(filt[1]))
    print('zi:          ' + iter_to_str(sig.lfilter_zi(filt[0], filt[1])))

def plot_filter(filt, name):
    w, h = sig.freqz(filt[0], filt[1])
    w /= math.pi
    
    plt.plot(w, 20 * np.log10(abs(h)))
    plt.title(name + ' (' + str(len(filter[0])) + ')')
    plt.margins(0, 0.1)
    plt.grid(which='both', axis='both')
    plt.axvline(0.2, color='green')
    plt.axhline(-5, color='green')
    plt.show()

def apply_filter(x, filt):
    zi = sig.lfilter_zi(filt[0], filt[1])
    y, zf = sig.lfilter(filt[0], filt[1], x, zi=zi*x[0])
    return y

def center(x, alpha):
    b = [1, -1]
    a = [1, -alpha]
    zi = sig.lfilter_zi(b, a)
    y, zf = sig.lfilter(b, a, x, zi=zi*0)
    return y

fd1 = [1, -1]
fd2 = [3/2, -2, 1/2]
fd3 = [11/6, -3, 3/2, -1/3]
fd4 = [25/12, -4, 3, -4/3, 1/4]
fd5 = [137/60, -5, 5, -10/3, 5/4, -1/5]
fd6 = [49/20, -6, 15/2, -20/3, 15/4, -6/5, 1/6]

def derivate(x, fd, dt):
    zi = sig.lfilter_zi(fd, [1])
    dx, zf = sig.lfilter(fd, [1], x, zi=zi*x[0])
    return dx / dt

def zero_crossings(dx, x):
    sign = 0
    up = []
    down = []
    duration = []
    
    x_min = 0
    x_max = 0
    x_min_prev = 0
    x_max_prev = 0
    x_min_arr = []
    x_max_arr = []
    x_delta = []
    
    dx_min = 0
    dx_max = 0
    dx_min_prev = 0
    dx_max_prev = 0
    dx_min_arr = []
    dx_max_arr = []
    dx_delta = []
    
    for i in range(len(dx)):
        x_min = min(x_min, x[i])
        x_max = max(x_max, x[i])     
        dx_min = min(dx_min, dx[i])
        dx_max = max(dx_max, dx[i])
        if (sign != 1) and (dx[i] > 3):
            sign = 1
            if (len(down) == 0 or i - down[-1] > 4 or dx_min < -8):
                x_min_prev = x_min
                x_max = x_min
                dx_min_prev = dx_max
                dx_max_prev = dx_max
                dx_max = dx[i]
                up.append(i)
            else:
                down.pop()
        elif (sign != -1) and (dx[i] < -3):
            sign = -1
            if (len(up) == 0 or i - up[-1] > 4 or dx_max > 8):
                x_min = x_max
                x_max_prev = x_max       
                dx_min_prev = dx_min
                dx_max_prev = dx_min
                dx_min = dx[i]
                down.append(i)
            else:
                up.pop()
        
        if (len(up) < 2):
            period_up = 50
        else:
            period_up = max(up[-1] - up[-2], i - up[-1])
        if (len(down) < 2):
            period_down = 50
        else:
            period_down = max(down[-1] - down[-2], i - down[-1])
        
        if (x_min_prev < x_min):
            x_min_prev = 0.99 * x_min_prev + 0.01 * x_min
        if (x_max_prev > x_max):
            x_max_prev = 0.99 * x_max_prev + 0.01 * x_max
        
        if (dx_min_prev < dx_min):
            dx_min_prev = 0.95 * dx_min_prev + 0.05 * dx_min
        if (dx_max_prev > dx_max):
            dx_max_prev = 0.95 * dx_max_prev + 0.05 * dx_max
        
        duration.append((period_up + period_down) / 2)
        x_min_arr.append(min(x_min, x_min_prev))
        x_max_arr.append(max(x_max, x_max_prev))
        x_delta.append(max(x_max, x_max_prev) - min(x_min, x_min_prev))
        dx_min_arr.append(min(dx_min, dx_min_prev))
        dx_max_arr.append(max(dx_max, dx_max_prev))
        dx_delta.append(max(dx_max, dx_max_prev) - min(dx_min, dx_min_prev))
        
    return [up, down, duration, x_min_arr, x_max_arr, x_delta, dx_min_arr, dx_max_arr, dx_delta]

def zc_delay(zc1, zc0):
    delays = []
    for x1 in zc1[0]:
        for x0 in zc0[0]:
            if x0 <= x1: prec = x0
        delays.append(x1 - prec)
    print('DELAY UP:   Max:', np.max(delays), '| Avg:', np.average(delays), '|', delays)
    delays.clear()
    for x1 in zc1[1]:
        for x0 in zc0[1]:
            if x0 <= x1: prec = x0
        delays.append(x1 - prec)
    print('DELAY DOWN: Max:', np.max(delays), '| Avg:', np.average(delays), '|', delays)
    return 0

def plot_zc(zc):
    for x in zc[0]:
        plt.axvline(x, c='purple', lw=1)
    for x in zc[1]:
        plt.axvline(x, c='green', lw=1)

data = np.genfromtxt('D:\\code\\biowearable\\sensor\\data2.csv', delimiter=',', skip_header=1, names=['time', 'pos'])
data = data[0:-1]

butter = sig.butter(3, 0.3, 'lowpass', analog=False)
print_filter(butter, 'Butterworth (3)')
#cheby = sig.cheby2(3, 50, 0.19, 'lowpass', analog=False)
#cheby = sig.cheby2(3, 50, 0.69, 'lowpass', analog=False)
#ellip = sig.ellip(4, 5, 20, 0.2, 'lowpass', analog=False)
#cheby1 = sig.cheby1(2, 5, 0.2, 'lowpass', analog=False)

dt = 0.100
fd = fd4
x0 = [row[1] - data[0][1] for row in data[:]]
T = [row[0] for row in data]
DT = [T[i] - T[i-1] for i in range(1, len(T))]
zc0 = zero_crossings(derivate(x0, fd1, dt), x0)

x1 = apply_filter(x0, butter)
dx1 = derivate(x1, fd, dt)
zc1 = zero_crossings(dx1, x1)
cx1 = center(x1, 0.995)

plt.figure(1, figsize=(18, 30))

plt.subplot(411)
plt.margins(0, 0.05)
plt.grid(which='both', axis='both')
plt.axhline(0, c='red')

plt.plot(dx1, c='orange')
plot_zc(zc1)
plt.plot(zc1[6], c='brown')
plt.plot(zc1[7], c='brown')
plt.plot(zc1[8], c='purple')

butter2 = sig.butter(2, 0.03, 'lowpass', analog=False)
print_filter(butter2, 'butter2')
i = apply_filter(zc1[8], butter2)
plt.plot(i, c='blue')

"""
plt.subplot(412)
plt.margins(0, 0.05)
plt.grid(which='both', axis='both')
plt.axhline(0, c='red')
plt.plot(dx1, c='orange')
plot_zc(zc1)
zc_delay(zc1, zc0)
"""

"""
plt.subplot(413)
plt.margins(0, 0.05)
plt.grid(which='both', axis='both')
d = zc1[2]
d2 = apply_filter(d, butter2)
plt.plot(d)
plt.plot(d2)
plot_zc(zc1)
"""

"""
plt.subplot(414)
plt.margins(0, 0.05)
plt.grid(which='both', axis='both')
"""
