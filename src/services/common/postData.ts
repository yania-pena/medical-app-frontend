export function postData(endPoint:string, data:any){
    let headers = localStorage.getItem("token") !== undefined ?
    {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem("token")
    }
    :
    {
        'Content-Type': 'application/json'
    }
    const options:any = {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
    }
   
    const request = fetch(`${process.env.REACT_APP_API_URL}/${endPoint}`, options)
    const json = request.then(response => response.json())
    return json;
}

export function postFormData(endPoint:string, data:any){
    let headers: HeadersInit = localStorage.getItem("token") !== undefined ?
    {
        'Authorization': 'Bearer ' + localStorage.getItem("token")
    }
    :
    {}
    const options = {
        method: 'POST',
        headers,
        body: data
    }
    
    const request = fetch(`https://pet-rescue-api.onrender.com/${endPoint}`, options)
    const json = request.then(response => response.json())
    return json;
}


export function postImageData(endPoint:string, data:any){
    const options = {
        method: 'POST',
        body: data
    }
    
    const request = fetch(`https://shape-gen-api.onrender.com/${endPoint}`, options)
    const json = request.then(response => response.json())
    return json;
}


export function transformShape(endPoint:string, data:any){
    let headers = {
        'Content-Type': 'application/json'
    }
    const options:any = {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
    }
   
    const request = fetch(`https://shape-gen-api.onrender.com/${endPoint}`, options)
    const json = request.then(response => response.json())
    return json;
}