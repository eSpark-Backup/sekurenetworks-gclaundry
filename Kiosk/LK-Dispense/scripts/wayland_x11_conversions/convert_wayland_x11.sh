#!/bin/bash

LIGHTDM_CONF="/etc/lightdm/lightdm.conf"

# Check if lightdm.conf exists
if [ -f "$LIGHTDM_CONF" ]; then
    echo "Checking current LightDM configuration..."

    # Check if the system is already using X11
    if grep -q 'greeter-session=pi-greeter' "$LIGHTDM_CONF" && \
       grep -q 'user-session=LXDE-pi-x' "$LIGHTDM_CONF" && \
       grep -q 'autologin-session=LXDE-pi-x' "$LIGHTDM_CONF"; then
        echo "The system is already using X11. No changes necessary."
    else
        echo "Modifying LightDM configuration to switch from Wayland to X11..."

        # Backup the original lightdm.conf file
        sudo cp "$LIGHTDM_CONF" "${LIGHTDM_CONF}.bak"

        # Replace the greeter-session, user-session, and autologin-session
        sudo sed -i 's/greeter-session=pi-greeter-wayfire/greeter-session=pi-greeter/' "$LIGHTDM_CONF"
        sudo sed -i 's/user-session=LXDE-pi-wayfire/user-session=LXDE-pi-x/' "$LIGHTDM_CONF"
        sudo sed -i 's/autologin-session=LXDE-pi-wayfire/autologin-session=LXDE-pi-x/' "$LIGHTDM_CONF"

        echo "LightDM configuration updated successfully."
    fi
else
    echo "LightDM configuration file not found. Please ensure LightDM is installed."
fi
