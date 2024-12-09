from utils.load_token import load_token
import os

API_TOKEN = os.getenv("API_KEY",load_token())

HEADERS = {
    "Authorization": f"Bearer {API_TOKEN}",
    "accept": "application/json",
    "Content-Type": "application/json",
}

CHAT_COMPLETION_URL = "https://services.clarin-pl.eu/api/v1/oapi/chat/completions"

VECTORIZE_URL = "https://services.clarin-pl.eu/api/v1/tasks/sent/"
