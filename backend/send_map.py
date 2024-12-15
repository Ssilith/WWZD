from flask import Flask, Response, jsonify
from multiprocessing import Process, Lock, Queue
import json
from flask_cors import CORS

from main import init_fun

app = Flask(__name__)
CORS(app)


@app.route('/umap_data')
def stream_batch():
    combined_list = init_fun()

    points = []
    for item in combined_list:
        index, data, metadata, metadata_number, x, y = item
        points.append({
            "index": index,
            "data": data,
            "metadata": metadata,
            "metadata_number": metadata_number,
            "x": x,
            "y": y
        })
    return jsonify({"points": points})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
