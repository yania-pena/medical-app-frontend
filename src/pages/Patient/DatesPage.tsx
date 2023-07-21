import React, { useContext, useState, useEffect } from "react";
import { Card, Form, Select, Row, Col, Spin, Collapse, Modal, Button, MenuProps, Dropdown, Space, Pagination, List, message, DatePickerProps, DatePicker } from "antd";
import moment from "moment";
import { CalendarOutlined, DownOutlined } from "@ant-design/icons";
import { getData } from "../../services/common/getData";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { CallContext } from "../../context/CallContext";
import AgoraUIKit from "agora-react-uikit";
import { PDFDownloadLink } from "@react-pdf/renderer";
import Recepepdf from "../../components/PDF/Recepepdf";
import LastDate from "../../components/LastDate";
import es from 'date-fns/locale/es';
import { format } from 'date-fns'
import { RangePickerProps } from "antd/es/date-picker";
import AgoraRTC from 'agora-rtc-sdk-ng';
import { NewCallContext } from "../../context/NewCallContext";
import { postData } from "../../services/common/postData";


const { Panel } = Collapse;

const gridStyle: React.CSSProperties = {
  width: "100%",
  textAlign: "center",
};


const MyDrop = ({ date, join }: any) => {

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


  let items: MenuProps['items'] = [];


  items.push({
    key: '1',
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
  const [filterBy, setFilterBy] = useState("today");

  const { join, isActive, call, leave }: any = useContext(CallContext)

  const [startDate, setStartDate] = useState<any>('')
  const [endDate, setEndDate] = useState<any>('')


  const [totalItems, setTotalItems] = useState(0)

  const [filteredDates, setFilteredDates] = useState<any>([])

  const [filtered, setFiltered] = useState(false)

  const [showingToday, setShowingToday] = useState(false)


  const getDates = async () => {
    setLoadingData(true);
    let url = "api/dates/byPatient/";
    const request = await getData(url + user._id);
    if (request.status) {
      let specialists: any = [];
      const requestSpecialists = await getData("api/users/specialists");
      if (requestSpecialists.status) {
        specialists = requestSpecialists.data;
      }

      if (specialists.length > 0) {
        const fullDates = request.data.map((date: any) => {
          return {
            ...date,
            specialist: specialists.find(
              (sp: any) => sp._id === date.idespecialist
            ),
            patient: user,
          };
        });
        setInitialData(fullDates.reverse());
        getTodayDates(fullDates.reverse());

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
      }
      setLoadingData(false);
    }
  };

  useEffect(() => {
    getDates();
  }, []);

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
            <Collapse accordion>
              <Panel key={date._id} header={"Fecha: " + format(new Date(date.start), 'd MMMM, yyyy h:mm a', { locale: es })} >
                <List.Item
                  actions={[
                    <MyDrop
                      date={date}
                      join={() => join(date._id)}
                    />
                  ]}
                >
                  <LastDate
                    date={[date]}
                    patient={date.patient}
                    hideDatetime={true}
                  />


                </List.Item>
              </Panel>
            </Collapse>
          </>
        )}
      />
    </Card>
  );
};

export default DatesPage;