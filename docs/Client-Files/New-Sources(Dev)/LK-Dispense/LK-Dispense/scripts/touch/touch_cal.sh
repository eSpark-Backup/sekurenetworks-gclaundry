#!/usr/bin/bash
out_file=/usr/local/bin/touch_service_out.txt
xenv="env DISPLAY=:0 XAUTHORITY=/home/sekure/.Xauthority"

# Log that the script is running
echo running > $out_file

echo $USER

# Delay the execution for 1 second
sleep 1

# Set the Coordinate Transformation Matrix for the touch device
$xenv xrandr --output DSI-1 --rotate left
$xenv xinput set-prop "pointer:1-0014 Goodix Capacitive TouchScreen" "Coordinate Transformation Matrix" -1 0 1 0 -1 1 0 0 1

# Indicate that the operation is finished
echo finished >> $out_file