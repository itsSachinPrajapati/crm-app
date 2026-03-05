import http from "k6/http";
import { sleep } from "k6";

export const options = {
  stages: [
    { duration: "20s", target: 10 },
    { duration: "20s", target: 20 },
    { duration: "20s", target: 50 }
  ]
};

const BASE_URL = "https://api.crm-app.in";

export function setup() {

  const payload = JSON.stringify({
    email: "sachinprajapati@gmail.com",
    password: "Sachin@2005"
  });

  const params = {
    headers: { "Content-Type": "application/json" }
  };

  const res = http.post(`${BASE_URL}/api/auth/login`, payload, params);

  return {
    cookies: res.cookies
  };
}

export default function (data) {

  const authParams = {
    cookies: data.cookies
  };

  http.get(`${BASE_URL}/api/leads`, authParams);
  http.get(`${BASE_URL}/api/clients`, authParams);
  http.get(`${BASE_URL}/api/projects`, authParams);
  http.get(`${BASE_URL}/api/payments`, authParams);
  http.get(`${BASE_URL}/api/users/me`, authParams);

  sleep(1);
}