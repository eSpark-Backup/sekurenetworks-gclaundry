export interface IEnviromentalMessage {
    id: string;
    quote: string;
    isActive: boolean;
    kioskId?: string;
    relationId?: string;
    kiosks?: [
        {
            kioskId: string;
            kioskName: string;
        }
    ]
}
