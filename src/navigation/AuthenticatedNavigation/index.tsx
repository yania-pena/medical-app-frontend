/* eslint-disable react-hooks/exhaustive-deps */
import { Routes, Route, useNavigate } from "react-router-dom";
import { Layout } from "antd";
import DatesPage from "../../pages/Doctor/DatesPage";
import { Navbar } from "../../components/Navbar";
import { SideBar } from "../../components/Sidebar";
import { useContext, useEffect } from "react";
import PatientsPage from "../../pages/Doctor/PatientsPage";
import { AuthContext } from "../../context/AuthContext";

const AuthenticatedNavigation = () => {
    const navigate = useNavigate();
    const { user }: any = useContext(AuthContext)

    useEffect(() => {
        user.isDoctor && navigate("/pacientes");
        user.isPatient && navigate("/citas");
    }, []);
    return (
        <>
            <Layout>
                <Navbar />
                <SideBar>
                    {
                        user.isDoctor && (
                            <Routes>
                                <Route path="pacientes" element={<PatientsPage />} />
                                <Route path="citas" element={<DatesPage />} />
                            </Routes>
                        )
                    }

                    {
                        user.isPatient && (
                            <Routes>
                                <Route path="citas" element={<DatesPage />} />
                            </Routes>
                        )
                    }
                </SideBar>
            </Layout>
        </>
    );
};

export default AuthenticatedNavigation;