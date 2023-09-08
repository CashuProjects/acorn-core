import {PaymentId} from './payment.js'

import { generateRandomString } from '../util.js'

type enum Status = {PAID = 1, OPEN = 2, DRAFT = 3, VOID = 4}

type ItemID = string
type InvoiceID = string

class Items {
    itemID: string
    price: string
    quantity: number
    description: string
    createdAt: Date
    UpdatedAt: Date | null

    constructor (price: number, quantity: number, description: string) {
        this.itemID = generateRandomString(10)
        this.price = price
        this.quantity = quantity
        this.description = description
        this.createdAt = new Date()
        this.UpdatedAt = null
    }

    serialize() {
        return {
            itemID: this.itemID,
            price: this.price,
            quantity: this.quantity,
            description: this.description,
            createdAt: this.createdAt,
            UpdatedAt: this.UpdatedAt
        }
    }
}

class Invoice {
    invoiceID: InvoiceID
    totalSum: number
    description: string
    hosted_invoice_url: string; // hosted url for invoice
    items: Items[] // line items in invoice
    paymentId: PaymentId
    createdAt: Date
    clearedAt: Date | null
    amount_paid: number
    amount_due: number
    status: Status

    constructor(totalSum: number, description: string, items: Items[], hosted_invoice_url: string, paymentID: PaymentID) {
        this.invoiceID = generateRandomString(15)
        this.totalSum = totalSum
        this.description = description
        this.hosted_invoice_url
        this.items = items
        this.paymentID = paymentID
        this.createdAt = new Date()
        this.clearedAt = null
        this.amount_due = totalSum;
        this.amount_paid = 0;
        this.status = Status.OPEN
    }

    serialize() {
        return {
            invoiceID: this.invoiceID,
            totalSum: this.totalSum,
            description: this.description,
            hosted_invoice_url: this.hosted_invoice_url,
            items: this.items.map((item)=>{return item.serialize()}),
            paymentID: this.paymentID,
            createdAt: this.createdAt,
            clearedAt: this.clearedAt,
            amount_due: this.amount_due,
            amount_paid: this.amount_paid,
            status: this.status
        }
    }
}

export { ItemID, Invoice }
