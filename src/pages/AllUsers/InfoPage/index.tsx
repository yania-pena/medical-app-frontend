import { useNavigate } from "react-router-dom";
import { Layout, Menu, Row, Col, Button } from 'antd';
import './styles.css';

const { Header, Content, Footer } = Layout;

const MainBanner = () => {
    const navigate = useNavigate()

    return (
        <Row className="banner-row">
            <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12} className="banner-first-col">
                    <span>Buena calidad de vida  al tratar</span>
                    <span> <label style={{ color: '#007E85' }} >eficazmente</label>  la obesidad.</span>
                    <Button type="primary" onClick={() => navigate("/login")}>Reserva tu cita</Button>
            </Col>
            <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12} className="banner-second-col">
                    <img src="./banner.png" alt="" />
                
            </Col>
        </Row>

    )
}

const Stats = () => {
    return (
        <div>
            <Row className="stats-title-row" justify="center">
                Nuestros resultados en números
            </Row>
            <Row className="stats-row" justify="center">
                <Col className="stat-col" xs={12} sm={12} md={12} lg={6} xl={6} xxl={6}>
                    99%
                    <span className="stat-name" >Satisfacción del cliente</span>
                </Col>
                <Col className="stat-col" xs={12} sm={12} md={12} lg={6} xl={6} xxl={6}>
                    15k
                    <span className="stat-name">Pacientes en línea</span>

                </Col>
                <Col className="stat-col bottom-stat" xs={12} sm={12} md={12} lg={6} xl={6} xxl={6}>
                    12k
                    <span className="stat-name">Pacientes atendidos</span>
                </Col>
                <Col className="stat-col bottom-stat" xs={12} sm={12} md={12} lg={6} xl={6} xxl={6}>
                    240%
                    <span className="stat-name">Crecimiento de compañía</span>
                </Col>
            </Row>
        </div>
    )
}


const InfoPage = () => {
    const navigate = useNavigate()

    return (
        <Layout>
            <Header
                className="info-navbar"
                style={{ position: 'sticky', top: 0, zIndex: 1, width: '100%', background: 'transparent', color: '#007E85', marginTop: 8 }}>
                <div
                    style={{
                        float: 'left',
                        width: 120,
                        height: 31,
                    }}
                >
                    Bypass Gástrico
                </div>
                <Menu
                    className="info-navbar-menu"
                    style={{ display: 'flex', flexDirection: 'row', justifyContent: 'end', background: 'transparent', color: '#007E85' }}
                    theme="dark"
                    mode="horizontal"
                    defaultSelectedKeys={['2']}
                    items={[
                        {
                            key: 'home',
                            label: 'Inicio'
                        },
                        {
                            key: 'services',
                            label: 'Servicios'
                        },
                        {
                            key: 'contact',
                            label: 'Contáctanos'
                        },
                        {
                            key: 'signin',
                            label: 'Iniciar Sesión',
                            onClick: () => navigate("/login"),
                            style: {
                                fontWeight: 'bolder',
                                color: '#007E85',
                                
                            }
                        },
                        {
                            key: 'signup',
                            label: 'Registrarse',
                            onClick: () => navigate("/register"),
                            style: {
                                fontWeight: 'bolder',
                                color: '#007E85'
                            }
                        },
                    ]}
                />
            </Header>
            <Content className="site-layout">
                <div style={{ minHeight: 380 }}>
                    <MainBanner />
                    <Stats />
                </div>
            </Content>
            <Footer style={{ textAlign: 'center' }}>Ant Design ©2023 Created by Ant UED</Footer>
        </Layout>
    )
}

export default InfoPage;