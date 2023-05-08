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


const PatientCalendar = () => {
    const { user }: any = useContext(AuthContext);

    const [loadingPatients, setLoadingPatients] = useState(false);
    const [patients, setPatients] = useState([]);
    const getPatients = async () => {
        setLoadingPatients(true);
        const request = await getData('api/users/patients')
        if (request.status) {
            const cleanData = request.data.map((patient: any) => {
                return {
                    id: patient._id,
                    text: patient.firstname + " " + patient.lastname,
                    value: patient._id
                }
            })
            setPatients(cleanData);
            setLoadingPatients(false)
        }
    }

    const [loadingSpecialists, setLoadingSpecialists] = useState(false);
    const [specialists, setSpecialists]: any = useState([])
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
            console.log('cleanData', cleanData)
            setSpecialists(cleanData);
            setSelectedSpecialist(cleanData[0].id);
            setLoadingSpecialists(false);
            
        }
    }

    const [events, setEvents] = useState([])
    const [loadingEvents, setLoadingEvents] = useState(false)
    const getEvents = async () => {
        setLoadingEvents(true)
        let ss = selectedSpecialist
        if (ss === "") {
            ss = specialists[0].id
        }
        const request = await getData('api/dates/byEspecialist/' + ss)
        if (request.status) {
            const cleanData = request.data.map((date: any) => {
                return {
                    event_id: date._id,
                    title: date.title || "Cita agendada",
                    start: new Date(new Date(date.start)),
                    end: new Date(new Date(date.end)),
                }
            })
            setEvents(cleanData);
            setLoadingEvents(false);
            /**Simulate fetchin remote data */
            return new Promise((res) => {
                setTimeout(() => {
                    res(cleanData);
                }, 3000);
            });
        }
    }


    useEffect(() => {
        if (user.isDoctor) {
            getPatients()
        }
        getSpecialists();
    }, [])


    const [selectedSpecialist, setSelectedSpecialist] = useState('')
    const handleChange = (event: SelectChangeEvent) => {
        setSelectedSpecialist(event.target.value as string);
    };
    useEffect(() => {
        getEvents()
    }, [selectedSpecialist])



    const handleConfirm = async (
        event: ProcessedEvent,
        action: EventActions
    ): Promise<ProcessedEvent> => {
        console.log("handleConfirm =", action, event.title);

        /**
         * Make sure to return 4 mandatory fields:
         * event_id: string|number
         * title: string
         * start: Date|string
         * end: Date|string
         * ....extra other fields depend on your custom fields/editor properties
         */
        // Simulate http request: return added/edited event


        if (action === "create") {
            console.log('is creating...')

            let fullEvent = {
                ...event,
                event_id: event.event_id || Math.random(),
                idpatient: user._id,
                idespecialist: selectedSpecialist
            }
            const request = await postData('api/dates', fullEvent);
            console.log('r', request);
            if(request.status){
                message.success("Cita agendada exitosamente!")
            }
        } else {
            console.log('is not creating....')
        }


        return new Promise((res, rej) => {
            if (action === "edit") {
                /** PUT event to remote DB */
            } else if (action === "create") {
                /**POST event to remote DB */

            }

            const isFail = Math.random() > 0.6;
            // Make it slow just for testing
            setTimeout(() => {
                if (isFail) {
                    rej("Ops... Faild");
                } else {
                    res({
                        ...event,
                        event_id: event.event_id || Math.random()
                    });
                }
            }, 3000);
        });
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
                (loadingSpecialists || loadingPatients || loadingEvents) ? <Spin /> : (

                    <Scheduler
                        view="week"
                        events={events}
                        onConfirm={handleConfirm}
                    />
                )
            }
        </div>
    )
}

export default PatientCalendar; 