import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 10 },
    { duration: '30s', target: 200 }, // sudden spike
    { duration: '1m', target: 200 },
    { duration: '20s', target: 10 },
  ],
};

const BASE_URL = __ENV.API_GATEWAY_URL || 'http://localhost:8000';

export default function () {
  const res = http.get(`${BASE_URL}/api/v1/catalog/products`);
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(0.5);
}
