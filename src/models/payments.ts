import {CustomerId} from './customer.js'

import { generateRandomString } from '../util.js'

type PaymentId = string

class Payment {
    PaymentId: PaymentId;
    customerId: CustomerId;
    confirmed: boolean;
    amount: number;

    constructor(customerId: CustomerId, amount: number) {
        this.PaymentId = generateRandomString(10);
        this.customerId = customerId
        this.confirmed = false
        this.amount = amount
    }

    serialize() {
        return {
            paymentId: this.paymentId,
            customerId: this.customerId,
            confirmed: this.confirmed,
            amount: this.amount
        }
    }
}


export { Payment }