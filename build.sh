#!/bin/bash

sudo -S systemctl stop python-image-editor
cd ~/python-image-editor
unset GIT_DIR
git pull
source env/bin/activate
pip3 install -r requirements.txt
deactivate
cd ~/
sudo -S systemctl start python-image-editor
