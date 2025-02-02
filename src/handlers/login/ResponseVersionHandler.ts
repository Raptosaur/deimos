import { PacketReader } from "../../crypto/protocol/PacketReader";
import { LoginSession } from "../../network/sessions/LoginSession";
import { RequestLoginPacket } from "../../packets/RequestLoginPacket";
import { ResponseVersionHelper } from "../helpers/ResponseVersionHelper";
import { LoginPacketHandler } from "../LoginPacketHandler";

export class ResponseVersionHandler implements LoginPacketHandler {
    public handle(session: LoginSession, packet: PacketReader): void {
        ResponseVersionHelper.handle(session, packet);

        session.send(RequestLoginPacket.login());
    }
}
