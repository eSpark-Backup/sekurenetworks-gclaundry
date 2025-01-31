#!/bin/bash


# Remove login prompt
sudo systemctl disable getty@tty1 #success

# Disable booting logo and messages
echo "disable_splash=1" | sudo tee -a /boot/firmware/config.txt
sudo systemctl mask plymouth-start.service
sudo sed -i -- "s/$/ logo.nologo quiet loglevel=3 vt.global_cursor_default=0 systemd.show_status=0 plymouth.ignore-serial-consoles plymouth.enable=0 consoleblank=0/" /boot/firmware/cmdline.txt
sudo sed -i -- "s/console=tty1/console=tty3/g" /boot/firmware/cmdline.txt

# Disable some services to reduce booting time
#sudo systemctl disable hciuart
echo "boot_delay=0" | sudo tee -a /boot/firmware/config.txt
#echo "hdmi_force_hotplug=1" | sudo tee -a /boot/firmware/config.txt



cur_dir="$( cd "$(dirname "$0")" ; pwd -P )"

# change theme https://raspberrypi.stackexchange.com/questions/68071/how-to-remove-all-and-by-all-i-really-mean-all-text-in-plymouth-boot
sudo plymouthd

######tested above it.
sudo plymouth-set-default-theme joy
#sudo plymouth --show-splash # this one is hanging it.
sudo plymouth quit #success

sudo mv /usr/share/plymouth/themes/joy/background.png /usr/share/plymouth/themes/joy/_background.png
sudo mv /usr/share/plymouth/themes/joy/debian_logo.png /usr/share/plymouth/themes/joy/_debian_logo.png

sudo cp ${cur_dir}/../scripts/joy.script /usr/share/plymouth/themes/joy/joy.script
sudo update-initramfs -c -k $(uname -r) #success
