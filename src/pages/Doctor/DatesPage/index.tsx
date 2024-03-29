/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { getData } from "../../../services/common/getData";
import { Card, List, Modal, Form, Select, Row, Col, Spin, Button, MenuProps, Dropdown, Space, DatePicker, DatePickerProps, message } from "antd";
import DateItem from "../../../components/DateItem";
import MedicalRecordForm from "../../../components/Forms/MedicalRecordForm";
import moment from "moment";
import { CalendarOutlined, DownOutlined } from "@ant-design/icons";
import NutriForm from "../../../components/Forms/NutriForm";
import { PDFDownloadLink } from "@react-pdf/renderer";
import Recepepdf from "../../../components/PDF/Recepepdf";
import PsychoForm from "../../../components/Forms/PsychoForm";
import { useNavigate } from "react-router-dom";
import { CallContext } from "../../../context/CallContext";
import './styles.css';
import ModalHeader from "../../../components/ModalHeader";
import { isMobile } from "react-device-detect";
import { RangePickerProps } from "antd/es/date-picker";
import { es } from "date-fns/locale";
import { format } from "date-fns";
import dayjs from "dayjs";
import { NewCallContext } from "../../../context/NewCallContext";
import AgoraRTC from 'agora-rtc-sdk-ng';
import { postData } from "../../../services/common/postData";

const gridStyle: React.CSSProperties = {
  width: "100%",
  textAlign: "center",
};


const MyDrop = ({ date, handleOpenModal, join }: any) => {
  const { joinHuman }: any = useContext(NewCallContext)

  const generateAgoraToken = async (channelName: any, userId: any, role: any) => {
    try {
      const resp = await postData('api/agora', {
        channelName,
        userId,
        role,
      })
      return resp.token;
    } catch (error) {
      console.error('Error al obtener el token:', error);
      return null;
    }
  };

  const fullJoin = async () => {
    const humanClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    const videoTrack = await AgoraRTC.createCameraVideoTrack();
    joinHuman(humanClient, audioTrack, videoTrack)

    try {
      const token = await generateAgoraToken('test', 1, 'publisher'); // Reemplaza los valores según tus necesidades
      console.log('token', token)
      await humanClient.join('bca03b41035d4ca78a76ba456cc67ed9', 'test', token, null); // Unirte a la videollamada con el token generado


      // Verificar el estado de la conexión antes de publicar las pistas
      const connectionState = humanClient.connectionState;
      if (connectionState === 'DISCONNECTED') {
        console.error('Error al unirse a la llamada: La conexión no está establecida.');
        return;
      } else {
        // Crear el div para mostrar la cámara local
        let localPlayerContainer
        if (document.getElementById('local_stream') === null) {
          localPlayerContainer = document.createElement('div');
          localPlayerContainer.id = 'local_stream';
          console.log('vcontainer', document.getElementById('video_container'))

          document.getElementById('video_container')?.appendChild(localPlayerContainer);

        } else {
          localPlayerContainer = document.getElementById('local_stream')

        }

        // Agregar la pista de video a la interfaz
        videoTrack.play(`local_stream`);



        // Asignar estilos al elemento "local_stream"
        if (localPlayerContainer !== null) {

          localPlayerContainer.style.width = '320px'; // Ancho en píxeles
          localPlayerContainer.style.height = '240px'; // Alto en píxeles
          localPlayerContainer.style.border = '2px solid #000'; // Borde de 2 píxeles de ancho en color negro
        }

      }


      await humanClient.publish([audioTrack, videoTrack]);

    } catch (error) {
      console.error('Error al unirse a la llamada:', error);
    }

  }




  let items: MenuProps['items'] = [
    {
      key: '1',
      label: (
        <a rel="noopener noreferrer" onClick={handleOpenModal}>
          Actualizar datos
        </a>
      ),
    }
  ];


  items.push({
    key: '2',
    label: (
      <a rel="noopener noreferrer" onClick={fullJoin}>
        Ingresar a videollamada
      </a>

    ),
  })


  if ("callUrl" in date) {
    if (date.callUrl !== "") {
      items.push({
        key: '3',
        label: (
          <a rel="noopener noreferrer" href={date.callUrl} target="_blank">
            Ver videollamada guardada
          </a>
        )
      })
    }
  }

  if ("record" in date) {
    if (date.record !== null) {
      if (date.record.recipe[0]) {
        items.push({
          key: '4',
          label: (
            <PDFDownloadLink
              document={<Recepepdf date={date} />}
              fileName="receta.pdf"
            >
              <a rel="noopener noreferrer">
                Descargar receta
              </a>
            </PDFDownloadLink>
          )
        })
      }
    }
  }

  return (
    <Dropdown
      menu={{ items }}
    >
      <Button type="primary">
        <Space>
          Acciones
          <DownOutlined />
        </Space>
      </Button>
    </Dropdown>
  )
}

