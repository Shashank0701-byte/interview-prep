FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies needed for chromadb and sentence-transformers
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential \
        curl \
        && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy requirements first for better layer caching
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt && \
    pip cache purge

# Copy the rest of the application
COPY . .

# Create a non-root user and grant ownership of application files
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app

# The service starts on port 8001 (see start_rag_service.py)
EXPOSE 8001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl --fail http://localhost:8001/health || exit 1

# Switch to non-root user
USER appuser

CMD ["python", "start_rag_service.py"]
