import { PlusOutlined } from '@ant-design/icons';
import { Row, Col, Button, Upload, Form, message, Select, Spin, Typography, Card } from 'antd';
import React, { useState, useEffect, useContext } from 'react';
import { postImageData } from '../../services/common/postData';
import type { RcFile } from 'antd/es/upload/interface';
import { putData } from '../../services/common/putData';
import { getData } from '../../services/common/getData';
import { AuthContext } from '../../context/AuthContext';

const getBase64 = (img: RcFile, callback: (url: string) => void) => {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result as string));
  reader.readAsDataURL(img);
};

const { Option } = Select;

const MyScene = () => {
  const [processing, setProcessing] = useState(false)
  const [resultUrl, setResultUrl] = useState('')
  const [originalUrl, setOriginalUrl] = useState('')

  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [loadingData, setLoadingData] = useState(false)
  const [patients, setPatients] = useState<any>([])

  const [results, setResults] = useState([])

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
        setResults(patient.bodyImages)
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

  const getFile = (e: any) => {

    getBase64(e.file.originFileObj as RcFile, (url) => {
      setOriginalUrl(url);
    });

    console.log('Upload event:', e);
    if (Array.isArray(e)) {
      console.log('is arrayy!!')
      return e
    }
    return e && e.file.originFileObj;
  };

  const onFinish = async (values: any) => {

    if (selectedPatient === null) {
      message.error("Seleccione un paciente!")
      return;
    }

    setProcessing(true);
    if (values.imagen) {
      const imageForm = new FormData()
      imageForm.append('imagen', values.imagen)
      const uploadImage = await postImageData('images/shape', imageForm)

      if (uploadImage.status) {
        message.success("Imagen procesada exitosamente!")
        setResultUrl(uploadImage['url_images'][0].url)
        setResults(uploadImage['url_images'])
        let userId = selectedPatient._id 
        if(user.isPatient){
          userId = user._id
        }
        const updateUser = await putData('api/users/' +  userId, { bodyImages: uploadImage['url_images'] })
        
        console.log('updateUser', updateUser)

        setProcessing(false)
        return;
      }

      alert('Hubo un problema al cargar los archivos, por favor intenta de nuevo')
      setProcessing(false);
      return;
    } else {
      message.error("No has seleccionado ninguna imagen!")
      setProcessing(false);
    }
  };

  const handleSelectPatient = (patientId: any) => {
    const sp = patients.find((patient: any) => patient._id === patientId)
    console.log('sp', sp)
    if (sp) {
      setSelectedPatient(sp);
      if ('bodyImages' in sp) {
        setResults(sp.bodyImages)
        const getOriginal = sp.bodyImages.length > 0 ? sp.bodyImages.find((bodyImage: any) => bodyImage.name.includes('original')) : ''
        if (getOriginal !== '') {
          setOriginalUrl(getOriginal.url)
        }
      }

    }
  }

  return (
    <div>
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

      <Form onFinish={onFinish}>
        <Row>
          <Col span={24}>
            <Form.Item
              label="Fotografía"
              name='imagen'
              getValueFromEvent={getFile}
            >
              <Upload
                name="avatar"
                listType="picture-card"
                className="avatar-uploader"
                showUploadList={false}
              >
                {originalUrl !== "" ? <img src={originalUrl} alt="avatar" style={{ width: '100%' }} /> : (
                  <div>
                    {!processing && <PlusOutlined />}
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                )}
              </Upload>
            </Form.Item>
          </Col>
          <Col span={24}>
            <Button htmlType="submit" type="primary" loading={processing}>
              Procesar
            </Button>
          </Col>
          <Col span={24}>
            <label> Procura que la fotografía sea en una posición natural y con un fondo blanco </label>
          </Col>
        </Row>
      </Form>

      {
        results && results.length > 0 && (
          <Row>
            {results.map((result: any, index: any) => (
              index > 0 && (
                <Col span={12} style={{ paddingRight: 20, paddingBottom: 20 }}>
                  <Card cover={<img src={result.url} alt="" />}>
                    {index === 1 ? (
                      <Typography.Text strong>Figura inicial</Typography.Text>

                    ) : (
                      <Typography.Text strong>Mes {index - 1}</Typography.Text>
                    )}

                  </Card>
                </Col>
              )
            ))}
          </Row>
        )
      }

    </div>
  );
};

export default MyScene;
