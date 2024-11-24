import cyberEvent from "../constants/CyberEvent";
import { cyberGame } from "../CyberGame";

/**
 * Global Chat namespace
 */
export namespace chatController {

    // private property
    let url: string = null;
    let connected: boolean = false;
    let connecting: boolean = false;
    let socket: WebSocket = null;
    let messageArr = [];

    export enum Command {
        UpdateProfile = "_UPDATE_PROFILE_",
        GetLogChat = "_GET_LOG_CHAT_",
        Login = "_LOGIN_",
        LoginSuccess = "LOGIN_SUCCESS",
        UpdateProfileSuccess = "UPDATE_PROFILE_SUCCESS"
    }

    export function messages() {
        return messageArr;
    }

    export function send(msg: string): void {
        if (connected) {
            socket.send(JSON.stringify({
                content: msg
            }));
        }
    }

    export function disconnect(): void {
        if (socket && socket.readyState === WebSocket.OPEN)
            socket.close();
    }

    export function setUrl(value: string): void {
        url = value;
    }

    export function connect() {
        if (!url || connecting || connected)
            return;
        connecting = true;
        socket = new WebSocket(url + cyberGame.player.playerId);
        socket.onopen = () => {
            connected = true;
            connecting = false;
            login();
            console.log("connected to chat server");
        }
        socket.onmessage = (event: any) => {
            try {
                var data = JSON.parse(event.data);
                if (data.content) {
                    if (data.content == Command.LoginSuccess)
                        onLogin();
                    else if (data.content == Command.UpdateProfileSuccess)
                        onUpdatedProfile();
                    else {
                        cc.game.emit(cyberEvent.ON_LOBBY_PUBLIC_MSG, data);
                        messageArr.push(data);
                        if (messages.length > 50)
                            messageArr.shift();
                    }
                }
            } catch (error) {
                console.log(error);
            }
        }
        socket.onclose = () => {
            connected = false;
            connecting = false;
        }
    }

    function login(): void {
        socket.send(JSON.stringify({
            content: Command.Login,
            token: cyberGame.player.signature
        }));
    }

    function onLogin(): void {
        socket.send(JSON.stringify({
            content: Command.UpdateProfile,
            avatar: FBInstant.player.getPhoto(),
            name: FBInstant.player.getName()
        }));
    }

    function onUpdatedProfile(): void {
        if (messageArr.length == 0) {
            socket.send(JSON.stringify({
                content: Command.GetLogChat
            }));
        }
    }

}
