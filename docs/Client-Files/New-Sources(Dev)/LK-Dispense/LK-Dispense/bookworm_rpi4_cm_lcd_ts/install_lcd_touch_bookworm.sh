#!/bin/bash


RED='\033[0;31m'
#BOLDRED='\033[1;4;31m'
BOLDRED='\033[1;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

curr_user=$2
KERNEL_MOD=6.6.35-v8+.tar
KERNEL=kernel8.img
LCD_10=vc4-kms-dsi-mtf101wx25a-v1-overlay.dtbo
LCD_8=vc4-kms-dsi-mtf080wx21a-v1-overlay.dtbo
TOUCH1=gt911_i5d.dtbo
TOUCH2=gt911_i14.dtbo
LCD_NAME=$1
# Path to the wayfire.ini file
config_file="/home/$curr_user/.config/wayfire.ini"
# Specify the configuration data
section="[output:DSI-1]"
setting="transform = 90"
section_ts_8="[input-device:1-0014 Goodix Capacitive TouchScreen]"
setting_ts_8="output = DSI-1"
section_ts_10="[input-device:1-0014 Goodix Capacitive TouchScreen]"
#section_ts_10="[input-device:1-005d Goodix Capacitive TouchScreen]"
setting_ts_10="output = DSI-1"

help()
{
	echo -e "${YELLOW}Help: $0 <8\" or 10\"lcd> <user> ${NC}"
	echo -e "${YELLOW}Ex for 8\" LCD: $0 8 sekure ${NC}"
	exit 1
}

if [[ $1 == "--help" ]]; then
	help
fi

if [[ $1 == "-h" ]]; then
	help
fi


if (( $EUID != 0 )); then
	echo -e "${RED}Please run as root${NC}"
	exit
fi

if [ "$#" -ne 2 ]; then
	echo -e "${RED}Argument is missing or more${NC}"
	help
fi

if [ ! -f "$KERNEL_MOD" ]; then
	echo -e "${RED}$KERNEL_MOD is not found in current dir!.${NC}"
	exit -1
fi
if [ ! -f "$KERNEL" ]; then
	echo -e "${RED}$KERNEL is not found in current dir!.${NC}"
	exit -1
fi
if [ ! -f "$LCD_10" ]; then
	echo -e "${RED}$LCD_10 is not found in current dir!.${NC}"
	exit -1
fi
if [ ! -f "$LCD_8" ]; then
	echo -e "${RED}$LCD_8 is not found in current dir!.${NC}"
	exit -1
fi
if [ ! -f "$TOUCH1" ]; then
	echo -e "${RED}$TOUCH1 is not found in current dir!.${NC}"
	exit -1
fi
if [ ! -f "$TOUCH2" ]; then
	echo -e "${RED}$TOUCH2 is not found in current dir!.${NC}"
	exit -1
fi


# Install Kernel Module driver
echo -e "${YELLOW}Coping Kernel Modules....${NC}"
tar -xf $KERNEL_MOD -C /lib/modules/

# Install Kernel
echo -e "${YELLOW}Coping Kernel Image....${NC}"
cp -rf $KERNEL /boot/firmware/

# Install LCD dtbo
echo -e "${YELLOW}Coping DTBO....${NC}"
echo "dtoverlay=$LCD_10" | sudo tee -a /boot/firmware/config.txt
echo "dtoverlay=$LCD_8" | sudo tee -a /boot/firmware/config.txt
if [[ "10" == $1 ]]
then
	cp $LCD_10 /boot/overlays
	sed -i -- "s/dtoverlay=$LCD_8/#dtoverlay=$LCD_8/" /boot/firmware/config.txt
else
	cp $LCD_8 /boot/overlays
	sed -i -- "s/dtoverlay=$LCD_10/#dtoverlay=$LCD_10/" /boot/firmware/config.txt
fi

# Install Touch dtbo
cp $TOUCH1 $TOUCH2 /boot/overlays
echo "dtoverlay=$TOUCH1" | sudo tee -a /boot/firmware/config.txt
echo "dtoverlay=$TOUCH2" | sudo tee -a /boot/firmware/config.txt

# Install wayfire package
sudo apt-get install -y wayfire

# Function to append configuration if it doesn't already exist
append_if_missing() {
    if ! grep -q "$1" "$config_file"; then
        echo "$2" >> "$config_file"
    fi
}

# DSI Display Rotation
append_if_missing "\[output:DSI-1\]" "$section"
append_if_missing "transform = 90" "$setting"
echo "" >> "$config_file"

# Touch Screen Rotation
if [[ "10" == $LCD_NAME ]]
then
	append_if_missing "\[input-device:1-0014 Goodix Capacitive TouchScreen\]" "$section_ts_10"
	#append_if_missing "\[input-device:1-005d Goodix Capacitive TouchScreen\]" "$section_ts_10"
	#append_if_missing "output = DSI-1" "$setting_ts_10"
	echo "$setting_ts_10" >> "$config_file"
else
	append_if_missing "\[input-device:1-0014 Goodix Capacitive TouchScreen\]" "$section_ts_8"
	#append_if_missing "output = DSI-1" "$setting_ts_8"
	echo "$setting_ts_8" >> "$config_file"
fi
echo "" >> "$config_file"

# Install KMS Driver
echo -e "${YELLOW}Enable KMS Driver${NC}"
echo "dtoverlay=vc4-kms-v3d" | sudo tee -a /boot/firmware/config.txt
sed -i -- "s/dtoverlay=vc4-fkms-v3d/#dtoverlay=vc4-fkms-v3d/" /boot/firmware/config.txt

echo -e "${GREEN}All done! ${NC}"
