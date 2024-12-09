from config import HEADERS, VECTORIZE_URL
import umap.umap_ as umap
import requests
from multiprocessing import Pool, cpu_count
import csv
from tqdm import tqdm
import os

vectorize_model = os.getenv("VECTORIZE_MODEL", "sbert-klej-cdsc-r")
lock = None
queue = None


def init_pool_processes(l, q):
    global lock
    global queue
    lock = l
    queue = q


def multithread_vectorize(data_col, metadata_col, dataframe, q, l, max_cores, batch_size=200):
    data = dataframe[data_col].tolist()
    metadata = dataframe[metadata_col].tolist()
    num_processes = min(max_cores, cpu_count())

    with open("files/vector_metadata.csv", mode="w", newline="", encoding="utf-8") as file:
        csv.writer(file, delimiter=";")

    tasks = []
    number_of_tasks = (len(data) // batch_size) + (0 if len(data) % batch_size == 0 else 1)
    offset = 0
    for i in range(number_of_tasks):
        tasks.append((data, metadata, offset, batch_size))
        offset += batch_size

    with Pool(
            processes=num_processes,
            initializer=init_pool_processes,
            initargs=(l, q)
    ) as pool:
        for _ in tqdm(pool.imap_unordered(process_batch_with_args, tasks), total=len(tasks)):
            pass

    q.put(None)


def process_batch_with_args(args):
    return process_batch(*args)


def process_batch(data, metadata, offset, batch_size):
    global lock
    global queue
    print(f"Watek rozpoczal dzialanie offset:  ${offset}")

    payload = {
        "application": "similarity",
        "task": vectorize_model,
        "input": data[offset:offset + batch_size],
    }
    response = requests.post(VECTORIZE_URL, headers=HEADERS, json=payload)
    if response.status_code == 200:
        vectorized_data = response.json()
        umap_data = umap_transformer(vectorized_data).tolist()
        combined_data = combine_umap_with_data(umap_data, data, offset)

        queue.put(combined_data)
        write_to_csv(lock, combined_data)
        print(f"Watek skonczyl dzialanie offset:  ${offset}")

    else:
        raise Exception(f"Error with API request: {response.json()}")


def write_to_csv(lock, data):
    with lock:
        with open("files/vector_metadata.csv", 'a', newline="", encoding="utf-8") as file:
            writer = csv.writer(file, delimiter=";")
            for index, x, y, d in data:
                writer.writerow([index, x, y, d])


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


def combine_umap_with_data(embedding, data, offset):
    for i in range(len(embedding)):
        embedding[i].append(data[offset + i][0:25])
        embedding[i].insert(0, offset + i)
    return embedding
