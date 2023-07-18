import { Alert, Button } from "antd"
import { useState } from "react"
import { message } from 'antd'
import { postData } from "../../services/common/postData"


const SendAlertButton = ({email}: any) => {

    const [sending, setSending] = useState(false)

    const sendEmail = async () => {
        setSending(true)
        const request = await postData('api/users/sendWarning', { email })
        if (request.status) {
            message.success("Correo de advertencia enviado exitosamente!")
            setSending(false)
            return;
        }
        message.error("Algo salió mal")
        setSending(false)
    }
    return (
        <Button type="primary" onClick={sendEmail} loading={sending}>Enviar Correo de alerta</Button>
    )
}

export default SendAlertButton
