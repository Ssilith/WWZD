from config import HEADERS, VECTORIZE_URL
from openpyxl.utils import get_column_letter
import requests
import pandas as pd
import csv
import os

vectorize_model = os.getenv("VECTORIZE_MODEL", "sbert-klej-cdsc-r")


def vectorize(data_col, metadata_col, dataframe, max_length=512):
    data = dataframe[data_col].tolist()
    metadata = dataframe[metadata_col].tolist()

    payload = {
        "application": "similarity",
        "task": vectorize_model,
        "input": data,
    }

    response = requests.post(VECTORIZE_URL, headers=HEADERS, json=payload)

    if response.status_code == 200:
        vectorized_data = response.json()
        print("Data was vectorized.")

        if len(vectorized_data) != len(metadata):
            if len(metadata) < len(vectorized_data):
                metadata.extend([""] * (len(vectorized_data) - len(metadata)))
            else:
                metadata = metadata[: len(vectorized_data)]

        with open(
                "files/vector_metadata.csv", mode="w", newline="", encoding="utf-8"
        ) as file:
            writer = csv.writer(file, delimiter=";")
            for vector, meta in zip(vectorized_data, metadata):
                writer.writerow([vector, meta])
        print("Results saved to 'vectorized_results.csv'.")
    else:
        raise Exception(f"Error with API request: {response.json()}")
