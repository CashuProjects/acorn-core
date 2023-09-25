import nock from 'nock'

import {CustomerModel, PaymentModel, ItemsModel, InvoiceModel} from '../src/models/model.js'

import {TokenModel, ProofsModel} from '../src/models/model.js'
import { PaymentProcessor } from '../src/paymentprocessor.js'
import {wallet} from '../src/wallet.js'
import {InvoiceStatus} from '../src/models/types.js'
import (Customer) from '../src/models/customer.js'
import {Item, Invoice} from '../src/models/invoice.js'
import {Payment} from '../src/models/payments.ts'
import { generateRandomString } from '../src/util.js'

mintUrls = [
    'http://127.0.0.1:3338',
    'https://8333.space:3338'
]
wallet = new Wallet(mintUrls)
paymentProcessor = new PaymentProcessor(wallet)

items = [
    new Item(generateRandomString(10), 21000 /*sats*/, 1, 'bitcoiner_test'),
    new Item(generateRandomString(10), 4200 /*sats*/, 1, 'paywalled news')
]

tokens = [
    'cashuAeyJ0b2tlbiI6IFt7InByb29mcyI6IFt7ImlkIjogIjh3a3RYSXRvK3p1LyIsICJhbW91bnQiOiA4LCAic2VjcmV0IjogImJlZmUxYTJhMmI1ZTIyOWVlNjkzYzQyNWFiNjdjM2M4MTYyYTE0MzM1ZGJlZDk2ZWExNDljNzI1ZmVhMjUzNmQiLCAiQyI6ICIwMzVlYWE0YjIzNjQxMWI2NmVmMzNmYTU5Yzc4MjI2OTNjYzU4MjA5YzFhYWI0MmZhYjZmZTQwNWI4MjhjNmRhYzQifSwgeyJpZCI6ICI4d2t0WEl0byt6dS8iLCAiYW1vdW50IjogNTEyLCAic2VjcmV0IjogImM1OGE5ZjBmMzU2ZjhmNjQ4YmQxYmUxYzg0YzAxNWYxMDYxNTIxZmFkZGEzZDU1NGQxMGRmMjhlOWRmMDJjMDciLCAiQyI6ICIwMzZjYzBkMmNiMzk0OGM5OGFjMmFmNDIzMzNiZGU0OWFhYjY4YzY4OGNjYjk0MTU5YWUxNWY2YzU0ZmNjMzEyZTkifSwgeyJpZCI6ICI4d2t0WEl0byt6dS8iLCAiYW1vdW50IjogNDA5NiwgInNlY3JldCI6ICI1NDM1ZmNiMmJjOWVjMTRlMjUzMmUzNjg3ZmQ2ODJlYzU4MDc1MGVhOGIxNDQyNWMyOTVmZjZhYzk5OTIwNzgwIiwgIkMiOiAiMDJhMTFhNmQ1ZDQxYTc0OWZhNTAzN2U1YmQ3MjhiYjE3NDMwNWEzMjQzMWQ2MGI5ZDlkY2I0YWUxOTI5MTI4ZWE1In0sIHsiaWQiOiAiOHdrdFhJdG8renUvIiwgImFtb3VudCI6IDE2Mzg0LCAic2VjcmV0IjogImU3MjRjZGNlMTE1YWY5ZGQxMmIyNTM5YWVlNDVhZjkzNjM0NjgxYWE4OWRjYTdhY2ViZGQyZDlmMDgxZjA2YTQiLCAiQyI6ICIwMjBiOTkxNTY0NDcwNjRhYzNlOTYxYTljYzhlNGFlNzcxZmU5ZGIwNTEzNzI0NWNiZGZiZWQxNzZmNWJlMzBlMmYifV0sICJtaW50IjogImh0dHA6Ly8xMjcuMC4wLjE6MzMzOCJ9XX0=',
    'cashuAeyJ0b2tlbiI6IFt7InByb29mcyI6IFt7ImlkIjogIjh3a3RYSXRvK3p1LyIsICJhbW91bnQiOiA4LCAic2VjcmV0IjogImRhMzI5MDVhOWFiZTUwZGUzZmU3YTFjZjFjMTU4ZWQ4MDUwMjM4MmVlOTc3MDg3NDY3NDMzODdmYjM2NjVmMjQiLCAiQyI6ICIwMzNmZTVhYzJjZDM2ZDAzZDgwMGU2ZDA0NWFhZDRhMDc3NThjNWY5YThlZGQ1Y2MzNjY2MjBlMzdjMWZhODA0ZDQifSwgeyJpZCI6ICI4d2t0WEl0byt6dS8iLCAiYW1vdW50IjogMzIsICJzZWNyZXQiOiAiMGJkMDA5NDViOGZjOTRkNDQ3NWNiYzA3NDQ0Y2E5ZDFmNzgwM2VhOTYyMmI2NDQyNmY4ZDU2YjkyODZhYjk2NyIsICJDIjogIjAzNWQyOWVmYWYxMTE2NzkwZDBjZmU5OWQwN2I3OGI2MjZhZWEzZWJkNTgxM2ViNDAxYmM5N2YzYTc3ZGJhOThkZiJ9LCB7ImlkIjogIjh3a3RYSXRvK3p1LyIsICJhbW91bnQiOiA2NCwgInNlY3JldCI6ICJjYjI5ZTVlM2Y2NzdiODkwZTZlNDAzOTVmNGFkYzQ5ZjlhNjI1MjhjYjY5NGE5MjdhNjJhMzUyN2Q1YjFjMTJjIiwgIkMiOiAiMDI1MjM4ZTQ5NTk5YWIyMjI1NjIxYWQxMzk5NjAzNTc3ODI0NjY3MGM4Y2I1MzU4MTNjN2Q3YzBhY2NiNmZmZWY1In0sIHsiaWQiOiAiOHdrdFhJdG8renUvIiwgImFtb3VudCI6IDQwOTYsICJzZWNyZXQiOiAiZTc4ZTIyNTlmM2FkNWEyMjdmMGNjNjAwNWVjYmYwOGVmOTJhODE0NzVhZDUwYmNmNmQ1YzE3YjhkYjEwZDJlMSIsICJDIjogIjAyMDYyOTQ1ZWQ1ZGYzMTNiMGY4YTBmNTRkYjc0ZjVlOGQ0OTllMjI5ZTQ0MTcxZGMzNmMwMGI1OTZmNGUwMjcyZCJ9XSwgIm1pbnQiOiAiaHR0cDovLzEyNy4wLjAuMTozMzM4In1dfQ==',
    'cashuAeyJ0b2tlbiI6IFt7InByb29mcyI6IFt7ImlkIjogIjh3a3RYSXRvK3p1LyIsICJhbW91bnQiOiAxNiwgInNlY3JldCI6ICIxNDZhNzM0NzAwODA5MGMwMTllNDM5NzAzMDgyNjI0MTBlMzg2YTNiY2M2N2FjYWU3YTRmN2VmYTYzNmU2ZjBhIiwgIkMiOiAiMDMxZjRjZWFlNjE4NzY4OTg5MGQ2YTU1Yzg3NjZiYjdlMzg0MDI1N2VkYzg5MzAyODRmYTQ4NmY2NjBmNzE0ZDA4In0sIHsiaWQiOiAiOHdrdFhJdG8renUvIiwgImFtb3VudCI6IDMyLCAic2VjcmV0IjogImJjMDdkZjY0ODNjZTUyNmRkZTFmY2Y0MTExM2NhNzRkYzMwYjhjY2VmM2Q5ZjRmYjJiM2E1NDM1ZTYyODRmNTUiLCAiQyI6ICIwMjI4ZmEyNTQ1ZGY5ZmVlYzhhMTkxOWVhYjZhYzc0OTRhODBjNGQxNDI0NmFlYWY2NjcwYzViZmM0Y2ZiNDEzOTEifSwgeyJpZCI6ICI4d2t0WEl0byt6dS8iLCAiYW1vdW50IjogNjQsICJzZWNyZXQiOiAiOGE3YzA2OTgwOTAxZDFiNzdlOTE4NDgwOTllZTVlYWVjYmM4ODM5NzcyZTU1MjFmMDhiYjZkYjYxMTA2MGY1ZiIsICJDIjogIjAzNjUzOWIzMThjMDdkMzg5ZjE4ZWQxNzFiODc2ZmJlN2U2NWM2ZDYzNjM0YTlmMTA4ZjYzZjg3ZDY2MzRiNzk0ZiJ9LCB7ImlkIjogIjh3a3RYSXRvK3p1LyIsICJhbW91bnQiOiA1MTIsICJzZWNyZXQiOiAiY2YzYWFhYmUxZWI0ZmI5ZTYxMDI4MzE4ZTA3NTgzYzE5MzczYTcxMWRkYTEzYmY4M2FjYjllMWFkZDhhMWMyMSIsICJDIjogIjAzMjQyZWVlNWI1YTQzOWEzMDJkZWU4YjU1MTk2NjlhODQ5ZWZiZjE1NTJjYjI4ZGFhNzA1NDVkMmE4OWFmZDIzNCJ9LCB7ImlkIjogIjh3a3RYSXRvK3p1LyIsICJhbW91bnQiOiA4MTkyLCAic2VjcmV0IjogIjk0M2JiYWRjOGFlOGQzOWQzYTE1YjA0Y2M5ZmE1NjhiZTlkNjFlNzNmOGY0NDA4ZGNkMGI5NTAzYWRkZDg5MzgiLCAiQyI6ICIwM2E2ODQxOGEyNDMzMGVjN2MyN2Y3YTQwYWRjZmJmZDgyNTcxN2QwNTQzM2IxNDZjOGQ3YjE5MDEyMzZkNTQ1YjgifSwgeyJpZCI6ICI4d2t0WEl0byt6dS8iLCAiYW1vdW50IjogMTYzODQsICJzZWNyZXQiOiAiNWY5ZDAzOWEzYjc0MmFmMjNhMWFkYjA2NzNjMzAzZDUxMjNlODEzNzg1Yjk2MDhhODMxZWYyNmMwMDc3ZDE0OSIsICJDIjogIjAyOTRlYjI4ZjdiYTQ1YWE5ZTlmMGY0YmVlOTg0OTI0ZjlmNWM4YWZhNWVjYTA0ZGQ0NjhmOWQyZGU5ZDQwM2NiNyJ9XSwgIm1pbnQiOiAiaHR0cDovLzEyNy4wLjAuMTozMzM4In1dfQ=='
]

