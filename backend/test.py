from utils.identify_columns import identify_columns_with_llm
from utils.load_csv import load_csv

filepath = "files/libcon_annotated.csv"

dataframe, column_letters, column_names = load_csv(filepath)
result = identify_columns_with_llm(column_letters, column_names)