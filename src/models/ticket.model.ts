export interface Ticket {
  id: number;
  code: string;
  concertId: number;
  concertCode: string;
  band: string;
  customerName: string;
  customerEmail: string;
  unitPrice: number;
  purchaseDate: string;
}

export interface PurchaseResponse {
  message: string;
  concertId: number;
  concertCode: string;
  band: string;
  purchasedCount: number;
  totalPaid: number;
  tickets: Ticket[];
}