const DatesPage = () => {
  const navigate = useNavigate()
  const { user }: any = useContext(AuthContext);
  const [dates, setDates] = useState([]);
  const [initialData, setInitialData] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<any>();
  const [form] = Form.useForm();
  const [filterBy, setFilterBy] = useState("today");
  const [refresh, setRefresh] = useState(false);

  const toggleModal = () => setIsOpenModal((prevState) => !prevState);

  const handleOpenModal = (date: any) => {
    setIsOpenModal(true);
    setSelectedDate(date);
    if ("record" in date) {
      console.log("date here", date);

      if (user.isDoctor) {
        form.setFieldValue("ci", date.record?.generalInfo?.ci);
        form.setFieldValue("civilState", date.record?.generalInfo?.civilState);
        form.setFieldValue(
          "bornDate",
          moment(date.record?.generalInfo?.bornDate)
        );
        form.setFieldValue("bornPlace", date.record?.generalInfo?.bornPlace);
        form.setFieldValue("address", date.record?.contactInfo?.address);
        form.setFieldValue("phone", date.record?.contactInfo?.phone);
        form.setFieldValue("weight", date.record?.medicalInfo?.weight);
        form.setFieldValue("height", date.record?.medicalInfo?.height);
        form.setFieldValue("imc", date.record?.medicalInfo?.imc);
        form.setFieldValue(
          "clinichistory",
          date.record?.medicalInfo?.clinichistory
        );
        form.setFieldValue(
          "relationship",
          date.record?.medicalInfo?.relationship
        );
        form.setFieldValue(
          "distribution",
          date.record?.medicalInfo?.distribution
        );
        form.setFieldValue("CEspecial", date.record?.medicalInfo?.CEspecial);
        form.setFieldValue(
          "hospitalization",
          date.record?.medicalInfo?.hospitalization
        );
        form.setFieldValue("room", date.record?.medicalInfo?.room);
        form.setFieldValue("emergency", date.record?.medicalInfo?.emergency);
        form.setFieldValue("comments", date.record?.medicalInfo?.comments);

        if (date.record?.diet) {
          if (date?.record?.diet?.length > 0) {
            const diet = date?.record?.diet.map((diet: any) => {
              return {
                name: diet?.name,
                qty: diet?.qty,
                moment: diet?.moment,
                description: diet?.description,
              };
            });
            form.setFieldValue("diet", diet);
          }
        }

        if (date.record?.care) {
          if (date?.record?.care?.length > 0) {
            const care = date.record?.care.map((care: any) => {
              return {
                description: care?.description,
              };
            });
            form.setFieldValue("care", care);
          }
        }

        if (date.record?.recipe) {
          if (date?.record?.recipe?.length > 0) {
            const recipe = date.record?.recipe.map((recipe: any) => {
              return {
                name: recipe?.name,
                dose: recipe?.dose,
                frequency: recipe?.frequency,
              };
            });
            form.setFieldValue("recipe", recipe);
          }
        }

        if (date.record?.Test) {
          if (date.record?.Test?.length > 0) {
            const tests = date.record?.Test.map((test: any) => {
              return { label: test?.name, value: test?.name };
            });
            form.setFieldValue("Test", tests);
          }
        }

        if (date.record?.testResults) {
          if (date.record?.testResults.length > 0) {
            form.setFieldValue("testResults", date.record?.testResults)
          }
        }


        form.setFieldValue(
          "waistMeasurement",
          date.record?.nutriInfo?.waistMeasurement
        );
        form.setFieldValue(
          "backMeasurement",
          date.record?.nutriInfo?.backMeasurement
        );

        form.setFieldValue(
          "neckMeasurement",
          date.record?.nutriInfo?.neckMeasurement
        );

        form.setFieldValue(
          "armsMeasurement",
          date.record?.nutriInfo?.armsMeasurement
        );

        form.setFieldValue(
          "hipMeasurement",
          date.record?.nutriInfo?.hipMeasurement
        );

        form.setFieldValue(
          "legsMeasurement",
          date.record?.nutriInfo?.legsMeasurement
        );

        return;
      }

      if (user.isNutri) {
        form.setFieldValue(
          "waistMeasurement",
          date.record.nutriInfo.waistMeasurement
        );
        form.setFieldValue(
          "backMeasurement",
          date.record.nutriInfo.backMeasurement
        );

        form.setFieldValue(
          "neckMeasurement",
          date.record.nutriInfo.neckMeasurement
        );

        form.setFieldValue(
          "armsMeasurement",
          date.record.nutriInfo.armsMeasurement
        );

        form.setFieldValue(
          "hipMeasurement",
          date.record.nutriInfo.hipMeasurement
        );

        form.setFieldValue(
          "legsMeasurement",
          date.record.nutriInfo.legsMeasurement
        );
        form.setFieldValue(
          "exercisePerWeek",
          date.record.nutriInfo.exercisePerWeek
        );
        form.setFieldValue("dailyWater", date.record.nutriInfo.dailyWater);
        form.setFieldValue("comments", date.record.nutriInfo.comments);
        form.setFieldValue("isAllowed", date.record.nutriInfo.isAllowed);
        form.setFieldValue(
          "clinichistory",
          date.record?.medicalInfo?.clinichistory
        );
        form.setFieldValue(
          "relationship",
          date.record?.medicalInfo?.relationship
        );
        form.setFieldValue(
          "distribution",
          date.record?.medicalInfo?.distribution
        );
        form.setFieldValue("CEspecial", date.record?.medicalInfo?.CEspecial);
        form.setFieldValue(
          "hospitalization",
          date.record?.medicalInfo?.hospitalization
        );
        form.setFieldValue("room", date.record?.medicalInfo?.room);
        form.setFieldValue("emergency", date.record?.medicalInfo?.emergency);
        if (date.record?.activity) {
          if (date?.record?.activity?.length > 0) {
            const activity = date.record?.activity.map((activity: any) => {
              return {
                description: activity?.description,
              };
            });
            form.setFieldValue("activity", activity);
          }
        }
        if (date.record?.diet) {
          if (date?.record?.diet?.length > 0) {
            const diet = date?.record?.diet.map((diet: any) => {
              return {
                description: diet?.description,
              };
            });
            form.setFieldValue("diet", diet);
          }
        }
        return;
      }
    }
  };

  const handleCloseModal = () => {
    setSelectedDate(undefined);
    form.resetFields();
    setIsOpenModal(false);
  };

  const getDates = async () => {
    setLoadingData(true);
    let url = "";
    if (!user.isPatient) {
      url = "api/dates/byEspecialist/";
    }

    if (user.isPatient) {
      url = "api/dates/byPatient/";
    }

    const request = await getData(url + user._id);
    if (request.status) {
      const requestPatients = await getData("api/users/patients");

      let patients: any = [];
      if (requestPatients.status) {
        patients = requestPatients.data;
      }

      let specialists: any = [];
      const requestSpecialists = await getData("api/users/specialists");
      if (requestSpecialists.status) {
        specialists = requestSpecialists.data;
      }

      if (patients.length > 0 && specialists.length > 0) {
        const fullDates = request.data.map((date: any) => {
          return {
            ...date,
            specialist: specialists.find(
              (sp: any) => sp._id === date.idespecialist
            ),
            patient: patients.find((pt: any) => pt._id === date.idpatient),
          };
        });
        console.log(fullDates.reverse())
        const comparareDates = (a: any, b: any) => {
          return b.start.localeCompare(a.start);
        };
        const sortedDates = fullDates.sort(comparareDates);

        /*
        setInitialData(sortedDates);
        getTodayDates(sortedDates);
        */
        setDates(sortedDates)
        setTotalItems(sortedDates.length)
        getTodayDates(sortedDates)
        // filterDates()     
      }
      setLoadingData(false);
    }
  };

  useEffect(() => {
    getDates();
  }, [refresh]);

  const getTodayDates = (data: any) => {
    const todayDates = data.filter((date: any) =>
      moment().isSame(date.start, "day")
    );
    setFilteredDates(todayDates);
    setShowingToday(true)
  };

  const handleChangeFilter = (value: any) => {
    setFilterBy(value);
    if (value === "today") {
      getTodayDates(initialData);
      return;
    }

    if (value === "all") {
      setDates(initialData);
      return;
    }
  };

  const { join } = useContext(CallContext);

  const getModalTitle = () => {
    if (selectedDate) {
      if ("patient" in selectedDate) {
        const { firstname, lastname } = selectedDate.patient
        return "Ficha médica de: " + firstname + " " + lastname
      }
      return "Ficha médica"
    }
    return "Ficha médica"
  }


  const [startDate, setStartDate] = useState<any>('')
  const [endDate, setEndDate] = useState<any>('')

  const [totalItems, setTotalItems] = useState(0)

  const [filteredDates, setFilteredDates] = useState<any>([])

  const [filtered, setFiltered] = useState(false)

  const [showingToday, setShowingToday] = useState(false)


  const onChange = (
    value: DatePickerProps['value'] | RangePickerProps['value'],
    dateString: [string, string] | string,
  ) => {
    console.log('Selected Time: ', value);
    console.log('Formatted Selected Time: ', dateString);
    if (dateString[0] === "" && dateString[1] === "") {
      setFiltered(false)
    }

    setStartDate(dateString[0])
    setEndDate(dateString[1])

    filterDates(dateString[0], dateString[1])
  };


  const filterDates = (sd: any, ed: any) => {

    const startDate = sd
    const endDate = ed

    if (startDate !== "" && endDate === "") {
      message.error("Por favor selecciona una fecha final")
      return;
    }

    if (startDate === "" && endDate !== "") {
      message.error("Por favor selecciona una fecha inicial")
      return;
    }

    if (startDate === "" && endDate === "") {
      const comparareDates = (a: any, b: any) => {
        return b.start.localeCompare(a.start);
      };
      const sortedDates = dates.sort(comparareDates);


      setTotalItems(sortedDates.length)
      setFilteredDates(sortedDates)
      setFiltered(false)
      setShowingToday(false)
      return;
    }

    if (startDate !== "" && endDate !== "") {
      const sd = moment(startDate)
      const ed = moment(endDate)
      const filtered = dates.filter((date: any) => moment(date.start).isBetween(sd, ed, 'days', '[]'));
      const comparareDates = (a: any, b: any) => {
        return b.start.localeCompare(a.start);
      };
      const sortedDates = filtered.sort(comparareDates);
      setTotalItems(sortedDates.length)
      setFilteredDates(sortedDates)
      setFiltered(true)
      setShowingToday(false)
    }

  }

  return (
    <Card
      title="Citas"
      extra={
        <Row align="middle" style={{ marginBottom: 8 }}>
          <Col>Filtro:</Col>
          <Col style={{ paddingLeft: 8 }}>
            <Space>
              <DatePicker.RangePicker onChange={onChange} />

            </Space>
          </Col>
        </Row>
      }
    >
      <Card.Grid style={gridStyle} hoverable={false}>
        {loadingData ? (
          <Spin />
        ) : (
          <div>
            <CalendarOutlined className="stat-icon" />
            <h3 className="stat-title">
              {(filtered) ? "Citas entre " + startDate + " y " + endDate
                :
                showingToday ?
                  "Citas de hoy"
                  :
                  "Todas mis citas"
              }
            </h3>

          </div>
        )}
      </Card.Grid>

      <List
        style={{ width: "100%" }}
        loading={loadingData}
        bordered
        dataSource={filteredDates}
        pagination={{
          onChange: (page) => {
            console.log(page);
          },
          pageSize: 5,
          showSizeChanger: false
        }}

        renderItem={(date: any) => (
          <>
            {" "}
            <List.Item
              actions={[
                <MyDrop
                  date={date}
                  handleOpenModal={() => handleOpenModal(date)}
                  join={() => join(date._id)}
                />
              ]}
            >
              <DateItem date={date} />
            </List.Item>
          </>
        )}
      />
      <Modal
        title={<ModalHeader title={getModalTitle()} />}
        open={isOpenModal}
        onCancel={handleCloseModal}
        footer={null}
        width={isMobile ? "100%" : "60%"}
      >
        {user.isDoctor && (
          <MedicalRecordForm
            form={form}
            toggleModal={toggleModal}
            date={selectedDate}
            setRefresh={setRefresh}
          />
        )}

        {user.isNutri && (
          <NutriForm
            form={form}
            toggleModal={toggleModal}
            date={selectedDate}
            setRefresh={setRefresh}
          />
        )}

        {user.isPychologist && (
          <PsychoForm
            form={form}
            toggleModal={toggleModal}
            date={selectedDate}
            setRefresh={setRefresh}
          />
        )}
      </Modal>
    </Card>
  );
};

export default DatesPage;