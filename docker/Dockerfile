# Dockerfile.dev
FROM python:3.11-slim

WORKDIR /app

# Install minimal dependencies
COPY requirements-dev.txt .
RUN pip install --no-cache-dir -r requirements-dev.txt

# Copy code
COPY . .

# Run with mock mode
CMD ["uvicorn", "api.app:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]