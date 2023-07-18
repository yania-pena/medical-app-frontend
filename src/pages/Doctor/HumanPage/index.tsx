import { Card, Button, message, Form, InputNumber, Spin, Row, Col, Select } from "antd";
import MyAnimate from "../../../components/Animate";
import { Tabs } from "antd";
import type { TabsProps } from "antd";
import { useState, useContext, useEffect, Suspense } from "react";
import MyScene from "../../../components/MyScene";
import { transformShape } from "../../../services/common/postData";
import { AuthContext } from "../../../context/AuthContext";
import { getData } from "../../../services/common/getData";
import './styles.css'
import { AirlineSeatIndividualSuiteRounded } from "@mui/icons-material";
import ABC from "./abc";

const { Option } = Select

export default function HumanPage() {

  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [loadingData, setLoadingData] = useState(false)
  const [patients, setPatients] = useState<any>([])
  const [submitting, setSubmitting] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [originalUrl, setOriginalUrl] = useState('')
  const [value, setValue] = useState<any>(80)


  const { user }: any = useContext(AuthContext)

  const getPatients = async () => {
    setLoadingData(true);
    const requestPatients = await getData("api/users/patients");
    if (requestPatients.status) {
      setPatients(requestPatients.data);
    }
    setLoadingData(false);
  };

  const getPatient = async () => {
    const request = await getData('api/users/patients/' + user._id)
    let patient: any = null
    if (request.status) {
      if (request.data.length > 0) {
        patient = request.data[0]
      }
    }

    console.log('patient', patient)

    if (patient !== null) {
      setSelectedPatient(patient._id)
      if ('bodyImages' in patient) {
        // setResults(patient.bodyImages)
        const getOriginal = patient.bodyImages.length > 0 ? patient.bodyImages.find((bodyImage: any) => bodyImage.name.includes('original')) : ''
        if (getOriginal !== '') {
          setOriginalUrl(getOriginal.url)
        }
      }
    }
  }

  useEffect(() => {
    if (!user.isPatient) {
      getPatients();
    }

    if (user.isPatient) {
      getPatient()
    }
  }, []);

  const onFinish = async (values: any) => {
    setSubmitting(true)
    if (originalUrl !== "") {
      const data = {
        "medida_cuello": values.cuello,
        "medida_brazos": values.brazos,
        "medida_pecho": values.pecho,
        "medida_cintura": values.cintura,
        "medida_cadera": values.cadera,
        "medida_piernas": values.piernas,
        "image_url": originalUrl
      }
      const request = await transformShape('images/shape/transform', data)
      if (request.status) {
        setResults(request.results)
        setSubmitting(false)
        return;
      }
    }
    setSubmitting(false)
    message.error("Error procesando la simulación")
  };

  const onFinish2 = async (values: any) => {
    setSubmitting(true)
    if (originalUrl !== "") {
      const data = {
        "image_url": originalUrl,
        "peso": values.peso
      }
      const request = await transformShape('images/shape/transform_by_weight', data)
      if (request.status) {
        setResults(request["url_images"])
        setSubmitting(false)
        return;
      }
    }
    setSubmitting(false)
    message.error("Error procesando la simulación")
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };


  const handleSelectPatient = (patientId: any) => {
    setResults([])
    const sp = patients.find((patient: any) => patient._id === patientId)
    console.log('sp', sp)
    if (sp) {
      setSelectedPatient(sp);
      if ('bodyImages' in sp) {
        // setResults(sp.bodyImages)
        const getOriginal = sp.bodyImages.length > 0 ? sp.bodyImages.find((bodyImage: any) => bodyImage.name.includes('original')) : ''
        if (getOriginal !== '') {
          setOriginalUrl(getOriginal.url)
        }
      }

    }
  }

  const [form] = Form.useForm()

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: `Por Fotografía (IA - Nuevo)`,
      children: (
        <MyScene />
      ),
    },
    {
      key: "2",
      label: `Por medidas`,
      children: (
        <>
          {loadingData ? <Spin /> : (<Row style={{ marginBottom: 32 }}>
            <Col span={24}>
              {patients && patients.length > 0 && (
                <Select onChange={handleSelectPatient} style={{ width: '100%' }} placeholder="Seleccionar paciente">
                  {
                    patients.map((patient: any) => <Option value={patient._id}>{patient.firstname + " " + patient.lastname}</Option>)
                  }
                </Select>
              )}
            </Col>
          </Row>)}
          <Form
            form={form}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            <Row>
              <Col span={11}>
                <Form.Item
                  label="Cuello"
                  name="cuello"
                // rules={[{ required: true, message: "Torso Requerido" }]}
                >
                  <InputNumber min={60} max={130} defaultValue={30} />
                </Form.Item>
              </Col>
              <Col span={11} offset={1}>
                <Form.Item
                  label="Brazos"
                  name="brazos"
                // rules={[{ required: true, message: "Torso Requerido" }]}
                >
                  <InputNumber min={60} max={130} defaultValue={30} />
                </Form.Item>
              </Col>
              <Col span={11}>
                <Form.Item
                  label="Pecho"
                  name="pecho"
                // rules={[{ required: true, message: "Torso Requerido" }]}
                >
                  <InputNumber min={60} max={130} defaultValue={30} />
                </Form.Item>
              </Col>
              <Col span={11} offset={1}>
                <Form.Item
                  label="Cintura"
                  name="cintura"
                // rules={[{ required: true, message: "Torso Requerido" }]}
                >
                  <InputNumber min={60} max={130} defaultValue={30} />
                </Form.Item>
              </Col>
              <Col span={11}>
                <Form.Item
                  label="Cadera"
                  name="cadera"
                // rules={[{ required: true, message: "Torso Requerido" }]}
                >
                  <InputNumber min={60} max={130} defaultValue={30} />
                </Form.Item>
              </Col>
              <Col span={11} offset={1}>
                <Form.Item
                  label="Piernas"
                  name="piernas"
                // rules={[{ required: true, message: "Piernas Requeridas" }]}
                >
                  <InputNumber min={60} max={130} defaultValue={5} />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item wrapperCol={{ offset: 8, span: 16 }} extra={<div>Para obtener los mejores resultados ingresa valores cercanos entre sí</div>} >
              <Button type="primary" htmlType="submit" loading={submitting}>
                Procesar
              </Button>
            </Form.Item>
          </Form>
          <div>
            {(originalUrl !== "" && results.length === 0) && <img src={originalUrl} alt="" />}
            {(!submitting && results.length > 0) && (
              <div>
                {results && results.map((result: any, index: any) => (
                  <img
                    src={result.url}
                    alt=""
                    className={"image-" + index.toString()}
                    style={{
                      display: index === 0 ? 'none' : 'block'
                    }}
                  />
                ))}
              </div>
            )}

          </div>
        </>

        // <MyAnimate src="https://dannygua.github.io/paginabody/ANIMACION.html" />
      ),
    }
  ];

  return (
    <>
      <Card title="Simulación corporal">
        <Tabs defaultActiveKey="1" items={items} />
      </Card>
    </>
  );
}
