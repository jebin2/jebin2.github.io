# 📝 Raspberry Pi Pico Quick Reference — MicroPython

**1️⃣ Bootloader:**
Hold **BOOTSEL** + plug USB → check `lsblk -f` → look for `RPI-RP2`

**3️⃣ Flash MicroPython:**

```bash
sudo cp ~/Downloads/RPI_PICO-*.uf2 ~/pico/
```

**4️⃣ Verify / Serial port:**

```bash
ls /dev/ttyACM*  # expects /dev/ttyACM0
```

**5️⃣ Connect REPL:**

* screen: `sudo screen /dev/ttyACM0 115200`
* Python: `import serial; ser=serial.Serial('/dev/ttyACM0',115200)`
* Thonny: select **MicroPython (Raspberry Pi Pico)**

**6️⃣ Blink onboard LED:**

```python
from machine import Pin, Timer
led=Pin(25,Pin.OUT)
t=Timer(); t.init(freq=2, mode=Timer.PERIODIC, callback=lambda x:led.toggle())
```

**7️⃣ Stop blinking:**

```python
t.deinit()  # or reset Pico
```

**8️⃣ Exit screen:**
`Ctrl+A` → `Ctrl+\`

**Tip:** 115200 = baud rate; Pico keeps running last code until reset.