promises = [
    {
      fst: [],
      snd: [
        {
          id: '8wktXIto+zu/',
          amount: 8,
          C_: '03a0ac7110e3de70aea60d0fa3d07d8201347e18479b12650db8be44af760b0017'
        },
        {
          id: '8wktXIto+zu/',
          amount: 512,
          C_: '024587fc2095e77d94430c5132e69ad404ea4f94e9fbe9594fd657a645f53b0ad6'
        },
        {
          id: '8wktXIto+zu/',
          amount: 4096,
          C_: '03605832bd062bb5a1c3fa727f92563adfd17fa2eccf75b2ec710e6444fa1e858a'
        },
        {
          id: '8wktXIto+zu/',
          amount: 16384,
          C_: '021036fa327dcdc3a5c9355b6a0b8ee36f7b03e06fa7beabe20e5d0b6a15152116'
        }
      ],
      deprecated: 'The amount field is deprecated since 0.13.0'
    },
    {
      fst: [],
      snd: [
        {
          id: '8wktXIto+zu/',
          amount: 8,
          C_: '0355491d607368ad7ab2c6a3f77b34f9f8d7bbd55a08769e5cfdf926bf91fff911'
        },
        {
          id: '8wktXIto+zu/',
          amount: 32,
          C_: '032a8c974e539d71645ea8a84f2db0e8dfc5422226a87244cec46cf0164f294ee6'
        },
        {
          id: '8wktXIto+zu/',
          amount: 64,
          C_: '03df5e2a4d7a2349fd665ac1ce7254a33754febc4a8eb3df1ac48aea986f7e12bb'
        },
        {
          id: '8wktXIto+zu/',
          amount: 4096,
          C_: '023598c62b756f6156c86c3c60d122f3c2eb2c8431b3eb56f4f5934854b32536a1'
        }
      ],
      deprecated: 'The amount field is deprecated since 0.13.0'
    },
    {
      fst: [],
      snd: [
        {
          id: '8wktXIto+zu/',
          amount: 16,
          C_: '036fed8f8c6400d16cf4e4150343ff2ad1b63e18fcef222d1c7da3cfccaeb53441'
        },
        {
          id: '8wktXIto+zu/',
          amount: 32,
          C_: '02f9561c29b9ec9f7be3b56e13647b81ab406a342c2da4149c8256d5717d5b8324'
        },
        {
          id: '8wktXIto+zu/',
          amount: 64,
          C_: '0287a365d9b062c47acbde19111de8a1fd77d99f7cfd469b2fc678b0faab841c96'
        },
        {
          id: '8wktXIto+zu/',
          amount: 512,
          C_: '022500d0a17bf060302463b83b6844970b8abcf0ba8f79e6dff18bfdc310924500'
        },
        {
          id: '8wktXIto+zu/',
          amount: 8192,
          C_: '03fbcce81d29ade80c3df383c508cb45fcc32792498d94493451d2b44307ca6650'
        },
        {
          id: '8wktXIto+zu/',
          amount: 16384,
          C_: '038fd0f1ea8b9cd18d13bbf29b16d6c4e06bf01b14d130dcf4d24771d791260c41'
        }
      ],
      deprecated: 'The amount field is deprecated since 0.13.0'
    }
]

