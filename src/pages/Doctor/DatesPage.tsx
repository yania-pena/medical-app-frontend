import { Scheduler } from "@aldabil/react-scheduler";
import {
    EventActions,
    ProcessedEvent,
    ViewEvent
} from "@aldabil/react-scheduler/types";
import { postData } from "../../services/common/postData";
import { Card, Spin } from "antd";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { getData } from "../../services/common/getData";
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import PatientCalendar from "../../components/Calendar/Patient";

export const EVENTS: ProcessedEvent[] = [
    {
        event_id: 1,
        title: "Event 1",
        start: new Date(new Date(new Date().setHours(9)).setMinutes(0)),
        end: new Date(new Date(new Date().setHours(10)).setMinutes(0)),
        disabled: true,
        admin_id: [1, 2, 3, 4]
    },
    {
        event_id: 2,
        title: "Event 2",
        start: new Date(new Date(new Date().setHours(10)).setMinutes(0)),
        end: new Date(new Date(new Date().setHours(12)).setMinutes(0)),
        admin_id: 2,
        color: "#50b500"
    },
    {
        event_id: 3,
        title: "Event 3",
        start: new Date(new Date(new Date().setHours(11)).setMinutes(0)),
        end: new Date(new Date(new Date().setHours(12)).setMinutes(0)),
        admin_id: 1,
        editable: false,
        deletable: false
    },
    {
        event_id: 4,
        title: "Event 4",
        start: new Date(
            new Date(new Date(new Date().setHours(9)).setMinutes(30)).setDate(
                new Date().getDate() - 2
            )
        ),
        end: new Date(
            new Date(new Date(new Date().setHours(11)).setMinutes(0)).setDate(
                new Date().getDate() - 2
            )
        ),
        admin_id: 2,
        color: "#900000"
    },
    {
        event_id: 5,
        title: "Event 5",
        start: new Date(
            new Date(new Date(new Date().setHours(10)).setMinutes(30)).setDate(
                new Date().getDate() - 2
            )
        ),
        end: new Date(
            new Date(new Date(new Date().setHours(14)).setMinutes(0)).setDate(
                new Date().getDate() - 2
            )
        ),
        admin_id: 2,
        editable: true
    },
    {
        event_id: 6,
        title: "Event 6",
        start: new Date(
            new Date(new Date(new Date().setHours(10)).setMinutes(30)).setDate(
                new Date().getDate() - 4
            )
        ),
        end: new Date(new Date(new Date().setHours(14)).setMinutes(0)),
        admin_id: 2
    }
];



export default function DatesPage() {
    const { user }: any = useContext(AuthContext);

    const [loadingPatients, setLoadingPatients] = useState(false);
    const [loadingSpecialists, setLoadingSpecialists] = useState(false);
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
            setLoadingSpecialists(false);
        }
    }

    useEffect(() => {
        if (user.isDoctor) {
            getPatients()
        }
        getSpecialists();
    }, [])


    const fetchRemote = async (query: ViewEvent): Promise<ProcessedEvent[]> => {
        console.log({ query });
        console.log('specialists', specialists);
        if (specialists.length > 0) {
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
                /**Simulate fetchin remote data */
                return new Promise((res) => {
                    setTimeout(() => {
                        res(cleanData);
                    }, 3000);
                });
            }
        }


        /**Simulate fetchin remote data */
        return new Promise((res) => {
            setTimeout(() => {
                res(EVENTS);
            }, 3000);
        });


    };

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
                idpatient: user.isPatient ? user._id : event.idpatient
            }
            const request = await postData('api/dates', fullEvent);
            console.log('r', request);

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

    const handleDelete = async (deletedId: string): Promise<string> => {
        // Simulate http request: return the deleted id
        return new Promise((res, rej) => {
            setTimeout(() => {
                res(deletedId);
            }, 3000);
        });
    };

    const [selectedSpecialist, setSelectedSpecialist] = useState('')
    const handleChange = (event: SelectChangeEvent) => {
        setSelectedSpecialist(event.target.value as string);
    };
    return (
        <Card title="Citas">
            {user.isPatient && <PatientCalendar />}
            {!user.isPatient && (
                (loadingPatients || loadingSpecialists) ? <Spin /> :
                    (
                        <div>
                            <Box sx={{ minWidth: 120 }}>
                                <FormControl fullWidth>

                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        value={selectedSpecialist}
                                        label="Especialista"
                                        onChange={handleChange}
                                    >
                                        {specialists.map((sp: any) =>
                                            <MenuItem value={sp._id}>AAA</MenuItem>)}
                                    </Select>
                                </FormControl>

                            </Box>
                            <Scheduler
                                getRemoteEvents={fetchRemote}
                                onConfirm={handleConfirm}
                                onDelete={handleDelete}
                                fields={
                                    user.isDoctor ?
                                        [
                                            {
                                                name: "idpatient",
                                                type: "select",
                                                // Should provide options with type:"select"
                                                options: patients,
                                                config: { label: "Paciente", required: true, errMsg: "Por favor seleccione un paciente" }
                                            },
                                            {
                                                name: "idespecialist",
                                                type: "select",
                                                // Should provide options with type:"select"
                                                options: specialists,
                                                config: { label: "Especialista", required: true, errMsg: "Por favor seleccione un especialista" }
                                            }
                                        ]
                                        :
                                        [
                                            {
                                                name: "idespecialist",
                                                type: "select",
                                                // Should provide options with type:"select"
                                                options: specialists,
                                                config: { label: "Especialista", required: true, errMsg: "Por favor seleccione un especialista" }
                                            }
                                        ]
                                }
                            />
                        </div>)



            )}

        </Card >
    );
}
