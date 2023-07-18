import { Scheduler } from "@aldabil/react-scheduler";
import {
    EventActions,
    ProcessedEvent,
    ViewEvent
} from "@aldabil/react-scheduler/types";
import { useContext, useEffect, useState } from "react";
import { getData } from "../../../services/common/getData";
import { AuthContext } from "../../../context/AuthContext";
import { Modal, Spin, message } from "antd";

import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import { postData } from "../../../services/common/postData";
import { ExclamationCircleFilled } from "@ant-design/icons";
import { putData } from "../../../services/common/putData";
import moment from "moment";
const { confirm } = Modal;

interface IPersonInCalendar {
    id: string,
    text: string,
    value: string
}


const DoctorCalendar = () => {
    const { user }: any = useContext(AuthContext);

    const [events, setEvents] = useState([])
    const [loadingEvents, setLoadingEvents] = useState(false);

    const [specialists, setSpecialists]: any = useState([])
    const [loadingSpecialists, setLoadingSpecialists] = useState(false);
    const [selectedSpecialist, setSelectedSpecialist] = useState('')



    const [patients, setPatients]: any = useState([])
    const [loadingPatients, setLoadingPatients] = useState(false);
    
    const getEvents = async () => {
        setLoadingEvents(true)
        const specialistId = selectedSpecialist === "" ? specialists[0].id : selectedSpecialist  
        const request = await getData('api/dates/byEspecialist/' + specialistId)
        let datesToCalendar = []
        if (request.status) {
            console.log('request', request)
            datesToCalendar = request.data.map((date: any) => {
                try {
                    return {
                        event_id: date._id,
                        title: date.title || "Cita agendada",
                        start: new Date(new Date(date.start)),
                        end: new Date(new Date(date.end)),
                        idPatient: date.idpatient
                    }
                } catch (error) {
                    return {
                        event_id: date._id,
                        title: date.title || "Cita agendada",
                        start: new Date(),
                        end: new Date(),
                        idPatient: date.idpatient
                    }
                }
            })
            setEvents(datesToCalendar);
            setLoadingEvents(false);
        }

        
    }


    const getSpecialists = async () => {
        setLoadingSpecialists(true)
        const request = await getData('api/users/specialists')
        if (request.status) {
            const cleanData = request.data.map((specialist: any) => {
                return {
                    id: specialist._id,
                    text: specialist.firstname + " " + specialist.lastname,
                    value: specialist._id
                }
            })
            setSpecialists(cleanData);
            setSelectedSpecialist(cleanData[0].id);
            setLoadingSpecialists(false);
        }
    }


    const getPatients = async () => {
        setLoadingPatients(true);
        const request = await getData('api/users/patients')
        if (request.status) {
            const patientsToCalendar = request.data.map((patient: any) => {
                return {
                    id: patient._id,
                    text: patient.firstname + " " + patient.lastname,
                    value: patient._id
                }
            })
            setPatients(patientsToCalendar)
            setLoadingPatients(false)
        }
    }


    useEffect(() => {
        getSpecialists()
        getPatients()
    }, [])

    useEffect(() => {
        getEvents()
    }, [selectedSpecialist])




    const handleConfirm = async (
        event: ProcessedEvent,
        action: EventActions
    ): Promise<ProcessedEvent> => {
        return new Promise(async (res, rej) => {
            if (action === "edit") {
                /** PUT event to remote DB */
                const check = moment(event.start).isBefore(moment())
                if (check) {
                    alert("No puedes agendar una cita en el pasado!")
                    rej("No puedes agendar una cita en el pasado!");
                } else {
                    let fullEvent = {
                        ...event,
                        idpatient: event.idPatient,
                        idespecialist: user._id
                    }
                    const request = await putData('api/dates/' + event.event_id, fullEvent)
                    if (request.status) {
                        message.success("Cita actualizada exitosamente!")
                        res({
                            ...event,
                            event_id: event.event_id || Math.random()
                        });
                    }
                }
            } else if (action === "create") {
                /**POST event to remote DB */
                const check = moment(event.start).isBefore(moment())
                if (check) {
                    alert("No puedes agendar una cita en el pasado!")
                    rej("No puedes agendar una cita en el pasado!");
                } else {
                    let fullEvent = {
                        ...event,
                        event_id: event.event_id || Math.random(),
                        idpatient: event.idPatient,
                        idespecialist: user._id
                    }
                    const request = await postData('api/dates', fullEvent);
                    console.log('r', request);
                    if (request.status) {
                        message.success("Cita agendada exitosamente!")
                        res({
                            ...event,
                            event_id: event.event_id || Math.random()
                        });
                    }
                }
            }
        });
    };


    const handleEventDrop = async (droppedOn: Date, updatedEvent: ProcessedEvent, originalEvent: ProcessedEvent): Promise<ProcessedEvent> => {
        return new Promise(async (res, rej) => {
            console.log('dropped on', droppedOn)
            console.log('ue', updatedEvent)
            const check = moment(updatedEvent.start).isBefore(moment())
            console.log('check', check)
            if (check) {
                alert("No puedes agendar una cita en el pasado!")
                rej("No puedes agendar una cita en el pasado!");
            } else {
                let fullEvent = {
                    ...updatedEvent,
                    idpatient: updatedEvent.idPatient,
                    idespecialist: user._id
                }
                const request = await putData('api/dates/' + originalEvent.event_id, fullEvent)
                if (request.status) {
                    message.success("Cita actualizada exitosamente!")
                    res({
                        ...updatedEvent,
                        event_id: updatedEvent.event_id || Math.random()
                    });
                }
            }
        })
    }


    const handleDelete = async (deletedId: string): Promise<string> => {
        // Simulate http request: return the deleted id
        return new Promise((res, rej) => {
            const event:any = events.filter((ev:any) => ev.event_id === deletedId)
            if(event.length > 0){
                const check = moment(event[0].start).isBefore(moment())
                if (check) {
                    alert("No puedes eliminar una cita pasada!")
                    rej("No puedes eliminar una cita pasada!");
                }
            }
            setTimeout(() => {
                res(deletedId);
            }, 3000);
        });
    };


    const handleChangeSpecialist = (event: SelectChangeEvent) => {
        setSelectedSpecialist(event.target.value as string);
    };

    return (
        <div>
            {
                loadingEvents || loadingSpecialists ?
                    <Spin />
                    :
                    <div>
                        <Box sx={{ minWidth: 120 }}>
                            <FormControl fullWidth>
                                <InputLabel id="demo-simple-select-label">Especialista</InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={selectedSpecialist}
                                    label="Especialista"
                                    onChange={handleChangeSpecialist}
                                >
                                    {specialists.map((pt: any) =>
                                        <MenuItem value={pt.id}>{pt.text}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Box>
                        <Scheduler
                            view="week"
                            events={events}
                            onConfirm={handleConfirm}
                            onEventDrop={handleEventDrop}
                            onDelete={handleDelete}
                            fields={
                                [
                                    {
                                        name: "idPatient",
                                        type: "select",
                                        // Should provide options with type:"select"
                                        options: patients,
                                        // default: (patients && patients.length > 0) && patients[0].id,
                                        config: { label: "Paciente", required: true, errMsg: "Por favor seleccione un paciente" }
                                    }
                                ]
                            }
                        />

                    </div>
            }
        </div>
    )
}

export default DoctorCalendar;