#!/bin/bash

# Define the file path
desktop_file="/etc/xdg/autostart/genco.desktop"

# Create and write content to genco.desktop
sudo tee $desktop_file > /dev/null <<EOL
[Desktop Entry]
Type=Application
Name=Genco
Exec=sh -c 'python -u /home/$USER/LK-Dispense/genco.py'
Terminal=false
EOL

# Set proper permissions for the .desktop file
sudo chmod +x $desktop_file
