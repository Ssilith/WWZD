from flask import Flask, Response
from multiprocessing import Process, Lock, Queue
import json

from main import init_fun

app = Flask(__name__)

def convert_to_named_fields(batch):
    result = []
    for record in batch:
        result.append({
            "id": record[0],
            "x": record[1],
            "y": record[2],
            "text": record[3]
        })
    return result

def generate_batches(queue):
    yield '{ "data": ['
    batch = queue.get()
    if batch is None:
        yield ']}'
        return
    yield json.dumps(convert_to_named_fields(batch))[1:-1]
    while True:
        batch = queue.get()
        if batch is None:
            break
        yield ","
        yield json.dumps(convert_to_named_fields(batch))[1:-1]
    yield ']}'


@app.route('/umap_data')
def stream_batch():
    queue = Queue()
    lock = Lock()

    p = Process(target=init_fun, args=(queue, lock))
    p.start()

    return Response(generate_batches(queue), content_type='application/json')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)