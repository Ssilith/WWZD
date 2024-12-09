# Wizualizacja Wielkich Zbiorów Danych

**Opis projektu:**

Celem projektu jest stworzenie interaktywnej wizualizacji 2D tekstów o jednakowej długości, pobranych z pliku CSV, przy użyciu Reacta. Aplikacja internetowa umożliwi użytkownikom dodawanie plików CSV, które po przetworzeniu zostaną zwizualizowane wraz z odpowiednimi metadanymi. Komunikacja z użytkownikiem będzie się odbywać na dwa sposoby, tak aby móc porównać obydwa rozwiązania. Pierwszy sposób będzie się opierał na komunikacji za pomocą LLM, natomiast drugi będzie uwzględniał zahardcodowane pytania do użytkownika.

## Skład zespołu:
- Jakub Budziło 259069
- Julia Gościniak 259164
- Katarzyna Hajduk 259189

**Dockerfile:**
- docker build -t flask-backend .
- docker run -d --name backend -p 5000:5000 flask-backend
