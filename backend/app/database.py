import os
import json
import boto3
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.engine import URL
from dotenv import load_dotenv
from botocore.exceptions import ClientError

# 현재 파일 위치를 기준으로 루트 디렉토리의 .env 파일을 로드합니다.
env_file = os.getenv("ENV_FILE", ".env")
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(base_dir, env_file))

def get_secret():
    secret_name = os.getenv("AWS_SECRET_NAME")
    region_name = os.getenv("AWS_REGION", "ap-northeast-2")

    if not secret_name:
        return {}

    session = boto3.session.Session()
    client = session.client(
        service_name='secretsmanager',
        region_name=region_name
    )

    try:
        get_secret_value_response = client.get_secret_value(
            SecretId=secret_name
        )
        secret = get_secret_value_response['SecretString']
        return json.loads(secret)
    except Exception as e:
        # 시크릿 로드 실패 시 빈 딕셔너리 반환하거나 예외 처리
        print(f"Warning: Could not load secrets from AWS: {e}")
        return {}

def get_connection_url():
    # AWS Secret 데이터 로드 (없으면 빈 dict)
    secret_data = get_secret()
    
    # 우선순위: 환경 변수(os.getenv) > Secrets Manager(secret_data.get) > 기본값
    user = os.getenv("DB_USER") or secret_data.get('username')
    password = os.getenv("DB_PASS") or secret_data.get('password')
    host = os.getenv("DB_HOST") or secret_data.get('host')
    port = os.getenv("DB_PORT") or secret_data.get('port') or 3306
    database = os.getenv("DB_NAME") or secret_data.get('dbname') or secret_data.get('dbInstanceIdentifier')

    return URL.create(
        drivername="mysql+pymysql",
        username=user,
        password=password,
        host=host,
        port=int(port),
        database=database,
        query={"charset": "utf8mb4"},
    )

engine = create_engine(get_connection_url())
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
