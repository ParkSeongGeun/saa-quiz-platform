# ==================== Build Stage ====================
FROM python:3.11-slim AS builder

WORKDIR /app

# 빌드에 필요한 패키지 설치
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gcc \
    libmariadb-dev \
    pkg-config && \
    rm -rf /var/lib/apt/lists/*

# requirements 복사 및 설치
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# ==================== Runtime Stage ====================
FROM python:3.11-slim

WORKDIR /app

# 런타임에 필요한 라이브러리만 설치
RUN apt-get update && \
    apt-get install -y --no-install-recommends libmariadb3 && \
    rm -rf /var/lib/apt/lists/*

# builder stage에서 설치된 Python 패키지 복사
COPY --from=builder /root/.local /root/.local

# 애플리케이션 코드 복사
COPY . .

# PATH에 로컬 bin 추가
ENV PATH=/root/.local/bin:$PATH

# 포트 노출
EXPOSE 8000

# uvicorn으로 실행
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
