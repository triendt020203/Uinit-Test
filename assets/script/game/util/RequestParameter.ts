export default class RequestParameter {

    readonly cmd: string;
    readonly params: SFS2X.SFSObject;

    constructor(cmd: string, params?: SFS2X.SFSObject) {
        this.cmd = cmd;
        this.params = params;
    }
}