#!/bin/bash
echo "Setting up LaundryKiosk..."
#sudo apt update
#sudo apt upgrade

cur_dir="$( cd "$(dirname "$0")" ; pwd -P )"

# pull from git
git -c credential.helper='!f() { echo "username=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"; echo "password=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"; }; f' clone https://github.com/MuhammadShabbarAbbas/LK-Dispense

# Install PySide2 and some dependencies
sudo apt install -y python3-pyside2.qt3dcore python3-pyside2.qt3dinput python3-pyside2.qt3dlogic python3-pyside2.qt3drender python3-pyside2.qtcharts python3-pyside2.qtconcurrent python3-pyside2.qtcore python3-pyside2.qtgui python3-pyside2.qthelp python3-pyside2.qtlocation python3-pyside2.qtmultimedia python3-pyside2.qtmultimediawidgets python3-pyside2.qtnetwork python3-pyside2.qtopengl python3-pyside2.qtpositioning python3-pyside2.qtprintsupport python3-pyside2.qtqml python3-pyside2.qtquick python3-pyside2.qtquickwidgets python3-pyside2.qtscript python3-pyside2.qtscripttools python3-pyside2.qtsensors python3-pyside2.qtsql python3-pyside2.qtsvg python3-pyside2.qttest python3-pyside2.qttexttospeech python3-pyside2.qtuitools python3-pyside2.qtwebchannel python3-pyside2.qtwebsockets python3-pyside2.qtwidgets python3-pyside2.qtx11extras python3-pyside2.qtxml python3-pyside2.qtxmlpatterns
sudo apt install -y $(apt-cache pkgnames python3-pyside2.) pyside2-tools python-pyside2-doc
sudo apt install -y at-spi2-core
sudo apt-get install -y python3-pyqt5.qtsvg

# sudo sed -i -- "s/#! \/usr\/bin\/python2/#! \/usr\/bin\/python3/g" /usr/bin/pyside2-uic

# sudo pip3 install -U pip setuptools wheel
sudo pip3 install -r ${cur_dir}/requirements.txt --break-system-packages

# # Install watchdog
# echo "dtparam=watchdog=on" | sudo tee -a /boot/firmware/config.txt
# sudo apt-get install -y watchdog

# # Remove everything after and including the line that contains 'watchdog-device'
# sudo sed -i '/watchdog-device/,$d' /etc/watchdog.conf

# echo "watchdog-device = /dev/watchdog" | sudo tee -a /etc/watchdog.conf
# echo "watchdog-timeout = 15" | sudo tee -a /etc/watchdog.conf
# echo "max-load-1 = 400" | sudo tee -a /etc/watchdog.conf
# echo "max-load-5 = 300" | sudo tee -a /etc/watchdog.conf
# echo "max-load-15 = 200" | sudo tee -a /etc/watchdog.conf
# echo "min-memory = 1" | sudo tee -a /etc/watchdog.conf
# echo "allocatable-memory = 1" | sudo tee -a /etc/watchdog.conf
# # File to monitor (Ensure your application touches this file periodically)
# echo "file = /home/$USER/genco.log" | sudo tee -a /etc/watchdog.conf
# # Time in seconds that a file must be changed (default 60)
# echo "change = 300" | sudo tee -a /etc/watchdog.conf
# # Reboot the machine if a problem occurs
# echo "reboot = yes" | sudo tee -a /etc/watchdog.conf

# # Increase GPU memory size
# sudo echo "gpu_mem=256" | sudo tee -a /boot/firmware/config.txt

# Configure UDEV rule for the controller board.
# for now disabling setting of UDEV rules, will do it later
sudo usermod -a -G dialout $USER
sudo usermod -a -G plugdev $USER
sudo bash -c 'cat > /etc/udev/rules.d/99-usb-serial-udev.rules' << EOF
ATTRS{idVendor}=="0483", ATTRS{idProduct}=="5740", MODE:="0666", ENV{ID_MM_DEVICE_IGNORE}="1", ENV{ID_MM_PORT_IGNORE}="1"
EOF
sudo bash -c 'cat > /etc/udev/rules.d/77-mm-usb-device-blacklist.rules' << EOF
ATTRS{idProduct}=="d058", ATTRS{idVendor}=="2b04", MODE="0666", GROUP="plugdev"
EOF
sudo service udev restart

# Clear desktop and install splash service
bash ${cur_dir}/scripts/setup_touch_v2.sh
bash ${cur_dir}/scripts/clear_desktop.sh
bash ${cur_dir}/scripts/install_splash.sh
bash ${cur_dir}/scripts/start.sh
bash ${cur_dir}/scripts/clear_boot.sh
bash ${cur_dir}/scripts/onboard-setup.sh
# Allow port 80 to pi
# don't know use of it, so disabling it for now as well. 
# sudo touch /etc/sysctl.d/50-unprivileged-ports.conf
# echo "net.ipv4.ip_unprivileged_port_start=0" | sudo tee -a /etc/sysctl.d/50-unprivileged-ports.conf
# sudo sysctl --system

# Enable Auto Start
# sudo apt install -y screen
#sudo cp ${cur_dir}/scripts/start.sh /opt/
#sudo sed -i -- "s/DIR/${cur_dir////\\/}/g" /opt/start.sh
#echo "bash /opt/start.sh" | sudo tee -a /etc/xdg/lxsession/LXDE-pi/autostart

# Create token to prevent copycat
# python3 ${cur_dir}/lk/utils/create_token.py

# copy .prod to .env
#sudo cp  ${cur_dir}/LK-Dispense/.env.prod ${cur_dir}/LK-Dispense/.env

sudo systemctl enable watchdog
sudo systemctl restart watchdog

echo "Finished Installation. Please reboot now."
