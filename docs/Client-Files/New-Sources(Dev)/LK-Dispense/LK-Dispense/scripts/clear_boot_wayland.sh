#!/bin/bash
##### This is specially for wayland #####
cur_dir="$( cd "$(dirname "$0")" ; pwd -P )"

# change theme https://raspberrypi.stackexchange.com/questions/68071/how-to-remove-all-and-by-all-i-really-mean-all-text-in-plymouth-boot
sudo plymouthd
sudo plymouth-set-default-theme joy
sudo plymouth --show-splash
sudo plymouth quit

sudo mv /usr/share/plymouth/themes/joy/background.png /usr/share/plymouth/themes/joy/_background.png
sudo mv /usr/share/plymouth/themes/joy/debian_logo.png /usr/share/plymouth/themes/joy/_debian_logo.png

sudo cp ${cur_dir}/../scripts/joy.script /usr/share/plymouth/themes/joy/joy.script
sudo update-initramfs -c -k $(uname -r)