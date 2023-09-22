import { Payment } from './payment.js'

import { generateRandomString } from '../util.js'

export type enum Status = {PAID = 1, OPEN = 2, DRAFT = 3, VOID = 4}

export type ItemID = string
export type InvoiceID = string

class Items {
    itemID: string
    price: string
    quantity: number
    description: string
    createdAt: Date
    UpdatedAt: Date | null

    constructor (itemId: string, invoiceID: InvoiceID quantity: number, description: string) {
        this.itemID = itemId
        this.invoiceID = invoiceID
        this.price = price
        this.quantity = quantity
        this.description = description
        this.createdAt = new Date()
        this.UpdatedAt = null
    }

    public get serialize() {
        return {
            itemID: this.itemID,
            invoiceID: this.invoiceID,
            price: this.price,
            quantity: this.quantity,
            description: this.description,
            createdAt: this.createdAt.getTime(),
            UpdatedAt: this.UpdatedAt ? this.UpdatedAt.getTime() : null
        }
    }
}

class Invoice {
    invoiceID: InvoiceID
    totalSum: number
    description: string
    hosted_invoice_url: string; // hosted url for invoice
    items: Items[] // line items in invoice
    payments: Payment[]
    createdAt: Date
    clearedAt: Date | null
    amount_paid: number
    amount_due: number
    status: Status

    constructor(totalSum: number, description: string, items: Items[], hosted_invoice_url: string, payments: Payment[] = []) {
        this.invoiceID = generateRandomString(15)
        this.totalSum = totalSum
        this.description = description
        this.hosted_invoice_url
        this.items = items
        this.payments = payments
        this.createdAt = new Date()
        this.clearedAt = null
        this.amount_due = totalSum;
        this.amount_paid = 0;
        this.status = Status.OPEN
    }

    public get serialize() {
        return {
            invoiceID: this.invoiceID,
            totalSum: this.totalSum,
            description: this.description,
            hosted_invoice_url: this.hosted_invoice_url,
            items: this.items.map((item)=>{return item.serialize()}),
            payments: this.payments.map((payment)=>{return payment.serialize()}),
            createdAt: this.createdAt.getTime(),
            clearedAt: this.clearedAt ? this.clearedAt.getTime() : null,
            amount_due: this.amount_due,
            amount_paid: this.amount_paid,
            status: this.status
        }
    }
}

export { Items, Invoice }
