# Flow of Money

국제 금융 인프라의 메시징, 승인, 청산, 결제와 자산 이전을 구분해 보여주는 한·영 인터랙티브 지도입니다.

## Implemented features

- SWIFT, Visa, CHIPS/Fedwire, OTC 파생상품, USDC의 도식 경로와 출처 기반 통계
- URL에 유지되는 기간·통화·기관·지역 필터와 한·영 언어 전환
- 네트워크별 경로·기관·통계·원문 인스펙터
- 네트워크별 설명용 타임라인과 0.5×/1×/2× 재생 속도
- 모바일 탐색 메뉴, 키보드 포커스, 지도 데이터 표 대체 표현
- 출처 레지스트리, 데이터 계약 검증, 단위/E2E 테스트, GitHub Actions 품질 게이트
- 데이터 장애 시 지도 가용성 유지, 재시도 UI, Cloudflare Pages 보안 헤더

## Run

```bash
npm install
npm run dev
```

검증은 `npm run data:validate`, `npm test`, `npm run test:e2e`, `npm run build` 순으로 실행합니다.

## Data policy

- 화면의 수치는 `public/data`에 버전 고정되며 모든 지표가 공식 원문 출처를 참조해야 합니다.
- 지도 경로는 개별 거래 위치가 아니라 금융망 구조를 설명하는 도식입니다.
- 타임라인은 실시간 거래 피드가 아닌 명시적으로 표시된 설명용 시뮬레이션입니다.
- SWIFT는 메시징, CHIPS와 Fedwire는 별도 결제 경로, OTC 파생상품은 BIS 집계 통계로 취급합니다.

## Operations

- `public/data/manifest.json`의 `reviewDueAt`은 데이터 검토 마감일입니다. 기한이 지나면 `npm run data:validate`와 일일 GitHub Actions 품질 게이트가 실패합니다.
- 갱신 시에는 출처 원문을 검토한 뒤 `sources.json`의 `retrievedAt`, `metrics.json`, `manifest.json`의 `version`·`generatedAt`·`reviewDueAt`을 함께 갱신하세요. 임의의 자동 수집으로 공개 통계를 대체하지 않습니다.
- Cloudflare Pages: 빌드 명령은 `npm run build`, 출력 디렉터리는 `dist`입니다. `public/_headers`는 브라우저 보안 헤더와 `/data/*`의 5분 재검증 캐시를 제공합니다.
- 배포 후에는 `/ko/map`, `/en/map`, `/ko/data` 직접 접근과 소스 링크를 확인하고, 실패한 일일 품질 게이트는 데이터 담당자가 우선 처리합니다.

`public/_redirects`는 한·영 SPA 경로의 직접 접근을 처리합니다.
