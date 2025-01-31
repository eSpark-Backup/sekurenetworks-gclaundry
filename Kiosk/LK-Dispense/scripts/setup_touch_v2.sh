#!/bin/bash
echo "Setting up touch configuration service..."

cur_dir="$( cd "$(dirname "$0")" ; pwd -P )"

# Copy the touch_cal.sh script from the repo to /usr/local/bin
sudo cp ${cur_dir}/../scripts/touch/touch_cal.sh /usr/local/bin/touch_cal.sh
sudo cp ${cur_dir}/../scripts/wayland_x11_conversions/convert_wayland_x11.sh /usr/local/bin/convert_wayland_x11.sh

# Set the permissions for the script

sudo chmod +x /usr/local/bin/touch_cal.sh
echo "/usr/local/bin/touch_cal.sh" | sudo tee -a /etc/xdg/lxsession/LXDE-pi/autostart
sudo chmod +x /usr/local/bin/convert_wayland_x11.sh

# Converts wayland to x11 in lightdm
/usr/local/bin/convert_wayland_x11.sh

# Copy the invert_touchscreen.service from the repo to /etc/systemd/system/
sudo cp ${cur_dir}/../scripts/touch/invert_touchscreen.service /etc/systemd/system/invert_touchscreen.service

# Reload systemd to recognize the new service
sudo systemctl daemon-reload

# Enable and start the service
sudo systemctl enable invert_touchscreen
sudo systemctl start invert_touchscreen

echo "Touch configuration setup complete."
