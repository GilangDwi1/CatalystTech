import axios from "axios";

const fastapi = axios.create({
  baseURL: import.meta.env.VITE_API_URL_FASTAPI,
});

export default fastapi;