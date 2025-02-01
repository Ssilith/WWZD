import pandas as pd


def read_file_and_save(file):
    try:
        if file.filename.endswith(".csv"):
            df = pd.read_csv(file, sep=";")
        elif file.filename.endswith(".xlsx"):
            df = pd.read_excel(file, sheet_name=0)
        else:
            raise ValueError(f"Cannot read file")
        print(df.columns)

        output_file = "files/libcon_annotated.csv"

        df.to_csv(output_file, sep=';', index=False)

    except Exception as e:
        raise ValueError(f"Blad podczas przetwarzania pliku: {str(e)}")
