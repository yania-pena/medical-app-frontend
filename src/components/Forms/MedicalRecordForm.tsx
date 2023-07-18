import React, { useContext, useEffect, useState } from "react";
import {
  Button,
  Col,
  Form,
  Input,
  Row,
  Collapse,
  Select,
  DatePicker,
  DatePickerProps,
  InputNumber,
  message,
  List,
  Typography,
  Space,
  Checkbox,
  Upload,
  Alert,
} from "antd";
import { postData, postFormData } from "../../services/common/postData";
import { MinusCircleOutlined, PlusOutlined, UploadOutlined } from "@ant-design/icons";
import type { RangePickerProps } from "antd/es/date-picker";
import moment from "moment";
import { putData } from "../../services/common/putData";
import { Console } from "console";
import MultipleFileInput from "../CustomInputs/MultipleFileInput";
import type { RcFile } from 'antd/es/upload/interface';
import UploadComponent from "../CustomInputs/CloudinaryFileInput";
import { getLastDate, groupDates } from "../../utils/dates";
import LastDate from "../LastDate";
import { AuthContext } from "../../context/AuthContext";
import SendAlertButton from "../SendAlertButton";
import { measurementsRgx, onlyChars } from "../../utils/exp";

const { Panel } = Collapse;
const { TextArea } = Input;


const getBase64 = (img: RcFile, callback: (url: string) => void) => {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result as string));
  reader.readAsDataURL(img);
};

export interface IMedicalRecordFormProps {
  toggleModal: Function;
  form: any;
  date: any;
  setRefresh: any;
}

