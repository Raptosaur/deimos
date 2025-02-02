import { PacketWriter } from "../../crypto/protocol/PacketWriter";
import { Logger } from "../../tools/Logger";
import { GameOptions } from "./GameOptions";
import { QuickSlot } from "./QuickSlot";

export class Hotbar {
    public static readonly MAX_SLOTS = 25;

    public slots: QuickSlot[] = new Array<QuickSlot>(Hotbar.MAX_SLOTS);

    public constructor() {
        for (let i = 0; i < Hotbar.MAX_SLOTS; i++) {
            this.slots[i] = new QuickSlot();
        }
    }

    public moveQuickSlot(targetSlotIndex: number, quickSlot: QuickSlot): void {
        if (targetSlotIndex < 0 || targetSlotIndex >= Hotbar.MAX_SLOTS) {
            Logger.error(`Invalid target slot ${targetSlotIndex}.`);
            return;
        }

        const sourceSlotIndex = this.findQuickSlotIndex(quickSlot.skillId, quickSlot.itemUid);
        if (sourceSlotIndex !== -1) {
            // swapping with an existing slot on the hotbar
            const sourceQuickSlot = this.slots[targetSlotIndex];
            this.slots[sourceSlotIndex] = new QuickSlot(
                sourceQuickSlot.skillId,
                sourceQuickSlot.itemId,
                sourceQuickSlot.itemUid
            );
        }

        this.slots[targetSlotIndex] = quickSlot;
    }

    private findQuickSlotIndex(skillId: number, itemUid: BigInt = 0n): number {
        for (let i = 0; i < Hotbar.MAX_SLOTS; i++) {
            const currentSlot = this.slots[i];
            if (currentSlot.skillId === skillId && currentSlot.itemUid === itemUid) {
                return i;
            }
        }

        return -1;
    }

    public removeQuickSlot(skillId: number, itemUid: BigInt): boolean {
        const targetSlotIndex = this.findQuickSlotIndex(skillId, itemUid);
        if (targetSlotIndex < 0 || targetSlotIndex >= Hotbar.MAX_SLOTS) {
            Logger.error(`Failed to remove quick slot. TargetSlotIndex: ${targetSlotIndex}`);
            return false;
        }

        this.slots[targetSlotIndex] = new QuickSlot();
        return true;
    }

    public static write(packet: PacketWriter, options: GameOptions): void {
        packet.writeShort(options.activeHotbarId);
        packet.writeShort(options.hotbars.length);

        for (const hotbar of options.hotbars) {
            packet.writeInt(hotbar.slots.length);

            for (let slotIndex = 0; slotIndex < hotbar.slots.length; slotIndex++) {
                packet.writeInt(slotIndex);
                QuickSlot.write(packet, hotbar.slots[slotIndex]);
            }
        }
    }
}
