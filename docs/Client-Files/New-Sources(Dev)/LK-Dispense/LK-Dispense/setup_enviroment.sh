#!/bin/bash
#Place all setup scripts this will run on every OTA and setup

#install onboard
sudo apt install onboard -y && \

# delete autstarter
sudo rm /etc/xdg/autostart/onboard-autostart.desktop 
# copy onboard-autostart.desktop to /etc/xdg/autostart/onboard-autostart.desktop
sudo cp "$HOME/LK-Dispense/onboard-autostart.desktop"  /etc/xdg/autostart/onboard-autostart.desktop
# make it Executable
sudo chmod +x /etc/xdg/autostart/onboard-autostart.desktop

#making dir for config
mkdir -p "$HOME/.config/onboard/"

# cp source to destination
cp "$HOME/LK-Dispense/onboard_settings.conf" "$HOME/.config/onboard/onboard-defaults.conf"

# use `dconf reset /org/onboard/` to reset dconf registry 
#dconf reset -f /org/onboard/

#now use the app (reboot required)