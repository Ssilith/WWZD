from config import HEADERS, VECTORIZE_URL
from transformers import AutoTokenizer
from openpyxl.utils import get_column_letter
import requests
import pandas as pd
import csv

tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased")


def vectorize(data_col, metadata_col, dataframe, max_length=512):
    data = dataframe[data_col].tolist()
    metadata = dataframe[metadata_col].tolist()

    encoded_data = tokenizer(
        data,
        max_length=max_length,
        truncation=True,
        padding="max_length",
        return_tensors="pt",
    )

    tokenized_strings = [
        tokenizer.decode(ids, skip_special_tokens=True)
        for ids in encoded_data["input_ids"]
    ]

    payload = {
        "application": "similarity",
        "task": "sbert-klej-cdsc-r",
        "input": tokenized_strings,
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
