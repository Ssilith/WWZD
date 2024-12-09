import csv
from asyncio import sleep
from multiprocessing import Manager
import os
from utils.load_csv import load_csv
from utils.identify_columns import (
    identify_columns_with_llm,
    identify_columns_hardcoded,
)
from utils.multithread_vectorize import multithread_vectorize
from utils.vectorize import vectorize

batch_size = int(os.getenv("BATCH_SIZE", 200))
max_cores = int(os.getenv("MAX_CORES", 100))

def init_fun(queue, lock):
    filepath = "files/libcon_annotated (1).xlsx"
    dataframe, column_letters, column_names = load_csv(filepath)
    data_col = 'F'
    metadata_col = 'G'
    data_col_name = column_names[ord(data_col) - ord("A")]
    metadata_col_name = column_names[ord(metadata_col) - ord("A")]

    multithread_vectorize(
        data_col_name,
        metadata_col_name,
        dataframe,
        queue,
        lock,
        max_cores,
        batch_size
    )

    # print(len(dataframe["comment"].tolist()))
    # print("Choose your method:")
    # print("1. Use LLM")
    # print("2. Use Hardcoded Questions")
    #
    # choice = input("Enter your choice (1 or 2): ")

    # if choice == "1":
    #     # LLM
    #     result = identify_columns_with_llm(column_letters, column_names)
    #     print("Identified Columns:", result)
    # elif choice == "2":
    # hardcoded questions
    # result = identify_columns_hardcoded(column_letters, column_names)
    # print("Identified Columns:", result)
    # else:
    #     print("Invalid choice! Please enter 1 or 2.")
    #     return

    # data_col = result["data_column"]

    # vectorized_result = vectorize(data_col_name, metadata_col_name, dataframe)

# if __name__ == "__main__":
#     manager = Manager()
#     main(manager.Queue(), manager)