const MedicalRecordForm = ({
  form,
  toggleModal,
  date,
  setRefresh,
}: IMedicalRecordFormProps) => {
  let patientHasMainRecord = false;
  if ("patient" in date) {
    if ("dates" in date.patient) {
      const datesWithRecord = date.patient.dates.filter(
        (date: any) => "record" in date
      );
      if (datesWithRecord.length > 0) {
        patientHasMainRecord =
          datesWithRecord.filter((date: any) => date.record?.isMain).length > 0;
      }
    }
  }


  const setSomeValues = (date: any) => {
    console.log('handling...')
    if (date.length > 0) {
      console.log('aaaaaa')
      if ('record' in date[0]) {
        console.log('bbbbbb', date[0])
        if ('medicalInfo' in date[0].record) {
          console.log('cccccc')
          const { medicalInfo } = date[0].record
          form.setFieldValue("height", medicalInfo.height.toString())
          form.setFieldValue("weight", medicalInfo.height.toString())
          form.setFieldValue("imc", medicalInfo.height.toString())
        }
      }
    }
  }


  const [lastDate, setLastDate] = useState<any>([])


  useEffect(() => {
    if ("patient" in date) {
      /*
      const ld = getLastDate(date.patient)
      if (ld !== false) {
        setLastDate(ld)
      }
      */

      if ("dates" in date.patient) {
        if (date.patient.dates.length > 0) {


          const fechaActual = moment(date.start);

          // Filtrar eventos excluyendo las fechas posteriores a la fecha actual
          const eventosFiltrados = date.patient.dates.filter((evento: any) => {
            const fechaEvento = moment(evento.start);
            return fechaEvento.isBefore(fechaActual);
          });


          const comparareDates = (a: any, b: any) => {
            return b.start.localeCompare(a.start);
          };
          const sortedDates = eventosFiltrados.sort(comparareDates);

          console.log('sd', sortedDates)

          const gd: any = groupDates(sortedDates)

          console.log('gd', gd)

          if (gd !== false) {
            if (gd.length > 0) {
              const recentGroup = gd[0]
              setLastDate(recentGroup)
              setSomeValues(recentGroup)
            }
          }

        }
      }
    }

  }, [date])



  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<any>([])



  const onChange: DatePickerProps["onChange"] = (date, dateString) => {
    console.log(date, dateString);
    form.setFieldsValue({ bornDate: date });
  };

  const disabledDate = (current: any) => {
    const eighteenYearsAgo = moment().subtract(18, "years");
    return current && current > eighteenYearsAgo;
  };

  const onFinish = async (values: any) => {
    setIsSubmitting(true);
    console.log(values);




    let testsToApi = [];
    if (values.Test) {
      testsToApi = values.Test.map((test: any) => {
        return {
          name: typeof test === "string" ? test : test.value,
        };
      });
    }


    let testResultsToApi = []
    if (values.testResults) {
      const imageForm = new FormData()
      imageForm.append('image', values.testResults)
      const uploadImage = await postFormData('images', imageForm)

      if (uploadImage.status) {
        testResultsToApi.push(
          {
            url: uploadImage['url_images'][0]
          }
        )
      }

      if (!uploadImage.status) {
        alert('Hubo un problema al cargar los archivos, por favor intenta de nuevo')
        setIsSubmitting(false);
        return;
      }
    }


    const completeValues = {
      iddate: date._id,
      isMain: patientHasMainRecord ? false : true,
      idpatient: date.idpatient,
      idespecialist: date.idespecialist,

      generalInfo: {
        bornDate: new Date(values.bornDate),
        bornPlace: values.bornPlace,
        ci: values.ci,
        civilState: values.civilState,
      },
      contactInfo: {
        address: values.address,
        phone: parseInt(values.phone),
      },
      medicalInfo: {
        weight: Math.round(parseFloat(values.weight)),
        height: Math.round(parseFloat(values.height)),
        imc: Math.round(parseFloat(values.imc)),
        comments: typeof (values.comments) === "undefined" ? "" : values.comments
      },
      Test: testsToApi,
      testResults: testResultsToApi,
      recipe: values.recipe,
      care: values.care,
      diet: values.diet,
      nutriInfo: {
        backMeasurement: parseFloat(values.backMeasurement),
        waistMeasurement: parseFloat(values.waistMeasurement),
        neckMeasurement: parseFloat(values.neckMeasurement),
        armsMeasurement: parseFloat(values.armsMeasurement),
        hipMeasurement: parseFloat(values.hipMeasurement),
        legsMeasurement: parseFloat(values.legsMeasurement)
      },
    };

    if ("record" in date) {
      const request = await putData(
        "api/records/" + date.record._id,
        completeValues
      );
      if (request.status) {
        message.success("Ficha médica actualizada exitosamente");
        setIsSubmitting(false);
        setRefresh((prevState: boolean) => !prevState);
        toggleModal();
        return;
      }
      setIsSubmitting(false);
      message.error(request.msg);
    } else {
      const request = await postData("api/records", completeValues);
      if (request.status) {
        message.success("Ficha médica creada exitosamente");
        setIsSubmitting(false);
        setRefresh((prevState: boolean) => !prevState);
        toggleModal();
        return;
      }
      setIsSubmitting(false);
      message.error(request.msg);
    }
  };


  const [showAlert, setShowAlert] = useState(false)

  const onChangeWeight = (value: string) => {
    if (value !== "") {
      const weightValue = parseFloat(value);
      const heightValue = form.getFieldValue("height");
      if (heightValue) {
        const result =
          weightValue / (parseFloat(heightValue) * parseFloat(heightValue));

        form.setFieldsValue({ imc: result.toFixed(2) });
        /*if (result > 25) {
          setShowAlert(true)
        }*/
      }
    }
  };

  const onChangeHeight = (value: string) => {
    if (value !== "") {
      const heightValue = parseFloat(value);
      const weightValue = form.getFieldValue("weight");
      if (weightValue) {
        const result = parseFloat(weightValue) / (heightValue * heightValue);
        form.setFieldsValue({ imc: result.toFixed(2) });
        /*if (result > 25) {
          setShowAlert(true)
        }*/
      }
    }
  };

  const tests = [
    "Biometria Hemática",
    "Glucosa",
    "Insulina",
    "Hemoglobina glicosilada",
    "Triglicéridos",
    "Colesterol",
    "Hdl",
    "ldl",
    "Creatinina",
    "Ácido úrico",
    "TSH",
    "T3",
    "T4",
    "Proteínas totales albumina",
    "TP - TTP",
    "Endoscopia Digestiva Alta",
  ];

  const generateTests = () => {
    const fullTests = tests.map((test: string) => {
      return { label: test, value: test };
    });
    return fullTests;
  };

  const [imageUrl, setImageUrl] = useState('')

  const getFile = (e: any) => {
    console.log('Upload event:', e);
    if (Array.isArray(e)) {
      console.log('is arrayy!!')
      return e
    }
    return e && e.file.originFileObj;
  };

  const tr = form.getFieldValue('testResults')

  console.log('tr', tr)

  const dfl = (tr && tr.length > 0) ? tr.map((result: any, index: any) => {
    return {
      uid: index,
      name: result.url,
      status: 'done',
      url: result.url,
    }
  })
    :
    []


  console.log('dfl', dfl)


  const imcValue = Form.useWatch('imc', form);


  return (
    <>
      <Collapse accordion>
        <Panel header="Cita previa" key="0">
          <LastDate date={lastDate} patient={date.patient} />
        </Panel>
      </Collapse>
      <Form onFinish={onFinish} form={form}>
        <Collapse accordion>
          {!patientHasMainRecord && (
            <>
              <Panel header="Información General" key="1">
                <Row>
                  <Col span={11}>
                    <Form.Item
                      label="Cédula"
                      name="ci"
                      rules={[
                        {
                          required: true,
                          message:
                            "Por favor ingrese el número de cédula del paciente",
                        },
                        {
                          pattern: /^\d+$/,
                          message: "Sólo debe contener caracteres numéricos",
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={11} offset={1}>
                    <Form.Item
                      label="Estado Civil"
                      name="civilState"
                      rules={[
                        {
                          required: true,
                          message:
                            "Por favor ingrese el estado civil del paciente",
                        },
                      ]}
                    >
                      <Select
                        placeholder="Seleccione una opción"
                        options={[
                          { value: "Soltero", label: "Soltero" },
                          { value: "Casado", label: "Casado" },
                          { value: "Divorciado", label: "Divorciado" },
                          { value: "Viudo", label: "Viudo" },
                        ]}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={11}>
                    <Form.Item
                      label="Fecha de Nacimiento"
                      name="bornDate"
                      rules={[
                        {
                          required: true,
                          message:
                            "Por favor ingrese la fecha de nacimiento del paciente",
                        },
                      ]}
                    >
                      <DatePicker
                        onChange={onChange}
                        style={{ width: "100%" }}
                        disabledDate={disabledDate}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={11} offset={1}>
                    <Form.Item
                      label="Lugar de nacimiento"
                      name="bornPlace"
                      rules={[
                        {
                          required: true,
                          message:
                            "Por favor ingrese el lugar de nacimiento del paciente",
                        },
                        {
                          pattern: onlyChars,
                          message: "Sólo puedes ingresar letras"
                        }
                      ]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={11}>
                    <Form.Item label="Ocupación" name="ocupation"
                      rules={[
                        {
                          pattern: onlyChars,
                          message: "Sólo puedes ingresar letras"
                        }
                      ]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={11} offset={1}>
                    <Form.Item label="Profesión" name="profession"
                      rules={[
                        {
                          pattern: onlyChars,
                          message: "Sólo puedes ingresar letras"
                        }
                      ]}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={11}>
                    <Form.Item label="Referido por" name="referredBy" rules={[
                      {
                        pattern: onlyChars,
                        message: "Sólo puedes ingresar letras"
                      }
                    ]}>
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
              </Panel>
              <Panel header="Información de contacto" key="2">
                <Row>
                  <Col span={11}>
                    <Form.Item
                      label="Dirección"
                      name="address"
                      rules={[
                        {
                          required: true,
                          message: "Por favor ingrese la dirección del paciente",
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={11} offset={1}>
                    <Form.Item
                      label="Teléfono"
                      name="phone"
                      rules={[
                        {
                          pattern: /^\d+$/,
                          message: "Sólo debe contener caracteres numéricos",
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
              </Panel>
            </>
          )}

          <Panel header="Información médica" key="3">
            <Row>
              <Col xxl={11} xl={11} lg={11} md={11} sm={24} xs={24}>
                <Row>
                  <Col span={11}>
                    <Form.Item
                      label="Altura"
                      name="height"
                      rules={[
                        {
                          required: true,
                          message: "Por favor ingrese la altura del paciente",
                        },
                        { pattern: /^(2(\.0+)?|1(\.[0-9]+)?|0(\.[0-9]+)?)\s*$/, message: 'Estatura incorrecta' }
                      ]}
                    >
                      <Input onChange={(e) => onChangeHeight(e.target.value)} suffix="m" />
                    </Form.Item>
                  </Col>
                  <Col span={11} offset={2}>
                    <Form.Item
                      label="Peso"
                      name="weight"
                      rules={[
                        {
                          required: true,
                          message: "Por favor ingrese el peso del paciente",
                        },
                        { pattern: /^(200(\.0+)?|((?:[0-1]?\d{0,2}|2[0-1]\d)(\.\d+)?))\s*$/, message: 'Peso incorrecto' }
                      ]}
                    >
                      <Input onChange={(e) => onChangeWeight(e.target.value)} suffix="kg" />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      label="IMC"
                      name="imc"
                      rules={[
                        {
                          required: true,
                          message: "Por favor ingrese el cálculo de IMC del paciente",
                        },
                      ]}
                    >
                      <Input disabled />
                    </Form.Item>
                    {parseFloat(imcValue) > 25 && (
                      <>
                        <Alert style={{ marginTop: -12, marginBottom: 4 }} type="error" message="IMC riesgoso, el paciente debe agendar una cita pronto" />
                        <SendAlertButton email={date.patient.email} />
                      </>
                    )}
                  </Col>
                </Row>

              </Col>

              <Col xxl={12} xl={12} lg={12} md={12} sm={24} xs={24} offset={1}>
                <Row>
                  <Col span={24}>
                    <Form.Item label="Exámenes" name="Test">
                      <Select
                        placeholder="Seleccione los exámenes que debe realizarse el paciente"
                        options={generateTests()}
                        mode="multiple"
                        allowClear
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      label="Resultados"
                      name='testResults'
                      getValueFromEvent={getFile}
                    >
                      <Upload
                        showUploadList={true}
                        multiple={true}
                        defaultFileList={dfl}
                      >
                        <Button icon={<UploadOutlined />}>Subir archivo</Button>
                      </Upload>
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
              <Col span={24}>
                <h2>RECETA</h2>
              </Col>
              <Form.List name="recipe">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }: any) => (
                      <Space
                        key={key}
                        style={{ display: "flex", marginBottom: 8 }}
                        align="baseline"
                      >
                        <Row>
                          <Col span={24}>
                            <h2> Medicamento {key + 1}</h2>
                          </Col>
                          <Col span={24}>
                            <Form.Item
                              {...restField}
                              name={[name, "name"]}
                              label="Medicamento"
                              rules={[
                                {
                                  required: true,
                                  message: "Ingrese el nombre del medicamento",
                                },
                              ]}
                            >
                              <Input placeholder="Nombre" />
                            </Form.Item>
                          </Col>
                          <Form.Item
                            {...restField}
                            name={[name, "dose"]}
                            label="Dosis"
                            rules={[
                              {
                                required: true,
                                message: "Ingrese la dosis del medicamento",
                              },
                            ]}
                          >
                            <Input placeholder="Dosis" />
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            name={[name, "frequency"]}
                            label="Frecuencia"
                            rules={[
                              {
                                required: true,
                                message: "Ingrese la frecuencia del medicamento",
                              },
                            ]}
                          >
                            <Input placeholder="Frecuencia" />
                          </Form.Item>
                        </Row>
                        <MinusCircleOutlined onClick={() => remove(name)} />
                      </Space>
                    ))}
                    <Col span={24}>
                    <Form.Item>
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        block
                        icon={<PlusOutlined />}
                      >
                        Agregar medicamento
                      </Button>
                    </Form.Item>
                    </Col>
                  </>
                )}
              </Form.List>
              <Col span={24}>
                <h2>CUIDADO DE LA HERIDA</h2>
              </Col>

              <Col span={24}>

                <Form.List name="care">
                  {(fields, { add, remove }) => (
                    <Row>
                      {fields.map(({ key, name, ...restField }: any) => (
                        <Col
                          span={12}
                          style={{ display: "flex", marginBottom: 8 }}
                        // align="baseline"
                        >
                          <Row>
                            <Col span={24}>
                              <h2> Cuidado {key + 1}
                                <MinusCircleOutlined onClick={() => remove(name)} /></h2>
                            </Col>
                            <Col span={24}>
                              <Form.Item
                                {...restField}
                                name={[name, "description"]}
                                label="Cuidado"
                                rules={[
                                  {
                                    required: true,
                                    message: "Ingrese el cuidado de la herida",
                                  },
                                ]}
                              >
                                <TextArea rows={4} />
                              </Form.Item>
                            </Col>
                          </Row>
                        </Col>
                      ))}
                      <Col span={24}>
                        <Form.Item>
                          <Button
                            type="dashed"
                            onClick={() => add()}
                            block
                            icon={<PlusOutlined />}
                          >
                            Agregar cuidado
                          </Button>
                        </Form.Item>
                      </Col>
                    </Row>
                  )}
                </Form.List>

              </Col>


              <Col span={24}>
                <h2>MEDIDAS</h2>
              </Col>
              <Col span={11}>
                <Form.Item
                  name="neckMeasurement"
                  label="Medida de cuello"
                  rules={[
                    { required: true, message: "Campo requerido" },
                    { pattern: measurementsRgx, message: "Medida inválida" }
                  ]}
                >
                  <Input suffix={<span>cm</span>} />
                </Form.Item>
              </Col>
              <Col span={11} offset={1}>

                <Form.Item
                  name="armsMeasurement"
                  label="Medida de brazos"
                  rules={[
                    { required: true, message: "Campo requerido" },
                    { pattern: measurementsRgx, message: "Medida inválida" }
                  ]}
                >
                  <Input suffix={<span>cm</span>} />
                </Form.Item>
              </Col>
              <Col span={11}>

                <Form.Item
                  name="backMeasurement"
                  label="Medida de pecho"
                  rules={[
                    { required: true, message: "Campo requerido" },
                    { pattern: measurementsRgx, message: "Medida inválida" }
                  ]}
                >
                  <Input suffix={<span>cm</span>} />
                </Form.Item>
              </Col>
              <Col span={11} offset={1}>

                <Form.Item
                  name="waistMeasurement"
                  label="Medida de cintura"
                  rules={[
                    { required: true, message: "Campo requerido" },
                    { pattern: measurementsRgx, message: "Medida inválida" }
                  ]}
                >
                  <Input suffix={<span>cm</span>} />
                </Form.Item>
              </Col>
              <Col span={11}>

                <Form.Item
                  name="hipMeasurement"
                  label="Medida de cadera"
                  rules={[
                    { required: true, message: "Campo requerido" },
                    { pattern: measurementsRgx, message: "Medida inválida" }
                  ]}
                >
                  <Input suffix={<span>cm</span>} />
                </Form.Item>
              </Col>
              <Col span={11} offset={1}>

                <Form.Item
                  name="legsMeasurement"
                  label="Medida de piernas"
                  rules={[
                    { required: true, message: "Campo requerido" },
                    { pattern: measurementsRgx, message: "Medida inválida" }
                  ]}
                >
                  <Input suffix={<span>cm</span>} />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item label="Observaciones" name="comments" style={{ marginTop: 12 }} >
                  <Input.TextArea rows={2} />
                </Form.Item>
              </Col>
            </Row>
          </Panel>

        </Collapse>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "end",
            marginTop: 16,
          }}
        >
          <Button htmlType="submit" type="primary" loading={isSubmitting}>
            Guardar
          </Button>
        </div>
      </Form>
    </>

  );
};

export default MedicalRecordForm;
