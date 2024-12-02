from fileinput import filename

from config import HEADERS, VECTORIZE_URL
import requests
from tqdm import tqdm
from multiprocessing import Pool, cpu_count, Lock, Manager
import csv


def multithread_vectorize(data_col, metadata_col, dataframe, max_length=512, batch_size=200):
    data = dataframe[data_col].tolist()
    metadata = dataframe[metadata_col].tolist()
    num_processes = cpu_count()
    tasks = []

    #override file
    with open(
            "files/vector_metadata.csv", mode="w", newline="", encoding="utf-8"
    ) as file:
        writer = csv.writer(file, delimiter=";")

    with Manager() as manager:
        lock = manager.Lock()
        number_of_tasks = (len(data) // batch_size + 1)
        offset = 0
        for i in range(number_of_tasks):
            tasks.append((lock, data, metadata, offset, batch_size))
            offset += 200
        # Przetwarzanie równoległe z paskiem postępu
        with Pool(num_processes) as pool:
            for _ in tqdm(pool.imap_unordered(process_batch_with_args, tasks), total=len(tasks)):
                pass


def process_batch_with_args(args):
    process_batch(*args)

def process_batch(lock, data, metadata, offset, batch_size):
    payload = {
        "application": "similarity",
        "task": "sbert-klej-cdsc-r",
        "input": data[offset:offset + batch_size],
    }
    response = requests.post(VECTORIZE_URL, headers=HEADERS, json=payload)
    if response.status_code == 200:
        vectorized_data = response.json()
        print("Data was vectorized.")

        write_to_csv(lock, zip(vectorized_data, metadata[offset:offset + batch_size]))
        print(f"Results saved to 'vectorized_results.csv'. Offset from ${offset}")
    else:
        raise Exception(f"Error with API request: {response.json()}")


def write_to_csv(lock, data):
    with lock:  # Zabezpieczenie dostępu do pliku
        with open("files/vector_metadata.csv", 'a', newline="", encoding="utf-8") as file:
            writer = csv.writer(file, delimiter=";")
            for vector, meta in data:
                writer.writerow([vector, meta])
