# this is reference file 

#install onboard
sudo apt install onboard -y
# isntall gsettings
#sudo apt install gsettings -y



# in order to make this work this command is required 
#chmod +x '[this file name]'

# set auto apear with interaction 
gsettings set org.onboard.auto-show enabled true

# to stop movements
gsettings set org.onboard.window window-handles ''


# layout to phone for alpha numeric and no ctrl and window etc
gsettings set org.onboard layout 'Phone'

# disable some buttom 
gsettings set org.onboard.lockdown disable-preferences true
gsettings set org.onboard.lockdown disable-quit true
# gsettings set org.onboard.show-tooltips false

# set size 
gsettings set org.onboard.window.landscape width 1280
gsettings set org.onboard.window.landscape height 300

#xy
gsettings set org.onboard.window.landscape x 0
gsettings set org.onboard.window.landscape y 500

#setting theme 
gsettings set org.onboard.theme-settings color-scheme '/usr/share/onboard/themes/Granite.colors'

gsettings set org.onboard.theme-settings key-label-font '~/LK-Dispense/assets/OwnersXNarrow-Black.ttf'


