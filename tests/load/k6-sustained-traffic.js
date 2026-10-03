import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },
    { duration: '5m', target: 50 },
    { duration: '30s', target: 0 },
  ],
};

const BASE_URL = __ENV.API_GATEWAY_URL || 'http://localhost:8000';

export default function () {
  const res = http.get(`${BASE_URL}/health/live`);
  check(res, { 'is 200': (r) => r.status === 200 });
  sleep(1);
}
