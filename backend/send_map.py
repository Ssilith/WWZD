from flask import Flask, Response, jsonify, request
from flask_cors import CORS
from config_vectorize import config_vectorize
from utils.identify_columns import identify_columns_with_llm
from utils.load_csv import load_csv
from utils.read_file_and_save import read_file_and_save

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

    errors = validation(data, required_params)

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


@app.route('/upload_file', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "Brak pliku w żądaniu"}), 400

    file = request.files['file']

    if not file.filename.endswith('.csv') and not file.filename.endswith('.xlsx'):
        return jsonify({"error": "Przekazano plik, ktory nie jest plikiem CSV albo XLSX"}), 400

    try:
        read_file_and_save(file)
        return Response(status=200)

    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route('/llm_dialog', methods=['POST'])
def llm_dialog():
    data = request.get_json()

    required_params = {
        "column_names": list[str],
        "messages": list[str],
    }

    # errors = validation(data, required_params)
    #
    # if errors:
    #     return jsonify({"errors": errors}), 400
    try:
        x = identify_columns_with_llm(data["messages"], data["column_names"])
        return jsonify(x), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/get_column_by_index', methods=['POST'])
def get_column_by_index():

    data = request.get_json()

    required_params = {
        "index": int,
        "column_name": str,
    }
    errors = validation(data, required_params)

    if errors:
        return jsonify({"errors": errors}), 400

    try:
        dataframe, column_letters, column_names = load_csv(filepath)
        column_data = dataframe.loc[data["index"], data["column_name"]]

    except Exception as e:
        return jsonify({"error": str(e)}), 400

    return jsonify({
        "column_data": column_data
    })


def validation(data, required_params):
    errors = []
    for param, expected_types in required_params.items():
        if param not in data:
            errors.append(f"Brak parametru: {param}")
        elif not isinstance(data[param], expected_types):
            errors.append(
                f"Nieprawidłowy typ parametru: {param}. Oczekiwano {expected_types}, otrzymano {type(data[param]).__name__}")
    return errors


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
