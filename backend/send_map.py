from flask import Flask, Response, jsonify, request
from flask_cors import CORS
from config_vectorize import config_vectorize
from utils.load_csv import load_csv

app = Flask(__name__)
CORS(app)

filepath = "files/libcon_annotated.csv"


@app.route('/umap_data', methods=['POST'])
def stream_batch():
    data = request.get_json()

    required_params = {
        "data_column": str,
        "metadata_column": str,
        "neighbours": (int, float),
        "min_distance": (int, float)
    }

    errors = []
    for param, expected_types in required_params.items():
        if param not in data:
            errors.append(f"Brak parametru: {param}")
        elif not isinstance(data[param], expected_types):
            errors.append(
                f"Nieprawidłowy typ parametru: {param}. Oczekiwano {expected_types}, otrzymano {type(data[param]).__name__}")

    if errors:
        return jsonify({"errors": errors}), 400

    dataframe, column_letters, column_names = load_csv(filepath)

    # if data["data_column"] not in column_names or data["metadata_column"] not in column_names:
    if any(col not in column_names for col in [data["data_column"], data["metadata_column"]]):
        return jsonify({"errors": "column does not exist in file"}), 400

    combined_list = config_vectorize(dataframe, data["data_column"], data["metadata_column"], data["neighbours"],
                                     data["min_distance"])

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


@app.route('/get_columns')
def get_columns():
    dataframe, column_letters, column_names = load_csv(filepath)

    return jsonify({"column_names": column_names})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
