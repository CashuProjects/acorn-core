import {
    getDecodedToken,
    Token,
    Proof
} from '@cashu/cashu-ts'

import {CustomerModel, PaymentModel, ItemsModel, InvoiceModel} from './models/model.js'
import {Customer, CustomerID} from './models/customer.js'
import {Payment, PaymentId} from './models/payment.js'
import {Item, ItemID, Invoice, InvoiceID, Status} from './models/invoice.js'
import {Wallet} from './wallet.js'
import {cleanToken} from './util.js'


class PaymentProcessor {
    constructor(wallet: Wallet) {
        this._wallet = wallet
    }

    async getCustomer(customerId: CustomerID) {
        return (await CustomerModel.get({customerID: customerId}, []))[0]
    }

    async getInvoice(invoiceId: InvoiceID) {
        return (await InvoiceModel.get({invoiceID: invoiceId}, []))[0]
    }

    async getPayment(paymentId: PaymentId) {
        return (await PaymentModel.get({paymentID: PaymentId}, [])[0])
    }

    async createReceipt(invoice: Invoice) {

    }

    async addCustomer(customer: Customer) {
        await CustomerModel.insert(customer.serialize())
    }
    
    async addPayment(payment: Payment) {
        await PaymentModel.insert(payment.serialize())
    }
    
    async addInvoice(invoice: Invoice) {
        await InvoiceModel.insert(invoice.serialize())
    }

    async receivePayment(tokenStr: string, paymentId: PaymentID) {
        payment = await this.getPayment(paymentId)
        if (payment.confirmed) {
            throw new Error(`payment: ${paymentId} has already been confirmed`)
        }

        // Process tokens
        const {
            token,
            tokensWithErrors,
            tokenFromUnsupportedMint,
            totalSum
        } = await this._wallet.addfunds(tokenStr)

        if (totalSum != payment.amount) payment.amount = totalSum

        payment.confirmed = true
        payment.paidAt = Date.now()

        await PaymentModel.update({payment.amount, payment.confirmed, payment.paidAt}, {paymentID: PaymentId})

        invoice = await this.getInvoice(payment.invoiceID)

        invoice.amount_paid += totalSum
        invoice.amount_due = (totalSum <= invoice.amount_due) ? invoice.amount_due - totalSum : 0

        if (invoice.amount_due == 0) {
            invoice.clearedAt = Date.now()
            invoice.payments.push()
            invoice.status = Status.PAID
        }

        await InvoiceModel.update(
            {invoice.amount_paid, invoice.amount_due, invoice.clearedAt, invoice.status},
            {invoiceID: payment.invoiceID}
            )
    
        return {payment, invoice, tokensWithErrors, tokenFromUnsupportedMint}
    }

    async cancelInvoice(invoiceId: InvoiceID , lnInvoice?: string): Token {
        invoice = await this.getInvoice(invoiceId)

        payments = PaymentModel.get({invoiceID: invoiceId}, [])

        tokenEntries = []
        totalSum = 0
        proofAmount = invoice.amount_paid
        getProof = true
        iterator = 0
        while (getProof && (iterator < this._wallet._mints.length)) {
            response = await this._wallet.getProofs(proofAmount, this.wallet._mints[iterator])
            if (totalSum == invoice.amount_paid) {
                getProof = false
            }
            else
            {
                proofAmount = Math.abs(proofAmount - response.totalSum)
            }

            tokenEntries.push({proofs: response.proofs, mint: this._wallet._mints[iterator]})
        }

        /*
        for (payment of payments) {
            PaymentModel.update({}, {paymentID: payment.paymentId}) 
        }*/

        // Todo: Payout to LnInvoice

        await InvoiceModel.update({status: Status.VOID, amount_due: 0, amount_paid: 0}, {invoiceID: invoice.invoiceID})

        // Delete proofs from DB
        tokenEntries.map((entry)=>{ await this._wallet.deleteProofs(entry.proofs)})
        return {token: {token: tokenEntries}}
    }

    async refundPayment(paymentId: PaymentId, mint: string) {
        payment = await this.getPayment(paymentId)
        invoice = await this.getInvoice(payment.invoiceID)

        if (!payment.confirmed) {
            throw new Error(`payment ${payment.id} has not been confirmed`)
        }

        tokenEntries = []
        proofAmount = invoice.amount_paid
        totalSum = 0
        getProof = true
        iterator = 0
        while (getProof && (iterator < this._wallet._mints.length)) {
            response = this._wallet.getProofs(proofAmount, this.wallet._mints[iterator])
            totalSum += response.totalSum

            if (totalSum == invoice.amount_paid) {
                getProof = false
            }
            else
            {
                proofAmount = Math.abs(proofAmount - response.totalSum)
            }

            tokenEntries.push({proofs: response.proofs, mint: this._wallet._mints[iterator]})
        }

        // Todo: Payout to LnInvoice

        await InvoiceModel.update(
            {
                amount_due: invoice.amount_due+payment.amount,
                amount_paid: invoice.amount_paid-payment.amount
            },
            { invoiceID: invoice.invoiceID }
            )

        // Delete proofs from DB
        tokenEntries.map((entry)=>{this._wallet.deleteProofs(entry.proofs)})
        return {token: {token: tokenEntries}}
    }
}

export { PaymentProcessor }