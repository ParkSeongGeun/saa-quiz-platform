# SAA Quiz Platform 🚀

**AWS Certified Solutions Architect – Associate (SAA) 자격증 취득을 위한 학습 플랫폼**
공식 도메인: [saa-quiz.click](https://saa-quiz.click)

---

## 🛠 기술 스택

### Frontend

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Shadcn/UI
- **Deployment**: AWS S3 + CloudFront (CDN)

### Backend

- **Framework**: FastAPI (Python 3.10+)
- **Database**: AWS RDS for MySQL (Multi-AZ)
- **Auth**: JWT 기반 인증 (JOSE)
- **Container**: Docker

### Infrastructure & DevOps

- **IaC**: Terraform (VPC, ALB, EC2, RDS, S3, Route53, ECR)
- **CI/CD**: GitHub Actions (자동 빌드 및 SSM을 통한 배포)
- **Monitoring/Management**: AWS Systems Manager (SSM)

---

## ✨ 주요 기능

- **문제 풀이 (Practice)**: AWS SAA 최신 기출 및 예상 문제 풀이.
- **오답 노트 & 복습 (Review)**: 틀린 문제를 모아보고 다시 풀어보는 효율적인 학습 지원.
- **북마크 & 노트**: 중요 문제 저장 및 개인적인 학습 메모 추가 기능.
- **학습 통계 (Stats)**: 도메인별 진척도 및 정답률 분석 대시보드.
- **반응형 디자인**: PC와 모바일 환경 모두 최적화된 UX.

---

## 🏗 인프라 아키텍처 (IaC)

본 프로젝트는 수동으로 구축된 인프라를 **Terraform Import**를 통해 IaC로 전환하여 관리하고 있습니다. 상세 가이드는 `terraform/CLAUDE.md`를 참조하세요.

| 레이어            | AWS 서비스               | 설명                                                |
| :---------------- | :----------------------- | :-------------------------------------------------- |
| **Network**       | VPC, Subnet, IGW, NAT GW | ap-northeast-2 (서울) 리전, Multi-AZ 구성 (2a, 2b)  |
| **Computing**     | EC2 (t3.micro) x 2       | Private Subnet 내 WAS 인스턴스, Docker 기반 앱 실행 |
| **Load Balancer** | ALB                      | HTTPS(443) 리스너 및 HTTP→HTTPS 리다이렉션          |
| **Database**      | RDS MySQL                | 고가용성을 위한 Multi-AZ 자동 페일오버 지원         |
| **Storage/CDN**   | S3 + CloudFront          | 프런트엔드 정적 웹 호스팅 및 글로벌 전송            |
| **Security**      | WAF, ACM, SG             | ALB/EC2/RDS 독립 보안 그룹 및 SSL/TLS 인증          |
| **DNS**           | Route 53                 | `saa-quiz.click` 도메인 및 레코드 관리              |

---

## 📂 프로젝트 구조

```text
.
├── backend/          # FastAPI 서버 (Port: 8000)
│   ├── app/          # API 엔드포인트, 모델, 스키마
│   ├── routers/      # 기능별 라우터 (Auth, Questions, Stats 등)
│   └── scripts/      # 데이터 마이그레이션 도구
├── frontend/         # Next.js 클라이언트 (Port: 3000)
│   ├── app/          # Next.js 14 App Router 기반 페이지
│   └── components/   # UI 및 비즈니스 컴포넌트
├── terraform/        # AWS 인프라 정의 및 모듈 관리
│   └── modules/      # 서비스별 테라폼 모듈 (VPC, EC2, RDS 등)
└── .github/          # 배포 자동화 (GitHub Actions)
```

---

## 🚀 시작하기

### 1. Backend 설정

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
# .env 설정 후 실행
uvicorn app.main:app --reload
```

### 2. Frontend 설정

```bash
cd frontend
npm install
npm run dev
```

### 3. Terraform 운영

기존 리소스를 관리하거나 인프라를 변경할 때 사용합니다.

```bash
cd terraform
terraform init
terraform plan    # 변경 사항 검토
terraform apply   # 실제 인프라 적용
```

---

## 🚢 CI/CD 파이프라인

- **Main Branch Push**: GitHub Actions 트리거
- **Backend**: Docker 이미지 빌드 → AWS ECR 푸시 → AWS SSM을 통해 EC2 인스턴스에서 최신 이미지 pull 및 재시작
- **Frontend**: Next.js 빌드 → S3 업로드 → CloudFront 캐시 무효화 (Invalidation)
