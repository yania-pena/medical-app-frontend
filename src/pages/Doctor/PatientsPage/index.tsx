import { PlusCircleOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Input, Modal, Row, Collapse, Select, DatePicker, DatePickerProps, InputNumber, message, List, Typography } from "antd";
import { useEffect, useState } from "react";
import { postData } from "../../../services/common/postData";
import { getData } from "../../../services/common/getData";
const { Panel } = Collapse;
const PatientsPage = () => {
    const [form] = Form.useForm();
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [loadingData, setLoadingData] = useState(false);
    const [patients, setPatients] = useState([]);

    const toggleModal = () => setIsOpenModal((prevState) => !prevState)

    const onChange: DatePickerProps['onChange'] = (date, dateString) => {
        console.log(date, dateString);
        form.setFieldsValue({ bornDate: date })
    };

    const onFinish = async (values: any) => {
        setIsSubmitting(true);
        const completeValues = {
            profile: {
                ...values,
                bornDate: new Date(values.bornDate),
                phone: parseInt(values.phone),
                weight: Math.round(parseFloat(values.weight)),
                height: Math.round(parseFloat(values.height)),
                imc: Math.round(parseFloat(values.imc))
            },
            isPatient: true,
            email: values.email,
            firstname: values.firstName,
            lastname: values.lastName
        }
        const request = await postData('api/users', completeValues)
        if (request.status) {
            message.success("Usuario creado exitosamente")
            setIsSubmitting(false);
            toggleModal();
            getPatients();
            return;
        }
        setIsSubmitting(false);
        message.error(request.msg)
    }

    const onChangeWeight = (value: string) => {
        if (value !== "") {
            const weightValue = parseFloat(value)
            const heightValue = form.getFieldValue('height')
            if (heightValue) {
                const result = weightValue / (parseFloat(heightValue) * parseFloat(heightValue));
                form.setFieldsValue({ imc: result.toFixed(2) })
            }
        }
    }

    const onChangeHeight = (value: string) => {
        if (value !== "") {
            const heightValue = parseFloat(value)
            const weightValue = form.getFieldValue('weight')
            if (weightValue) {
                const result = parseFloat(weightValue) / (heightValue * heightValue);
                form.setFieldsValue({ imc: result.toFixed(2) })
            }
        }
    }


    const getPatients = async () => {
        setLoadingData(true);
        const request = await getData('api/users/patients')
        if (request.status) {
            setLoadingData(false)
            setPatients(request.data)
            return;
        }
        setLoadingData(false)
        message.error(request.msg)
    }


    useEffect(() => {
        getPatients();
    }, [])

    return (
        <div>
            <Card title="Pacientes" extra={<Button type="primary" onClick={toggleModal} icon={<PlusCircleOutlined />}>Nuevo</Button>}>
                <List
                    loading={loadingData}
                    bordered
                    dataSource={patients}
                    renderItem={(patient:any) => (
                        <List.Item actions={[<a key="list-loadmore-edit">edit</a>, <a key="list-loadmore-more">more</a>]}>
                            {patient.firstname} {patient.lastname}
                        </List.Item>
                    )}
                />
            </Card>
            <Modal title="Nuevo Paciente" open={isOpenModal} onCancel={toggleModal} footer={null}>
                <Form onFinish={onFinish} form={form}>
                    <Collapse accordion>
                        <Panel header="Información General" key="1">
                            <Row>
                                <Col span={11}>
                                    <Form.Item label="Nombres" name="firstName"
                                        rules={[{ required: true, message: 'Por favor ingrese los nombres del paciente' }]}>
                                        <Input />
                                    </Form.Item>
                                </Col>
                                <Col span={11} offset={1}>
                                    <Form.Item label="Apellidos" name="lastName"
                                        rules={[{ required: true, message: 'Por favor ingrese los apellidos del paciente' }]}>
                                        <Input />
                                    </Form.Item>
                                </Col>
                                <Col span={11}>
                                    <Form.Item label="Cédula" name="ci"
                                        rules={[{ required: true, message: 'Por favor ingrese el número de cédula del paciente' }]}>
                                        <Input />
                                    </Form.Item>
                                </Col>
                                <Col span={11} offset={1} >
                                    <Form.Item label="Estado Civil" name="civilState">
                                        <Select
                                            defaultValue="Soltero"
                                            options={[
                                                { value: 'Soltero', label: 'Soltero' },
                                                { value: 'Casado', label: 'Casado' },
                                                { value: 'Divorciado', label: 'Divorciado' },
                                                { value: 'Viudo', label: 'Viudo' },
                                            ]}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item label="Fecha de Nacimiento" name="bornDate"
                                        rules={[{ required: true, message: 'Por favor ingrese la fecha de nacimiento del paciente' }]}>
                                        <DatePicker onChange={onChange} style={{ width: '100%' }} />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item label="Lugar de nacimiento" name="bornPlace">
                                        <Select
                                            defaultValue="Pichincha"
                                            options={[
                                                { label: 'Azuay', value: 'Azuay' },
                                                { label: 'Bolívar', value: 'Bolivar' },
                                                { label: 'Guayas', value: 'Guayas' },
                                                { label: 'Manabí', value: 'Manabí' },
                                                { label: 'Pichincha', value: 'Pichincha' }
                                            ]}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={11}>
                                    <Form.Item label="Ocupación" name="ocupation">
                                        <Input />
                                    </Form.Item>
                                </Col>
                                <Col span={11} offset={1}>
                                    <Form.Item label="Profesión" name="profession">
                                        <Input />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item label="Referido por" name="referredBy" >
                                        <Input />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Panel>
                        <Panel header="Información de contacto" key="2">
                            <Row>
                                <Col span={11}>
                                    <Form.Item label="Dirección" name="address"
                                        rules={[{ required: true, message: 'Por favor ingrese la dirección del paciente' }]}>
                                        <Input />
                                    </Form.Item>
                                </Col>
                                <Col span={11} offset={1}>
                                    <Form.Item label="Teléfono" name="phone">
                                        <Input />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item label="Email" name="email"
                                        rules={[{ required: true, message: 'Por favor ingrese la dirección de correo electrónico del paciente' }]}>
                                        <Input />
                                    </Form.Item>
                                </Col>

                            </Row>
                        </Panel>
                        <Panel header="Información médica" key="3">
                            <Row>
                                <Col span={7} >
                                    <Form.Item label="Peso" name="weight"
                                        rules={[{ required: true, message: 'Por favor ingrese el peso del paciente' }]}>
                                        <Input onChange={(e) => onChangeWeight(e.target.value)} />
                                    </Form.Item>
                                </Col>
                                <Col span={7} offset={1}>
                                    <Form.Item label="Talla" name="height"
                                        rules={[{ required: true, message: 'Por favor ingrese la talla del paciente' }]}>
                                        <Input onChange={(e) => onChangeHeight(e.target.value)} />
                                    </Form.Item>
                                </Col>
                                <Col span={7} offset={1}>
                                    <Form.Item label="IMC" name="imc"
                                        rules={[{ required: true, message: 'Por favor ingrese el cálculo de IMC del paciente' }]}>
                                        <Input disabled />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Panel>
                    </Collapse>

                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'end', marginTop: 16 }} >
                        <Button htmlType="submit" type="primary" loading={isSubmitting}>
                            Guardar
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    )
}

export default PatientsPage;