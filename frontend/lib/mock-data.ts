export interface Question {
  id: number
  domain: string
  domainKo: string
  titleKo: string
  options: { key: string; textKo: string }[]
  correctAnswer: string
  explanationKo: string
}

export interface UserNote {
  questionId: number
  content: string
  updatedAt: string
}

export const domains = [
  { id: "design-resilient", ko: "복원력 있는 아키텍처 설계" },
  { id: "design-performant", ko: "고성능 아키텍처 설계" },
  { id: "design-secure", ko: "보안 애플리케이션 설계" },
  { id: "design-cost", ko: "비용 최적화 아키텍처 설계" },
]

export const questions: Question[] = [
  {
    id: 1,
    domain: "design-resilient",
    domainKo: "복원력 있는 아키텍처 설계",
    titleKo: "한 회사가 Application Load Balancer(ALB) 뒤에 있는 Amazon EC2 인스턴스에서 실행될 웹 애플리케이션을 설계하고 있습니다. 회사는 가용 영역(AZ)이 실패하더라도 애플리케이션이 계속 사용 가능하도록 보장해야 합니다. 어떤 솔루션이 이러한 요구 사항을 충족합니까?",
    options: [
      { key: "A", textKo: "단일 가용 영역에 EC2 인스턴스를 배포하고 Amazon CloudWatch를 사용하여 모니터링합니다." },
      { key: "B", textKo: "여러 가용 영역에 걸쳐 EC2 인스턴스를 배포하고 ALB가 모든 영역으로 트래픽을 라우팅하도록 구성합니다." },
      { key: "C", textKo: "Auto Scaling이 활성화된 하나의 가용 영역에 EC2 인스턴스를 배포합니다." },
      { key: "D", textKo: "고가용성을 보장하기 위해 EC2 인스턴스 대신 AWS Lambda를 사용합니다." },
    ],
    correctAnswer: "B",
    explanationKo: "고가용성을 보장하려면 EC2 인스턴스를 여러 가용 영역에 걸쳐 배포해야 합니다. ALB는 자동으로 사용 가능한 영역의 정상 인스턴스로 트래픽을 라우팅합니다. 하나의 AZ가 실패하면 ALB가 다른 AZ의 인스턴스로 트래픽을 리다이렉트합니다.",
  },
  {
    id: 2,
    domain: "design-performant",
    domainKo: "고성능 아키텍처 설계",
    titleKo: "회사는 전 세계 수백만 사용자에게 정적 콘텐츠(이미지, CSS, JavaScript)를 낮은 지연 시간으로 제공해야 합니다. 콘텐츠는 Amazon S3 버킷에 저장되어 있습니다. 성능을 개선하기 위해 어떤 AWS 서비스를 사용해야 합니까?",
    options: [
      { key: "A", textKo: "Amazon CloudFront" },
      { key: "B", textKo: "AWS Global Accelerator" },
      { key: "C", textKo: "Amazon ElastiCache" },
      { key: "D", textKo: "AWS Direct Connect" },
    ],
    correctAnswer: "A",
    explanationKo: "Amazon CloudFront는 전 세계 엣지 로케이션에서 콘텐츠를 캐시하는 CDN입니다. S3와 기본적으로 통합되며, 사용자의 지리적 위치에 관계없이 낮은 지연 시간으로 정적 콘텐츠를 제공합니다.",
  },
  {
    id: 3,
    domain: "design-secure",
    domainKo: "보안 애플리케이션 설계",
    titleKo: "솔루션 아키텍트는 Amazon S3에 저장된 모든 데이터가 고객 관리형 키를 사용하여 저장 시 암호화되도록 해야 합니다. 회사는 또한 자동 키 교체를 요구합니다. 아키텍트는 어떤 접근 방식을 권장해야 합니까?",
    options: [
      { key: "A", textKo: "기본 Amazon S3 관리형 암호화 키와 함께 SSE-S3를 사용합니다." },
      { key: "B", textKo: "AWS KMS 고객 관리형 키와 함께 SSE-KMS를 사용하고 자동 키 교체를 활성화합니다." },
      { key: "C", textKo: "AWS Secrets Manager에 저장된 키를 사용하여 클라이언트 측 암호화를 수행합니다." },
      { key: "D", textKo: "SSE-C를 사용하고 90일마다 수동으로 암호화 키를 교체합니다." },
    ],
    correctAnswer: "B",
    explanationKo: "고객 관리형 키(CMK)를 사용한 SSE-KMS는 S3 객체에 대한 저장 시 암호화를 제공합니다. AWS KMS는 고객 관리형 키에 대한 연간 자동 키 교체를 지원하여 두 가지 요구 사항을 효율적으로 충족합니다.",
  },
  {
    id: 4,
    domain: "design-cost",
    domainKo: "비용 최적화 아키텍처 설계",
    titleKo: "회사는 업무 시간(월요일부터 금요일까지 오전 8시부터 오후 6시까지)에만 사용되는 개발 환경을 운영합니다. 인스턴스는 상태를 유지해야 합니다. 가장 비용 효율적인 EC2 구매 옵션은 무엇입니까?",
    options: [
      { key: "A", textKo: "1년 기간의 예약 인스턴스." },
      { key: "B", textKo: "AWS Instance Scheduler를 사용하여 예약된 시작/중지가 있는 온디맨드 인스턴스." },
      { key: "C", textKo: "지속적 요청이 있는 스팟 인스턴스." },
      { key: "D", textKo: "온디맨드 가격의 전용 호스트." },
    ],
    correctAnswer: "B",
    explanationKo: "AWS Instance Scheduler를 사용한 온디맨드 인스턴스를 통해 일정에 따라 인스턴스를 시작하고 중지할 수 있습니다. 환경이 주당 50시간만 사용되므로(168시간 대비) 스케줄링을 통해 24/7 운영 대비 약 70%를 절약할 수 있습니다. 스팟 인스턴스는 중단될 수 있으므로 이상적이지 않습니다.",
  },
  {
    id: 5,
    domain: "design-resilient",
    domainKo: "복원력 있는 아키텍처 설계",
    titleKo: "회사는 최소한의 다운타임으로 다른 가용 영역의 대기 인스턴스로 자동 장애 조치되는 Amazon RDS 데이터베이스가 필요합니다. 솔루션 아키텍트는 어떤 기능을 구성해야 합니까?",
    options: [
      { key: "A", textKo: "동일 리전의 Amazon RDS 읽기 복제본." },
      { key: "B", textKo: "Amazon RDS 다중 AZ 배포." },
      { key: "C", textKo: "Amazon RDS 교차 리전 복제." },
      { key: "D", textKo: "시점 복구가 가능한 Amazon RDS 자동 백업." },
    ],
    correctAnswer: "B",
    explanationKo: "RDS 다중 AZ는 다른 AZ에 있는 동기식 대기 복제본으로의 자동 장애 조치를 제공합니다. 주 인스턴스가 실패하면 RDS가 자동으로 대기 인스턴스로 전환되며, 일반적으로 60-120초의 최소 다운타임이 발생합니다.",
  },
  {
    id: 6,
    domain: "design-secure",
    domainKo: "보안 애플리케이션 설계",
    titleKo: "회사는 특정 VPC의 특정 IAM 사용자만 객체에 액세스할 수 있도록 Amazon S3 버킷에 대한 액세스를 제한하려고 합니다. 솔루션 아키텍트는 어떤 조합의 작업을 수행해야 합니까? (두 개를 선택하세요.)",
    options: [
      { key: "A", textKo: "Amazon S3에 대한 VPC 엔드포인트를 생성합니다." },
      { key: "B", textKo: "VPC 엔드포인트로의 액세스를 제한하는 조건이 있는 S3 버킷 정책을 구성합니다." },
      { key: "C", textKo: "버킷에서 S3 Transfer Acceleration을 활성화합니다." },
      { key: "D", textKo: "수정을 방지하기 위해 S3 Object Lock을 구성합니다." },
    ],
    correctAnswer: "A",
    explanationKo: "S3용 VPC 엔드포인트(게이트웨이 유형)를 생성하면 VPC에서 S3로의 프라이빗 연결이 가능합니다. VPC 엔드포인트에서의 요청만 허용하는 조건(aws:sourceVpce)이 포함된 S3 버킷 정책과 결합하면, 지정된 VPC의 트래픽만 버킷에 액세스할 수 있습니다.",
  },
  {
    id: 7,
    domain: "design-performant",
    domainKo: "고성능 아키텍처 설계",
    titleKo: "애플리케이션이 Amazon RDS MySQL 데이터베이스에서 자주 데이터를 읽습니다. 읽기 쿼리가 성능 병목 현상을 일으키고 있습니다. 데이터는 약간의 오래됨을 허용할 수 있습니다. 읽기 성능을 개선하기 위해 솔루션 아키텍트는 무엇을 권장해야 합니까?",
    options: [
      { key: "A", textKo: "더 나은 읽기 성능을 위해 RDS 다중 AZ를 활성화합니다." },
      { key: "B", textKo: "Amazon RDS 읽기 복제본을 생성하고 읽기 트래픽을 해당 복제본으로 전달합니다." },
      { key: "C", textKo: "주 RDS 인스턴스의 인스턴스 크기를 증가시킵니다." },
      { key: "D", textKo: "더 나은 읽기 처리량을 위해 Amazon DynamoDB로 마이그레이션합니다." },
    ],
    correctAnswer: "B",
    explanationKo: "RDS 읽기 복제본은 주 인스턴스에서 읽기 트래픽을 오프로드합니다. 데이터가 약간의 오래됨을 허용할 수 있으므로(비동기 복제), 읽기 복제본은 애플리케이션 아키텍처를 크게 변경하지 않고 읽기 성능을 확장하는 이상적인 솔루션입니다.",
  },
  {
    id: 8,
    domain: "design-cost",
    domainKo: "비용 최적화 아키텍처 설계",
    titleKo: "회사는 처음 30일 동안 자주 액세스되고 그 이후에는 거의 액세스되지 않는 로그 파일을 Amazon S3에 저장합니다. 로그는 1년 동안 보관해야 합니다. 비용을 최소화하는 S3 스토리지 전략은 무엇입니까?",
    options: [
      { key: "A", textKo: "1년 내내 모든 로그를 S3 Standard에 저장합니다." },
      { key: "B", textKo: "모든 로그 파일에 S3 Intelligent-Tiering을 사용합니다." },
      { key: "C", textKo: "S3 수명 주기 정책을 사용하여 30일 후에 로그를 S3 Standard-IA로, 90일 후에 S3 Glacier로 전환합니다." },
      { key: "D", textKo: "모든 로그를 S3 Glacier Deep Archive에 직접 저장합니다." },
    ],
    correctAnswer: "C",
    explanationKo: "30일 후에 S3 Standard에서 S3 Standard-IA로, 90일 후에 S3 Glacier로 객체를 전환하는 S3 수명 주기 정책이 비용을 최적화합니다. Standard-IA는 자주 액세스하지 않는 데이터에 대해 더 저렴하고, Glacier는 1년 보관 요구 사항을 충족하면서 아카이브 스토리지에 대해 가장 낮은 비용을 제공합니다.",
  },
]
