import { PacketHandler } from "../../handlers/PacketHandler";

export abstract class PacketRouter {
    protected handlers: Map<number, PacketHandler> = new Map<number, PacketHandler>();

    public constructor() {
        this.registerHandlers();
    }

    public getHandler(opcode: number): PacketHandler | undefined {
        return this.handlers.get(opcode);
    }

    protected abstract registerHandlers(): void;
}
