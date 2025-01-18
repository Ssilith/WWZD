from config import HEADERS, CHAT_COMPLETION_URL
import requests
import re


def identify_columns_with_llm(dialog, existing_columns, columns_names):
        mapping = dict(zip(columns_names, existing_columns))
        messages = [
            {
                f"role": "system",
                f"content": f" From the available columns with names: {mapping}"
                           f" You are discussing with the user about selecting columns from the available options"
                           f" they want to use. They should receive one data_column and one metadata_column"
                           f" from the chosen options. Return the parameters by full name of columns"
                           f" Please respond ONLY AND NOTHING MORE in the following format:"
                           ' {"data_column": data_col, "metadata_column": metadata_col, "text": text}'
                           ' where the parameter text should contain'
                           f" your message to the user, and data_col and metadata_col"
                           f" parameters represent the selected columns from the list,"
                           f" which the user expects to receive by their full names."
                           f"All parameters should be in string format"
                            f"Responses in polish"

            }
        ]
        for i, message in enumerate(dialog):
            if i % 2 == 0:
                messages.append({
                    "role": "user",
                    "content": f"{message}"
                })
            else:
                messages.append({
                    "role": "assistant",
                    "content": f"{message}"
                })

        print(f"Messages:      {messages}")
        payload = {"model": "llama3.3", "messages": messages}

        response = requests.post(CHAT_COMPLETION_URL, headers=HEADERS, json=payload)

        if response.status_code == 200:
            llm_response = response.json()
            # print(f"LLM_RESPONSE:      {llm_response}")
            interpretation_message = llm_response["choices"][0]["message"]["content"]

            try:
                result = eval(interpretation_message)
                data_col = result.get("data_column")
                metadata_col = result.get("metadata_column")
                text_col = result.get("text")
                combined_message = f"data_column: {data_col}, metadata_column: {metadata_col}text: {text_col}"
                dialog.append(combined_message)
            except Exception as e:
                raise Exception(e)

        else:
            raise Exception("Error with chat completion:", response.json())


def identify_columns_hardcoded(existing_columns, columns_names):
    print("Using hardcoded questions.")
    print(f"Available columns: {existing_columns}")
    print(f"Column names: {columns_names}")

    data_question = "Please specify the data column (e.g., 'G'): "
    metadata_question = "Please specify the metadata column (e.g., 'F'): "

    column_mapping = {col.upper(): col for col in existing_columns}
    column_mapping.update(
        {name.lower(): col for name, col in zip(columns_names, existing_columns)}
    )

    column_regex = re.compile(r"[A-Z]", re.IGNORECASE)

    while True:
        user_data_input = input(data_question).strip()
        user_metadata_input = input(metadata_question).strip()

        def extract_column(user_input):
            input_lower = user_input.lower()
            for key in column_mapping.keys():
                if key in input_lower:
                    return column_mapping[key]
            letter_match = column_regex.search(user_input)
            if letter_match:
                return letter_match.group(0).upper()
            return None

        data_col = extract_column(user_data_input)
        metadata_col = extract_column(user_metadata_input)

        if not data_col:
            print("Invalid input for data column! Please enter a valid letter or name.")
            continue

        if not metadata_col:
            print(
                "Invalid input for metadata column! Please enter a valid letter or name."
            )
            continue

        if data_col == metadata_col:
            print(
                "Error: Metadata and data columns must be different! Please specify again."
            )
            continue

        if data_col not in existing_columns or metadata_col not in existing_columns:
            print(
                f"Error: One or both columns are not in the available columns: {existing_columns}"
            )
            continue

        confirm = (
            input(
                f"You have selected data column '{data_col}' and metadata column '{metadata_col}'. Do you confirm? (yes/no): "
            )
            .strip()
            .lower()
        )
        if confirm in ["yes", "y", ""]:
            return {"data_column": data_col, "metadata_column": metadata_col}
        else:
            print("Selection not confirmed. Please specify again.")
