import { useState, useEffect } from "react";
import useLocalStorage from "./useLocalStorage";
import axios from "axios";

export default function useAuth(code) {
  const [inLocalStorage, setLocalStorage] = useLocalStorage();
  const [accessToken, setAccessToken] = useState(inLocalStorage('accesToken') || null);
  const [refreshToken, setRefreshToken] = useState();
  const [expiresIn, setExpiresIn] = useState();

  useEffect(() => {
    axios
      .post("http://localhost:3001/login", {
        code,
      })
      .then(res => {
        setAccessToken(res.data.accessToken);
        setRefreshToken(res.data.refreshToken);
        setExpiresIn(res.data.expiresIn);
        window.history.pushState({}, null, "/");
      })
      .catch((err) => {
        window.location = "/"
        console.log(err);
      });
  }, [code, accessToken, setLocalStorage]);

  useEffect(() => {
    if (refreshToken){
      const interval = setInterval(() => {
        axios
          .post("http://localhost:3001/refresh", {
            refreshToken
          })
          .then(res => {
            setAccessToken(res.data.accessToken);
            setExpiresIn(res.data.expiresIn);
          })
          .catch((err) => {
            window.location = "/";
            console.log(err);
          });
      }, (expiresIn - 60) * 1000);

      return() => clearInterval(interval);
    }
    
  }, [refreshToken, expiresIn]);

  setLocalStorage('accesToken', accessToken)

  return accessToken;
}