import React, { useReducer } from "react";
import { NEW_CALL_ACTIONS } from "./newCallActions";
import { callInitialState, callReducer } from "./newCallReducer";

export const NewCallContext = React.createContext({
    humanClient: null,
    screenClient: null,
    localAudioTrack: null,
    localVideoTrack: null,
    localScreenTrack: null,
    joinSuccess: false,  
    joinHuman: (humanClient:any, localAudioTrack:any, localVideoTrack:any) => {},
    leaveHuman: () => {},
    joinScreen: (screenClient:any, localScreenTrack: any) => {},
    leaveScreen: () => {},
    openDrawer: false,
    hideDrawer: () => {},
    showDrawer: () => {}
});



export const NewCallProvider = ({ children }: any): any => {
    const [state, dispatch] = useReducer(callReducer, callInitialState);
    const value: any = {
        joinSuccess: state.joinSuccess,
        humanClient: state.humanClient,
        screenClient: state.screenClient,
        localAudioTrack: state.localAudioTrack,
        localVideoTrack: state.localVideoTrack,
        localScreenTrack: state.localScreenTrack,
        openDrawer: state.openDrawer,

        joinHuman: (humanClient:any, localAudioTrack:any, localVideoTrack:any) => {
            dispatch({ type: NEW_CALL_ACTIONS.JOIN_HUMAN , payload: { humanClient, localAudioTrack, localVideoTrack  } });
        },

        leaveHuman: () => {
            dispatch({ type: NEW_CALL_ACTIONS.LEAVE_HUMAN });
        },

        joinScreen: (screenClient:any, localScreenTrack:any) => {
            dispatch({ type: NEW_CALL_ACTIONS.JOIN_SCREEN , payload: { screenClient, localScreenTrack  } });
        },

        leaveScreen: () => {
            dispatch({ type: NEW_CALL_ACTIONS.LEAVE_SCREEN });
        },

        hideDrawer: () => {
            dispatch({ type: NEW_CALL_ACTIONS.HIDE_DRAWER  })
        },

        showDrawer: () => {
            dispatch({ type: NEW_CALL_ACTIONS.SHOW_DRAWER })
        }
    };

    return <NewCallContext.Provider value={value}>{children}</NewCallContext.Provider>;
};
