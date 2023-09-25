import {CustomerID} from './customer.js'
import { generateRandomString } from '../util.js'
import {Invoice} from './invoice.js'
import {PaymentID, InvoiceID} from './types.js'

class Payment {
    paymentID: PaymentId;
    customerID: CustomerID;
    invoiceID: InvoiceID;
    confirmed: boolean;
    amount: number;
    paidAt: Date | null

    constructor(customerID: CustomerID, invoice: Invoice) {
        this.paymentID = generateRandomString(10);
        this.customerID = customerID
        this.invoiceID =  invoice.invoiceID
        this.confirmed = false
        this.amount = invoice.amount_due
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