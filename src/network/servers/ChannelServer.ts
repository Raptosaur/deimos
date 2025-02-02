import chalk from "chalk";
import { Socket } from "net";
import { Packet } from "../../crypto/protocol/Packet";
import { Database } from "../../database/Database";
import { FieldFactory } from "../../server/fields/FIeldFactory";
import { World } from "../../server/World";
import { Logger } from "../../tools/Logger";
import { ChannelPacketRouter } from "../routers/ChannelPacketRouter";
import { ChannelSession } from "../sessions/ChannelSession";
import { Server } from "./Server";

export class ChannelServer extends Server {
    public id: number;
    public world: string;
    public fieldFactory: FieldFactory = new FieldFactory();

    public constructor(world: string, id: number, host: string, port: number) {
        super(host, port, new ChannelPacketRouter());
        this.id = id;
        this.world = world;
        super.start();
    }

    protected onConnection(socket: Socket): void {
        const session = new ChannelSession(this, this.sessionCounter++, this.packetRouter, socket);

        Logger.log(`${this.world} Channel ${this.id}: Session ${session.id} @ ${session.socket.remoteAddress} opened`);

        this.setupSocketEvents(session);
    }

    private setupSocketEvents(session: ChannelSession): void {
        session.socket.setNoDelay(true);
        session.socket.on("data", data => this.onData(session, data));
        session.socket.on("close", hadError => this.onClose(session, hadError));
        session.socket.on("error", error => this.onError(session, error));
    }

    public broadcast(packet: Packet): void {
        World.getInstance()
            .getPlayers()
            .filter(player => {
                if (!player.session) {
                    return false;
                }
                if (player.session.channel.id !== this.id) {
                    return false;
                }
                return true;
            })
            .forEach(player => {
                player.session?.send(packet);
            });
    }

    protected onData(session: ChannelSession, data: Buffer): void {
        session.onData(data);
    }

    protected onClose(session: ChannelSession, hadError: boolean): void {
        if (session.field) {
            Database.getCharacters().save(session.player);
            session.field.removePlayer(session);
            Logger.log(`${session.player.name} saved successfully.`, chalk.yellow);
        }
        Logger.log(`${this.world} Channel ${this.id}: Session ${session.id} @ ${session.socket.remoteAddress} closed`);
    }

    protected onError(session: ChannelSession, error: Error): void {
        Logger.error(error.message);
    }

    protected onStart(): void {
        Logger.log(`${this.world} Channel ${this.id} at ${this.host}:${this.port} is online`, chalk.green);
    }

    protected onShutdown(): void {
        Logger.log(`${this.world} Channel ${this.id} at ${this.host}:${this.port} shutdown`);
    }
}
