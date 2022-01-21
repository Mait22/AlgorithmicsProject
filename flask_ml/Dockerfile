FROM python:3.8-slim-buster

WORKDIR /flask_ml

COPY requirements.txt requirements.txt

## Conteiner stuff
RUN pip3 install -r requirements.txt

## ML stuff
RUN pip3 install tensorflow && \
    pip3 install numpy \
        pandas \
        sklearn \
        matplotlib \
        seaborn \
        pyyaml \
        h5py && \
    pip3 install keras --no-deps && \
    pip3 install opencv-python && \
    pip3 install imutils && \
    pip3 install celery && \
    pip3 install flask-cors

COPY . .

CMD [ "python3", "-m" , "flask", "run", "--host=0.0.0.0"]