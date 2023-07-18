import React, { useContext, useState, useEffect } from "react";
import { Card, Form, Select, Row, Col, Spin, Collapse, Modal, Button, MenuProps, Dropdown, Space, Pagination, List } from "antd";
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


const { Panel } = Collapse;

const gridStyle: React.CSSProperties = {
  width: "100%",
  textAlign: "center",
};


const MyDrop = ({ date, join }: any) => {
  let items: MenuProps['items'] = [
    {
      key: '1',
      label: (
        <a rel="noopener noreferrer" onClick={join}>
          Ingresar a videollamada
        </a>
      ),
    }
  ];

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
      }
      setLoadingData(false);
    }
  };

  useEffect(() => {
    getDates();
  }, []);

  const getTodayDates = (data: any) => {
    const filteredDates = data.filter((date: any) =>
      moment().isSame(date.start, "day")
    );
    setDates(filteredDates);
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


  return (
    <Card
      title="Citas"
      extra={
        <Row align="middle" style={{ marginBottom: 8 }}>
          <Col>Filtro:</Col>
          <Col style={{ paddingLeft: 8 }}>
            <Select
              style={{ width: 120 }}
              onChange={handleChangeFilter}
              options={[
                { label: "Hoy", value: "today" },
                { label: "Todas", value: "all" },
              ]}
              defaultValue={"today"}
            />
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
              {filterBy === "today" ? "Mis citas de hoy" : "Todas mis citas"}{" "}
              {dates.length}
            </h3>
          </div>
        )}
      </Card.Grid>

      <List
        style={{ width: "100%" }}
        loading={loadingData}
        bordered
        dataSource={dates}
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
              <Panel key={date._id} header={"Fecha: " + format(new Date(date.start),'d MMMM', { locale: es }) } >
                <List.Item
                /*actions={[
                  <MyDrop
                    date={date}
                    handleOpenModal={() => handleOpenModal(date)}
                    join={() => join(date._id)}
                  />
                ]}*/
                >
                  <LastDate date={[date]} patient={date.patient} onlyHour={true} />

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
