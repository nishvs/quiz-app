export class ApiResponse {
    private response:{data:any,processed:boolean}
    constructor(data:any = [],processed:boolean){
        this.response = { data, processed }
    }
    public getResponseData = () => {
        return this.response;
    }
}