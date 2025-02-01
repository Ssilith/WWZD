from config import HEADERS, VECTORIZE_URL
import umap.umap_ as umap
import requests
from multiprocessing import Pool, cpu_count, Lock
import csv
from tqdm import tqdm
import os
import json

from utils.load_csv import load_csv

vectorize_model = os.getenv("VECTORIZE_MODEL", "sbert-klej-cdsc-r")
lock = Lock()


def multithread_vectorize(dataframe, data_col, metadata_col, neighbours, min_distance, max_cores=1, batch_size=200):
    batch_size = 200 if batch_size > 200 else batch_size
    data_list = dataframe[data_col].apply(str).tolist()
    metadata_list = dataframe[metadata_col].apply(str).tolist()
    metadata_without_repeats_list = list(set(metadata_list))
    # num_processes = min(max_cores, cpu_count())
    num_processes = 1

    with open("files/vector_metadata.csv", mode="w", newline="", encoding="utf-8") as file:
        writer = csv.writer(file, delimiter=";")
        writer.writerow(["index", "embedding", "data", "metadata", "metadata_number"])

    tasks = []
    number_of_tasks = (len(data_list) // batch_size) + (0 if len(data_list) % batch_size == 0 else 1)
    offset = 0
    for i in range(number_of_tasks):
        tasks.append((data_list, metadata_list, offset, batch_size, metadata_without_repeats_list))
        offset += batch_size

    with Pool(
            processes=num_processes,
    ) as pool:
        for _ in tqdm(pool.imap_unordered(process_batch_with_args, tasks), total=len(tasks)):
            pass
    dataframe_embedding, column_letters_embedding, column_names__embedding = load_csv("files/vector_metadata.csv")
    embedding_list = dataframe_embedding["embedding"].apply(json.loads).tolist()
    final_data = dataframe_embedding["data"].apply(str).tolist()
    final_metadata = dataframe_embedding["metadata"].apply(str).tolist()
    final_index = dataframe_embedding["index"].apply(str).tolist()
    final_metadata_number = dataframe_embedding["metadata_number"].apply(str).tolist()
    umap_data = umap_transformer(embedding_list, neighbours, min_distance)

    combined_list = []
    for i in range(len(final_index)):
        x, y = umap_data[i]
        x = float(x)
        y = float(y)
        combined_list.append([
            final_index[i],
            final_data[i],
            final_metadata[i],
            final_metadata_number[i],
            x,
            y
        ])
    return combined_list


def process_batch_with_args(args):
    return process_batch(*args)


def process_batch(data, metadata, offset, batch_size, metadata_without_repeats_list):
    print(f"Watek rozpoczal dzialanie offset:  ${offset}")
    task_data = data[offset:offset + batch_size]
    task_metadata = metadata[offset:offset + batch_size]

    payload = {
        "application": "similarity",
        "task": vectorize_model,
        "input": task_data,
    }
    response = requests.post(VECTORIZE_URL, headers=HEADERS, json=payload)
    if response.status_code == 200:
        embeddings = response.json()
        size_of_response = len(embeddings)
        if size_of_response != len(task_data):
            raise Exception("Wrong size of response, something went wrong with Embedding API")

        index_of_metadata_list = get_index_of_metadata_list(task_metadata, metadata_without_repeats_list,
                                                            size_of_response)
        combined_data = combine_data(embeddings, task_data, task_metadata, index_of_metadata_list, offset)
        write_to_csv(combined_data)
        print(f"Watek skonczyl dzialanie offset:  ${offset}")

    else:
        raise Exception(f"Error with API request: {response.json()}")


def write_to_csv(data):
    with lock:
        with open("files/vector_metadata.csv", 'a', newline="", encoding="utf-8") as file:
            writer = csv.writer(file, delimiter=";")
            for row in data:
                writer.writerow(row)


# def umap_transformer(vectors):
#     reducer = umap.UMAP(n_neighbors=15, min_dist=0.1, n_components=2, random_state=42)
#     return reducer.fit_transform(vectors)
def umap_transformer(vectors, n_neighbors=5, min_dist=0.05, n_components=2, random_state=42):
    reducer = umap.UMAP(
        n_neighbors=n_neighbors,
        min_dist=min_dist,
        n_components=n_components,
        random_state=random_state
    )
    return reducer.fit_transform(vectors)


def combine_data(embedding, data, metadata, index_of_metadata_set, offset):
    combined_data = []
    for i in range(len(embedding)):
        combined_data.append([i + offset])
        combined_data[i].append(embedding[i])
        combined_data[i].append(data[i][0:25])
        combined_data[i].append(metadata[i][0:25])
        combined_data[i].append(index_of_metadata_set[i])
    return combined_data


def get_index_of_metadata_list(metadata, metadata_without_repeats, batch_size):
    index_of_metadata_list = []
    for i in range(batch_size):
        index = metadata_without_repeats.index(metadata[i])
        index_of_metadata_list.append(index)
    return index_of_metadata_list
