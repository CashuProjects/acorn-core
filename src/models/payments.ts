import {CustomerID} from './customer.js'

import { generateRandomString } from '../util.js'

type PaymentID = string

class Payment {
    paymentID: PaymentId;
    customerID: CustomerID;
    invoiceID: InvoiceID;
    confirmed: boolean;
    amount: number;
    paidAt: Date | null

    constructor(customerID: CustomerID, amount: number, invoiceID: string | null) {
        this.paymentID = generateRandomString(10);
        this.customerID = customerID
        this.invoiceID = invoiceID
        this.confirmed = false
        this.amount = amount
        this.paidAt = null
    }

    public set confirm_payment(amount) {
        if (this.amount == amount) {
            this.confirmed = true
            this.paidAt = new Date()
        }
    }

    public get serialize() {
        return {
            paymentID: this.paymentID,
            customerID: this.customerID,
            invoiceID: this.invoiceID
            confirmed: this.confirmed,
            amount: this.amount,
            this.paidAt: this.paidAt ? this.paidAt.getTime() : null
        }
    }
}


export { Payment }