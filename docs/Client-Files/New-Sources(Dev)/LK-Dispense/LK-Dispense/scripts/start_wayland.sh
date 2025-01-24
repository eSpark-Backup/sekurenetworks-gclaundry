#screen -mS lk -d
#screen -S lk -X stuff "cd DIR\\r"
#screen -S lk -X stuff "python genco.py\\r"

#cur_dir="$( cd "$(dirname "$0")" ; pwd -P )"
#python ${cur_dir}/genco.py
##### This is specially for wayland #####
# File path
file_path="/home/$USER/.config/wayfire.ini"

# Use sed to remove content between [autostart] and the next [section]
sed -i '/^\[autostart\]/,/^\[.*\]/d' "$file_path"

# Target line to append after
target_line="command_hide_taskbar=sudo pkill wf-panel-pi"

# Use sed to append the lines after the target line
sed -i "/$target_line/a\[autostart]\nxdg-autostart = lxsession-xdg-autostart\napp = python -u ~/LK-Dispense/genco.py > ~/genco.log 2>&1\nscreensaver = false\ndpms = false" "$file_path"
