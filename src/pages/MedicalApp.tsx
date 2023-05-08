import React, { useContext, useEffect } from "react";
import UnauthenticatedNavigation from "../navigation/UnauthenticatedNavigation";
import { AuthContext } from "../context/AuthContext";
import AuthenticatedNavigation from "../navigation/AuthenticatedNavigation";

const MedicalApp = (): any => {
  const { isLogin, login} = useContext(AuthContext);
  useEffect(() => {
    console.log('isLogin', isLogin)
    const sessionInfo = localStorage.getItem("userData");
    console.log('sessionINfo', sessionInfo)
    if (typeof sessionInfo !== "undefined" && sessionInfo !== null) {
      login(JSON.parse(sessionInfo));
    }
  }, []);

  if (!isLogin) return <UnauthenticatedNavigation />;
  if (isLogin) return (
    <AuthenticatedNavigation />
  )
};

export default MedicalApp;
