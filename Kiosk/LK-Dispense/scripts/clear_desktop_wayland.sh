#!/bin/bash
# https://forums.raspberrypi.com/viewtopic.php?t=358285#p2176499
# hide mouse in Wayland Raspberry Pi OS
cur_dir="$( cd "$(dirname "$0")" ; pwd -P )"

##### This is specially for wayland #####
#install interception-tools and hideaway
sudo apt install -y interception-tools interception-tools-compat
sudo apt install -y cmake
cd ~
git clone https://gitlab.com/interception/linux/plugins/hideaway.git
cd hideaway
cmake -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build
sudo cp ~/hideaway/build/hideaway /usr/bin
sudo chmod +x /usr/bin/hideaway

#config file setup for hideaway
cd ~
# wget https://raw.githubusercontent.com/ugotapi/wayland-pagepi/main/config.yaml
sudo cp ${cur_dir}/../scripts/config.yaml /etc/interception/udevmon.d/config.yaml
sudo systemctl restart udevmon


##### This is specially for wayland #####
# disable topbar start in wayfire
file_path="/etc/wayfire/defaults.ini"
target_line="autostart0 = wfrespawn wf-panel-pi"

# Use sed to find and modify the line
sudo sed -i "s/^$target_line/# $target_line/" "$file_path"

#THIS GOES THIS INTO WAYFIRE.INI
#to see top bar hit super key and Enter to kill superkey and x
# binding_show_taskbar=<super> KEY_ENTER
#command_show_taskbar=wf-panel-pi
#binding_hide_taskbar=<super> KEY_X
#command_hide_taskbar=sudo pkill wf-panel-pi

# File path
file_path="/home/$USER/.config/wayfire.ini"

# Target line to append after
target_line="command_power = pwrkey"

# Use sed to append the lines after the target line
sed -i "/$target_line/a\binding_show_taskbar=<super> KEY_ENTER\ncommand_show_taskbar=wf-panel-pi\nbinding_hide_taskbar=<super> KEY_X\ncommand_hide_taskbar=sudo pkill wf-panel-pi" "$file_path"


# File path
file_path="/etc/wayfire/defaults.ini"

# Text string to remove decorations on windows
text_to_remove="pixdecor"

# Use sed to remove the text string
sudo sed -i "s/$text_to_remove//g" "$file_path"

# clear desktop items
sudo cp ${cur_dir}/../scripts/desktop-items-0.conf /etc/xdg/pcmanfm/LXDE-pi/desktop-items-0.conf


# previous scripts start from here

# Remove SSH warning
sudo apt purge -y libpam-chksshpwd

# Remove login prompt
sudo systemctl disable getty@tty1

# Disable some services to reduce booting time
sudo systemctl disable hciuart
echo "boot_delay=0" | sudo tee -a /boot/firmware/config.txt
echo "hdmi_force_hotplug=1" | sudo tee -a /boot/firmware/config.txt
echo "disable_splash=1" | sudo tee -a /boot/firmware/config.txt

# Hide mouse cursor
sudo sed -i -- "s/#xserver-command=X/xserver-command=X -nocursor/" /etc/lightdm/lightdm.conf
# another solution to hide at the time of boot. No elegant but works
sudo mv /usr/share/icons/PiXflat/cursors/left_ptr /usr/share/icons/PiXflat/cursors/left_ptr_bak


# Disable screen saver
echo "xset s off" | sudo tee -a /etc/xdg/lxsession/LXDE-pi/autostart
echo "@xset s noblank" | sudo tee -a /etc/xdg/lxsession/LXDE-pi/autostart
echo "xset -dpms" | sudo tee -a /etc/xdg/lxsession/LXDE-pi/autostart

# Set wallpaper
sudo cp ${cur_dir}/../assets/splash.jpg /usr/share/rpd-wallpaper/fisherman.jpg

# Disable welcome wizard
#sudo rm /etc/xdg/autostart/piwiz.desktop
