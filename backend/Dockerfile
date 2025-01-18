FROM python:3.11

ENV PYTHONUNBUFFERED=1
#ENV API_KEY=
ENV BATCH_SIZE=200
ENV MAX_CORES=32
ENV VECTORIZE_MODEL=bge-m3

WORKDIR /

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["python", "send_map.py"]