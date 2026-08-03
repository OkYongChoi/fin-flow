# Flow of Money

국제 금융 인프라의 메시징, 승인, 청산, 결제와 자산 이전을 구분해 보여주는 한·영 인터랙티브 지도입니다.

## Run

```bash
npm install
npm run dev
```

검증은 `npm run data:validate`, `npm test`, `npm run test:e2e`, `npm run build` 순으로 실행합니다.

## Data policy

- 화면의 수치는 `public/data`에 버전 고정되며 모든 지표가 공식 원문 출처를 참조해야 합니다.
- 지도 경로는 개별 거래 위치가 아니라 금융망 구조를 설명하는 도식입니다.
- 타임라인은 실시간 거래 피드가 아닌 명시적으로 표시된 학습용 시뮬레이션입니다.
- SWIFT는 메시징, CHIPS와 Fedwire는 별도 결제 경로, OTC 파생상품은 BIS 집계 통계로 취급합니다.

Cloudflare Pages에서는 빌드 명령 `npm run build`, 출력 디렉터리 `dist`를 사용합니다. `public/_redirects`가 한·영 SPA 경로의 직접 접근을 처리합니다.
