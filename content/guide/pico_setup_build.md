# Raspberry Pi Pico SDK Setup and Build Guide

This guide shows how to properly clone the Pico SDK and build a project using CMake.

---

## 1. Remove any incomplete SDK

```bash
cd ~/deleteme
rm -rf pico-sdk
````

---

## 2. Clone the Pico SDK repository with submodules

```bash
git clone https://github.com/raspberrypi/pico-sdk.git
cd pico-sdk
git submodule update --init
cd ..
```

> This ensures all required submodules are properly initialized.

---

## 3. Copy the SDK import file

```bash
cp pico-sdk/external/pico_sdk_import.cmake .
```

> This allows CMake projects to locate the Pico SDK correctly.

---

## 4. Create a build directory for your project

```bash
mkdir build
cd build
```

> Keeping builds in a separate folder is recommended to avoid cluttering your source files.

---

## 5. Run CMake to configure the project

```bash
cmake ..
```

> CMake will configure your project and locate the Pico SDK using `pico_sdk_import.cmake`.

---

## 6. Build the project

```bash
make -j4
```

> `-j4` tells `make` to use 4 parallel jobs to speed up compilation.

---

After this, your project `.uf2` file will be generated in the `build` folder, ready to flash to your Raspberry Pi Pico.
