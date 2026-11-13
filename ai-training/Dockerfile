# syntax=docker/dockerfile:1.7
# ============================================================
# AI / RAG Service — Python FastAPI
#
# Two-layer dependency strategy:
#   STAGE base-deps  — heavy, rarely-changing packages
#                      (torch, sentence-transformers, chromadb)
#                      Rebuilds only when requirements-base.txt changes.
#   STAGE app        — fast-changing app deps + source code
#                      Cache-hit on every normal feature PR.
#
# This cuts the AI Docker build from ~35 min → ~5 min on cache hits.
# ============================================================

# ── Stage 1: heavy base dependencies ────────────────────────
FROM python:3.12-slim AS base-deps

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=off \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# System packages needed by chromadb and sentence-transformers
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential \
        curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user early so COPY --chown works in every stage
RUN useradd -m -u 1000 appuser

# CPU-only PyTorch — download from the CPU index to avoid the
# 2.5 GB CUDA bundle. Must be installed before sentence-transformers
# which depends on it.
RUN pip install torch --index-url https://download.pytorch.org/whl/cpu

# Heavy compiled packages (chromadb, faiss-cpu, sentence-transformers)
# This layer is rebuilt only when requirements-base.txt changes.
COPY --chown=appuser:appuser requirements-base.txt .
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --prefer-binary -r requirements-base.txt


# ── Stage 2: app dependencies + source ──────────────────────
FROM base-deps AS app

# App-layer deps — change with features, but pip install is fast
# because the heavy deps are already baked into base-deps.
COPY --chown=appuser:appuser requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --prefer-binary -r requirements.txt

# Copy application source last (most frequently changing layer)
COPY --chown=appuser:appuser . .

# The service starts on port 8001 (see start_rag_service.py)
EXPOSE 8001

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl --fail http://localhost:8001/health || exit 1

# Run as non-root
USER appuser

CMD ["python", "start_rag_service.py"]
