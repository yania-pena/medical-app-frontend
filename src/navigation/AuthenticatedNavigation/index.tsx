/* eslint-disable react-hooks/exhaustive-deps */
import { Routes, Route, useNavigate } from "react-router-dom";
import { Button, Drawer, Layout, Modal, Space } from "antd";
import { Navbar } from "../../components/Navbar";
import { SideBar } from "../../components/Sidebar";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import DashboardPage from "../../pages/Doctor/DashboardPage";
import CalendarPage from "../../pages/Doctor/CalendarPage";
import PatientsPage from "../../pages/Doctor/PatientsPage";
import DatesPage from "../../pages/Doctor/DatesPage";
import PersonalPage from "../../pages/Doctor/PersonalPage";
import PatientDatesPage from "../../pages/Patient/DatesPage";
import FrequentQuestionsPage from "../../pages/Doctor/FrequentQuestionsPage";
import ReportPage from "../../pages/Patient/ReportPage";
import HumanPage from "../../pages/Doctor/HumanPage";
import Agora from "../../pages/Integrations/Agora";
import { CallContext } from "../../context/CallContext";
import AgoraUIKit, { layout } from "agora-react-uikit";
import ScreenRecording from "../../pages/Integrations/ScreenRecord";
import './styles.css'
import { isMobile } from "react-device-detect";


const AuthenticatedNavigation = () => {

  const navigate = useNavigate();
  const { user }: any = useContext(AuthContext);

  const { call, isActive, leave }: any = useContext(CallContext)

  useEffect(() => {
    (user.isDoctor || user.isPychologist || user.isNutri) && navigate("/citas");
    user.isPatient && navigate("/calendario");
  }, []);


  const rtcProps = {
    appId: 'c4ad672c0b2d42b5abe0ee24eae25b36',
    channel: 'test',
    token: null,
    layout: layout.grid
  };

  const callbacks = {
    EndCall: () => {
      leave()
    }
  };

  return (
    <>
      <Layout>
        <SideBar>
          {user.isDoctor && (
            <Routes>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="citas" element={<DatesPage />} />
              <Route path="calendario" element={<CalendarPage />} />
              <Route path="personal" element={<PersonalPage />} />
              <Route path="pacientes" element={<PatientsPage />} />
              <Route path="preguntas" element={<FrequentQuestionsPage />} />
              <Route path="simulacion" element={<HumanPage />} />
              <Route path="citas/cita-virtual/:channel" element={<Agora />} />
              <Route path="recordTest" element={<ScreenRecording
                screen={true}
                audio={true}
                video={false}
                downloadRecordingPath="Screen_Recording_Demo"
                downloadRecordingType="mp4"
                emailToSupport="support@xyz.com"
              />
              } />
            </Routes>
          )}

          {user.isPatient && (
            <Routes>
              <Route path="avance" element={<ReportPage />} />
              <Route path="calendario" element={<CalendarPage />} />
              <Route path="citas" element={<PatientDatesPage />} />
              <Route path="simulacion" element={<HumanPage />} />
              <Route path="citas/cita-virtual/:channel" element={<Agora />} />
            </Routes>
          )}

          {user.isPychologist && (
            <Routes>
              <Route path="citas" element={<DatesPage />} />
              <Route path="calendario" element={<CalendarPage />} />
              <Route path="pacientes" element={<PatientsPage />} />
              <Route path="citas/cita-virtual/:channel" element={<Agora />} />
            </Routes>
          )}

          {user.isNutri && (
            <Routes>
              <Route path="citas" element={<DatesPage />} />
              <Route path="calendario" element={<CalendarPage />} />
              <Route path="pacientes" element={<PatientsPage />} />
              <Route path="simulacion" element={<HumanPage />} />
              <Route path="citas/cita-virtual/:channel" element={<Agora />} />
            </Routes>
          )}

        </SideBar>
      </Layout>
      {
        isActive && call !== null && (
          <div className="call-container">
            {!isMobile && (
              <div style={{ backgroundColor: '#4287f5', width: 250 }}>
                <ScreenRecording
                  screen={true}
                  audio={true}
                  video={false}
                  downloadRecordingPath="Screen_Recording_Demo"
                  downloadRecordingType="mp4"
                  emailToSupport="support@xyz.com"
                  dateId={call}
                />
              </div>
            )}
            <div className="agora-container">
              <AgoraUIKit rtcProps={rtcProps} callbacks={callbacks} />
            </div>
          </div>
        )
      }

    </>
  );
};

export default AuthenticatedNavigation;