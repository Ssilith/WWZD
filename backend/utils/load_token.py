import json


def load_token():
    try:
        with open("files/token.json", "r") as f:
            return json.load(f)["api_token"]
    except FileNotFoundError:
        raise Exception("token.json file not found.")
    except KeyError:
        raise Exception("API token not found in token.json.")
    except json.JSONDecodeError:
        raise Exception("Error parsing token.json.")
