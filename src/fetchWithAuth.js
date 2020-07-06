import axios from "axios";
import { token } from "./token";

const fetchWithAuth = (url) =>
  axios.get(url.href, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export { fetchWithAuth };
