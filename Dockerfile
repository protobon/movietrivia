FROM python:3
WORKDIR /usr/src/
COPY requirements.txt /usr/src/

RUN pip3 install -r requirements.txt

COPY . /usr/src/
# CMD python3 app.py
CMD gunicorn --bind 0.0.0.0:5000 -w 10 app:app