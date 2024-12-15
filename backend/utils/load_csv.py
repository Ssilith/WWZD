import pandas as pd
from openpyxl.utils import get_column_letter


def load_csv(filepath):
    try:
        if filepath.endswith(".csv"):
            df = pd.read_csv(filepath, sep=";")
        elif filepath.endswith(".xlsx"):
            df = pd.read_excel(filepath)
        else:
            raise ValueError(
                "Unsupported file type. Please provide a .csv or .xlsx file."
            )

        column_names = df.columns.tolist()

        column_letters = [get_column_letter(i + 1) for i in range(len(column_names))]

        return df, column_letters, column_names

    except Exception as e:
        raise Exception(f"Failed to load file: {e}")
