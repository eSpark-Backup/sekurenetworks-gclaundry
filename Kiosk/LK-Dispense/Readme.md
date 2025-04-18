# To install pyqt5
sudo apt-get install python3-pyside2.qt3dcore python3-pyside2.qt3dinput python3-pyside2.qt3dlogic python3-pyside2.qt3drender python3-pyside2.qtcharts python3-pyside2.qtconcurrent python3-pyside2.qtcore python3-pyside2.qtgui python3-pyside2.qthelp python3-pyside2.qtlocation python3-pyside2.qtmultimedia python3-pyside2.qtmultimediawidgets python3-pyside2.qtnetwork python3-pyside2.qtopengl python3-pyside2.qtpositioning python3-pyside2.qtprintsupport python3-pyside2.qtqml python3-pyside2.qtquick python3-pyside2.qtquickwidgets python3-pyside2.qtscript python3-pyside2.qtscripttools python3-pyside2.qtsensors python3-pyside2.qtsql python3-pyside2.qtsvg python3-pyside2.qttest python3-pyside2.qttexttospeech python3-pyside2.qtuitools python3-pyside2.qtwebchannel python3-pyside2.qtwebsockets python3-pyside2.qtwidgets python3-pyside2.qtx11extras python3-pyside2.qtxml python3-pyside2.qtxmlpatterns pyside2-tools

sudo apt install $(apt-cache pkgnames python3-pyside2.) pyside2-tools python-pyside2-doc
sudo apt-get install python3-pyqt5.qtsvg

pip install -r requirements.txt --break-system-packages

/usr/bin/python3 -m venv --system-site-packages venv





# disable splash
https://forums.raspberrypi.com/viewtopic.php?t=162629#:~:text=%22Enabling%20and%20disabling%20the%20splash,%2Fthemes%2Fpix%2Fsplash.
"Enabling and disabling the splash screen is with some extra arguments in /boot/cmdline.txt – if this line includes “quiet splash”, the splash screen is shown; if it does not include those words, the old text-based boot is shown.

The splash screen is a PNG file at /usr/share/plymouth/themes/pix/splash.png – you can change the image to whatever you want as long as you use the same file name."



# useful
https://forums.x-plane.org/index.php?/forums/topic/231555-webfmc-raspberry-pi-touch-screen/

## These are the crude steps to setup a fresh device from scratch
pi OS setup raspi-imager 64 bit bookworm OS

sudo apt install dos2unix

copy src
scp -r .\LK-Dispense  sekure@raspberrypi.local:/home/sekure/

convert dos2unix 
sudo find /home/sekure/LK-Dispense -type f -exec dos2unix {} +

use chmod on .sh
sudo chmod +x LK-Dispense/*.sh
sudo chmod +x LK-Dispense/scripts/*.sh
sudo chmod +x LK-Dispense/bookworm_rpi4_cm_lcd_ts/*.sh
sudo chmod +x LK-Dispense/scripts/touch/*.sh
sudo chmod +x LK-Dispense/scripts/wayland_x11_conversions/*.sh

run lcd_touch script
cd /LK-Dispense/bookworm_rpi4_cm_lcd_ts
sudo ./install_lcd_touch_bookworm.sh 8 sekure

skip	convert wayland to x11 using raspi-config manually	

run project script in order
cd /home/sekure/LK-Dispense
./setup.sh
./onboard_setup.sh
skip	sudo apt install at-spi2-core
./setup_enviroment.sh
sudo apt install at-spi2-core

convert wayland to x11 using raspi-config manually
sudo raspi-config

reboot the system
sudo reboot