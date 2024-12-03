import csv

from utils.load_csv import load_csv
from utils.identify_columns import (
    identify_columns_with_llm,
    identify_columns_hardcoded,
)
from utils.multithread_vectorize import multithread_vectorize
from utils.vectorize import vectorize


def main():
    filepath = "files/libcon_annotated (1).xlsx"
    dataframe, column_letters, column_names = load_csv(filepath)
    print(len(dataframe["comment"].tolist()))
    print("Choose your method:")
    print("1. Use LLM")
    print("2. Use Hardcoded Questions")

    choice = input("Enter your choice (1 or 2): ")

    if choice == "1":
        # LLM
        result = identify_columns_with_llm(column_letters, column_names)
        print("Identified Columns:", result)
    elif choice == "2":
        # hardcoded questions
        result = identify_columns_hardcoded(column_letters, column_names)
        print("Identified Columns:", result)
    else:
        print("Invalid choice! Please enter 1 or 2.")
        return

    data_col = result["data_column"]
    metadata_col = result["metadata_column"]

    data_col_name = column_names[ord(data_col) - ord("A")]
    metadata_col_name = column_names[ord(metadata_col) - ord("A")]

    # vectorized_result = vectorize(data_col_name, metadata_col_name, dataframe)
    vectorized_result = multithread_vectorize(data_col_name, metadata_col_name, dataframe)


if __name__ == "__main__":
    main()
