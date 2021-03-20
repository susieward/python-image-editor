#!/bin/bash

systemctl stop python-image-editor
cd ~/python-image-editor
git pull
source env/bin/activate
pip3 install -r requirements.txt
deactivate
cd ~/
systemctl start python-image-editor
