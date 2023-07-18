import { Scheduler } from "@aldabil/react-scheduler";
import {
    EventActions,
    ProcessedEvent,
    ViewEvent
} from "@aldabil/react-scheduler/types";
import { useContext, useEffect, useState } from "react";
import { getData } from "../../../services/common/getData";
import { AuthContext } from "../../../context/AuthContext";
import { Spin, message } from "antd";

import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import { postData } from "../../../services/common/postData";
import { putData } from "../../../services/common/putData";
import moment from "moment";


const PatientCalendar = () => {
    const { user }: any = useContext(AuthContext);

    const [events, setEvents] = useState([])
    const [loadingEvents, setLoadingEvents] = useState(false)

    const [loadingSpecialists, setLoadingSpecialists] = useState(false);
    const [specialists, setSpecialists]: any = useState([])

    const [selectedSpecialist, setSelectedSpecialist] = useState('')


    const disabledToUser = (userId: any, date: any) => {
        let validate = userId !== date.idpatient
        return validate;
    }

    const getEvents = async () => {
        setLoadingEvents(true)
        const specialistId = selectedSpecialist === "" ? specialists[0].id : selectedSpecialist
        const request = await getData('api/dates/byEspecialist/' + specialistId)
        let specialistEvents = []
        if (request.status) {
            specialistEvents = request.data.map((date: any) => {
                return {
                    event_id: date._id,
                    title: date.title || "Cita agendada",
                    start: new Date(new Date(date.start)),
                    end: new Date(new Date(date.end)),
                    disabled: disabledToUser(user._id, date),
                    idPatient: date.idpatient
                }
            })
        }

        const requestPatientEvents = await getData('api/dates/byPatient/' + user._id)
        if (requestPatientEvents.status) {
            const patientEvents = requestPatientEvents.data.map((date: any) => {
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
            const mergedEvents = specialistEvents.concat(patientEvents)
            setEvents(mergedEvents);
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


    useEffect(() => {
        getSpecialists();
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

                const check = moment(event.start).isBefore(moment())
                if (check) {
                    alert("No puedes agendar una cita en el pasado!")
                    rej("No puedes agendar una cita en el pasado!");
                } else {
                    let fullEvent = {
                        ...event,
                        idpatient: user._id,
                        idespecialist: event.idSpecialist
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
                const check = moment(event.start).isBefore(moment())
                if (check) {
                    alert("No puedes agendar una cita en el pasado!")
                    rej("No puedes agendar una cita en el pasado!");
                } else {
                    let fullEvent = {
                        ...event,
                        event_id: event.event_id || Math.random(),
                        idpatient: user._id,
                        idespecialist: event.idSpecialist
                    }
                    const request = await postData('api/dates', fullEvent);
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
            let fullEvent = {
                ...updatedEvent,
                idpatient: user._id,
                idespecialist: updatedEvent.idSpecialist
            }
            const request = await putData('api/dates/' + originalEvent.event_id, fullEvent)
            if (request.status) {
                message.success("Cita actualizada exitosamente!")
                res({
                    ...updatedEvent,
                    event_id: updatedEvent.event_id || Math.random()
                });
            }
        })
    }

    const handleChange = (event: SelectChangeEvent) => {
        setSelectedSpecialist(event.target.value as string);
    };

    return (
        <div>
            <Box sx={{ minWidth: 120 }}>
                <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">Especialista</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={selectedSpecialist}
                        label="Especialista"
                        onChange={handleChange}
                    >
                        {specialists.map((sp: any) =>
                            <MenuItem value={sp.id}>{sp.text}</MenuItem>)}
                    </Select>
                </FormControl>
            </Box>
            {
                (loadingSpecialists || loadingEvents) ? <Spin /> : (
                    <Scheduler
                        view="week"
                        events={events}
                        onConfirm={handleConfirm}
                        onEventDrop={handleEventDrop}
                        fields={
                            [
                                {
                                    name: "idSpecialist",
                                    type: "select",
                                    // Should provide options with type:"select"
                                    options: specialists,
                                    config: { label: "Especialista", required: true, errMsg: "Por favor seleccione un especialista" }
                                }
                            ]
                        }
                    />
                )
            }
        </div>
    )
}

export default PatientCalendar; 