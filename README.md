# python-image-editor
Experimental, WIP web app for playing around with python's Wand library. Allows users to upload images and create their own unique composites out of them by leveraging Wand's Drawing API + composite operators. Built with FastAPI.

https://python-image-editor.herokuapp.com

![alt text](./examples/comp.png)

## Setup
1. git clone
2. python3 -m venv env
3. source env/bin/activate
4. pip install -r requirements.txt
5. uvicorn main:app --reload
