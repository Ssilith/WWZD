from flask import Flask, Response
from multiprocessing import Process, Lock, Queue
import json

from main import init_fun

app = Flask(__name__)

def generate_batches(queue):
    while True:
        batch = queue.get()
        if batch is None:
            break
        yield json.dumps(batch) + "\n"

@app.route('/umap_data')
def stream_batch():
    queue = Queue()
    lock = Lock()

    p = Process(target=init_fun, args=(queue, lock))
    p.start()

    return Response(generate_batches(queue), content_type='application/json')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)