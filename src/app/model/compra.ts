import { Compradetalle } from "./compradetalle";

export interface Compra {
    usuarioId: number;
    detalles: Compradetalle[];
}
