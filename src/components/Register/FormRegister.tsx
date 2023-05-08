import { Button, Card, Form, Input, message } from 'antd';
import React, { useContext, useState } from 'react';
import { LoginOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { postData } from '../../services/common/postData';


export const FormRegister = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate()
    const { login } = useContext(AuthContext);

    const onFinish = async (values: any) => {
        try {
            setLoading(true);
            const datarequest = { ...values, isPatient: true };
            const resp = await postData('api/users/patients', datarequest)
            console.log('resp', resp)
            if (resp.status) {
                message.success("Te has registrado exitosamente!")

                const loginRequest = { email: values.email, password: values.password };
                const resp = await postData('api/users/login', loginRequest)
                if ('token' in resp) {
                    const { token } = resp
                    localStorage.setItem("userData", JSON.stringify(resp));
                    localStorage.setItem("token", token);
                    login(resp)
                    message.success(`Bienvenido`)
                    setTimeout(function () {
                    }, 5000);
                }

                setLoading(false);
                return;
                /*
                const { user, token } = resp
                localStorage.setItem("userData", JSON.stringify(user));
                localStorage.setItem("token", token);
                login(user)
                const { firstName, lastName } = user.profile.fullName;
                message.success(`Bienvenido ${firstName}  ${lastName}`)
                setTimeout(function () {
                }, 5000);
                */
            }
            setLoading(false);
            message.error(resp.msg);
        } catch (error) {
            console.error('El error es: ' + error);
        }
    }
    return (
        <Card title="Registro">
            <Form
                name="basic"
                initialValues={{ remember: true }}
                onFinish={onFinish}
                layout="vertical"
            >
                <Form.Item
                    label="Nombres"
                    name="firstname"
                    rules={[{ required: true, message: 'Por favor ingrese sus nombres!' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Apellidos"
                    name="lastname"
                    rules={[{ required: true, message: 'Por favor ingrese sus apellidos!' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Email"
                    name="email"
                    rules={[{ required: true, message: 'Por favor ingrese su correo!' }, { type: 'email', message: 'Ingrese un email valido!' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Password"
                    name="password"
                    rules={[{ required: true, message: 'Por favor ingrese su contraseña!' }]}
                >
                    <Input.Password />
                </Form.Item>

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        className='button-login'
                        icon={<LoginOutlined />}
                        loading={loading}
                        disabled={loading}
                    >
                        Registrarse
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    )
}