beforeAll(()=>{
    nock.disableNetConnect();
})

beforeEach(()=>{
    nock.cleanAll()

    // Truncate tables
    TokenModel.delete()
    ProofsModel.delete()
    CustomerModel.delete()
    PaymentModel.delete()
    ItemsModel.delete()
    InvoiceModel.delete()
})

describe('test db query', () => {
    customer = new Customer('rxbryan@gmail.com', 'elee', 'akinyemi', 'chukwuka')
    invoice = new Invoice(items[0], `purchase by ${customer.name.firstname}`)
    payment = new Payment(customer.customerID, invoice)
    test('test add/get customer', () => {
        await paymentProcessor.addCustomer(customer)

        result = await paymentProcessor.getCustomer(customer.customerID)
        expect(result).toEqual(customer.serialize())
    })

    test('test add/get payment', ()=>{
        await paymentProcessor.addPayment(payment)
        result = await paymentProcessor.getPayment(payment.paymentID)
        expect(result).toEqual(payment.serialize())
    })

    test('test add/get invoice', ()=>{
        await paymentProcessor.addInvoice(invoice)
        result = await paymentProcessor.getInvoice(invoice.invoiceID)
        expect(result).toEqual(invoice.serialize())
    })
})

describe('test payments', ()=>{
    customer = new Customer('rxbryan@gmail.com', 'elee', 'akinyemi', 'chukwuka')
    invoice = new Invoice(items, `purchase by ${customer.name.firstname}`)
    payment = new Payment(customer.customerID, invoice)

    beforeEach(()=>{
        await paymentProcessor.addInvoice(invoice)
        await paymentProcessor.addPayment(payment)
        await paymentProcessor.addCustomer(customer)
    })
    test('receive partial payments', ()=>{
        nock(mintUrls[0]).post('/split').reply(200, {data: promises[0]})
        const {payment: confirmed_payment, invoice: updated_invoice} = await paymentProcessor.receivePayment(tokens[0], payment.paymentID)
        
        expect(confirmed_payment.amount).toBe(21000)
        expect(updated_invoice.amount_due).toBe(4200)
        expect(updated_invoice.amount_paid).toBe(21000)

        expect(updated_invoice.status).toBe(InvoiceStatus.OPEN)

        payment_2 = new Payment(customer.customerID, updated_invoice)
        await paymentProcessor.addPayment(payment_2)

        nock(mintUrls[0]).post('/split').reply(200, {data: promises[1]})
        const {payment: confirmed_payment_2, invoice: updated_invoice_2} = await paymentProcessor.receivePayment(tokens[1], payment.paymentID)

        expect(confirmed_payment_2.confirmed).toBe(true)
        expect(confirmed_payment_2.amount).toBe(4200)
        expect(updated_invoice_2.amount_due).toBe(0)
        expect(updated_invoice_2.status).toBe(InvoiceStatus.PAID)
    })

    test('canceling invoice', ()=>{
        nock(mintUrls[0]).post('/split').reply(200, {data: promises[2]})

        const {payment: confirmed_payment, invoice: updated_invoice} = await paymentProcessor.receivePayment(tokens[2], payment.paymentID)

        nock(mintUrls[0])
            .post('/split')
            .reply(200, {
                promises: [
                    {
                      id: '8wktXIto+zu/',
                      amount: 16,
                      C_: '036fed8f8c6400d16cf4e4150343ff2ad1b63e18fcef222d1c7da3cfccaeb53441'
                    },
                    {
                      id: '8wktXIto+zu/',
                      amount: 32,
                      C_: '02f9561c29b9ec9f7be3b56e13647b81ab406a342c2da4149c8256d5717d5b8324'
                    },
                    {
                      id: '8wktXIto+zu/',
                      amount: 64,
                      C_: '0287a365d9b062c47acbde19111de8a1fd77d99f7cfd469b2fc678b0faab841c96'
                    },
                    {
                      id: '8wktXIto+zu/',
                      amount: 512,
                      C_: '022500d0a17bf060302463b83b6844970b8abcf0ba8f79e6dff18bfdc310924500'
                    },
                    {
                      id: '8wktXIto+zu/',
                      amount: 8192,
                      C_: '03fbcce81d29ade80c3df383c508cb45fcc32792498d94493451d2b44307ca6650'
                    },
                    {
                      id: '8wktXIto+zu/',
                      amount: 16384,
                      C_: '038fd0f1ea8b9cd18d13bbf29b16d6c4e06bf01b14d130dcf4d24771d791260c41'
                    }
                ]
            });
        const {token, totalSum} = await paymentProcessor.cancelInvoice(invoice.invoiceID)

        expect(totalSum).toBe(invoice.amount_paid)
        updated_invoice = paymentProcessor.getInvoice(invoice.invoiceID)
        expect(updated_invoice.status).toBe(InvoiceStatus.VOID)
        expect(updated_invoice.amount_paid).toBe(0)
    })

    test('refunding payments', ()=>{
        nock(mintUrls[0]).post('/split').reply(200, {data: promises[1]})
        const {payment: confirmed_payment_2, invoice: updated_invoice_2} = await paymentProcessor.receivePayment(tokens[1], payment.paymentID)
        nock(mintUrls[0])
            .post('/split')
            .reply(200, {
                promises: [
                    {
                      id: '8wktXIto+zu/',
                      amount: 8,
                      C_: '0355491d607368ad7ab2c6a3f77b34f9f8d7bbd55a08769e5cfdf926bf91fff911'
                    },
                    {
                      id: '8wktXIto+zu/',
                      amount: 32,
                      C_: '032a8c974e539d71645ea8a84f2db0e8dfc5422226a87244cec46cf0164f294ee6'
                    },
                    {
                      id: '8wktXIto+zu/',
                      amount: 64,
                      C_: '03df5e2a4d7a2349fd665ac1ce7254a33754febc4a8eb3df1ac48aea986f7e12bb'
                    },
                    {
                      id: '8wktXIto+zu/',
                      amount: 4096,
                      C_: '023598c62b756f6156c86c3c60d122f3c2eb2c8431b3eb56f4f5934854b32536a1'
                    }
                ]
            });
        {totalSum} = await paymentProcessor.refundPayment(payment.paymentID, mintUrls[0])

        expect(totalSum).toBe(payment.amount)
    })
})