import {CustomerID} from './customer.js'

import { generateRandomString } from '../util.js'

type PaymentID = string

class Payment {
    paymentID: PaymentId;
    customerID: CustomerID;
    confirmed: boolean;
    amount: number;

    constructor(customerID: CustomerID, amount: number) {
        this.paymentID = generateRandomString(10);
        this.customerID = customerID
        this.confirmed = false
        this.amount = amount
    }

    serialize() {
        return {
            paymentID: this.paymentID,
            customerID: this.customerID,
            confirmed: this.confirmed,
            amount: this.amount
        }
    }
}


export { Payment }