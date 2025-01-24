#!/bin/bash

cur_dir="$( cd "$(dirname "$0")" ; pwd -P )"

sudo apt install -y unclutter
echo "@unclutter -idle 0" | tee -a ~/.config/lxsession/LXDE-pi/autostart

# Remove SSH warning
sudo apt purge -y libpam-chksshpwd



# Set wallpaper
sudo cp ${cur_dir}/../assets/splash.jpg /usr/share/rpd-wallpaper/fisherman.jpg

# Hide menu bar
sudo sed -i -- "s/@lxpanel --profile LXDE-pi/#@lxpanel --profile LXDE-pi/" /etc/xdg/lxsession/LXDE-pi/autostart

# Clear desktop
sudo sed -i -- "s/show_trash=1/show_trash=0/" /etc/xdg/pcmanfm/LXDE-pi/desktop-items-0.conf
sudo sed -i -- "s/show_mounts=1/show_mounts=0/" /etc/xdg/pcmanfm/LXDE-pi/desktop-items-0.conf
if test -f ~/.config/pcmanfm/LXDE-pi/desktop-items-0.conf; then
  sed -i -- "s/show_trash=1/show_trash=0/" ~/.config/pcmanfm/LXDE-pi/desktop-items-0.conf
  sed -i -- "s/show_mounts=1/show_mounts=0/" ~/.config/pcmanfm/LXDE-pi/desktop-items-0.conf
fi



# Hide mouse cursor
sudo sed -i -- "s/#xserver-command=X/xserver-command=X -nocursor/" /etc/lightdm/lightdm.conf



# Disable screen saver
echo "xset s off" | sudo tee -a /etc/xdg/lxsession/LXDE-pi/autostart
echo "@xset s noblank" | sudo tee -a /etc/xdg/lxsession/LXDE-pi/autostart
echo "xset -dpms" | sudo tee -a /etc/xdg/lxsession/LXDE-pi/autostart
