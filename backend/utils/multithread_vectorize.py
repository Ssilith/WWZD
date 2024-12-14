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
    batch_size = 200 if batch_size > 200 else batch_size
    data_list = dataframe[data_col].apply(str).tolist()
    metadata_list = dataframe[metadata_col].apply(str).tolist()
    metadata_without_repeats_list = list(set(metadata_list))
    # num_processes = min(max_cores, cpu_count())
    num_processes = 1

    with open("files/vector_metadata.csv", mode="w", newline="", encoding="utf-8") as file:
        csv.writer(file, delimiter=";")

    tasks = []
    number_of_tasks = (len(data_list) // batch_size) + (0 if len(data_list) % batch_size == 0 else 1)
    offset = 0
    for i in range(number_of_tasks):
        tasks.append((data_list, metadata_list, offset, batch_size, metadata_without_repeats_list))
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


def process_batch(data, metadata, offset, batch_size, metadata_without_repeats_list):
    global lock
    global queue
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
        combined_data = combine_data(embeddings, task_data, task_metadata, index_of_metadata_list)
        # combined_data = combine_umap_with_data(umap_data, data, offset)
        # queue.put(combined_data)
        write_to_csv(lock, combined_data)
        print(f"Watek skonczyl dzialanie offset:  ${offset}")

    else:
        raise Exception(f"Error with API request: {response.json()}")


def write_to_csv(lock, data):
    with lock:
        with open("files/vector_metadata.csv", 'a', newline="", encoding="utf-8") as file:
            writer = csv.writer(file, delimiter=";")
            print(data[0])
            for row in data:
                writer.writerow(row)
                # for index, embedding, data, metadata, index_of_metadata in data:
                # writer.writerow([index, embedding, data, metadata, index_of_metadata])


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


def combine_data(embedding, data, metadata, index_of_metadata_set):
    combined_data = []
    for i in range(len(embedding)):
        combined_data.append([i])
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
