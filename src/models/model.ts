import { Database } from '../db.js'
import { CustomerID } from './customer.js'
import { PaymentID } from './payment.js'
import { InvoiceID } from './invoice.js'

type Columns = {
    name: string
    primay_key: boolean
    not_null: boolean
}

abstract class BaseModel {
    private _table: string
    private _columns: Columns[]
    private _schema: string
    private _primary_key: boolean
    db: Database

    constructor (db: Database) {
        this.db = db.get_db()
        this._create()

    }

    private _create() {
        this.db.exec(this._schema)
    }

    public insert(data: object) {
        return new Promise((resolve, reject) => {
            sql = null
            values = []
            query_placeholder = ''
            primay_key_passedin = false

            for (let {name, primay_key, not_null} of this._columns) {
                if (name in data)
                {   values.push(data[name])
                    query_placeholder += '(?),'
                    if (primay_key)
                        primay_key_passedin = true
                }
                else if (primay_key or not_null)
                    throw new Error(`'${name}' is required but was not passed in.`)
                else
                    query_placeholder += 'null,'
            }

            query_placeholder = query_placeholder.slice(0, -1)

            sql = `INSERT INTO ${this._table} VALUES ${query_placeholder};`

            this.db.run(sql, values, function (err) {
                if (err) reject(err)

                //else do something with this.lastID
                resolve(this.lastID)
            })
        })
    }

    public get(condition?: object, columns?: string[]) {
        return new Promise((resolve, reject) => {
            sql = null
            sql_condition = ''
            if (condition) {
               keys = Object.keys(condition)
                query_condition = keys.map((key)=>{
                    return `${key} = $${key}`
                })
                sql_condition = `Where ${query_condition.join('AND ')}`
            }

            if (columns) 
                sql = `SELECT ${columns.join(', ')} From ${this._table} ${sql_condition};`
            else
                sql = `SELECT * From ${this._table} ${sql_condition};`
                columns = this._columns
            
            this.db.all(sql, condition, function(err, rows) {
                if (err) reject(err)

                result = []
                for (row of rows) {
                    row_obj = {}
                    for (i in row) {
                        row_obj[columns[i]] = row[i]
                    }

                    result.push(row_obj)
                }
                resolve(result)
            })
        }
    }

    public update(data: object, condition?: object) {
        return new Promise((resolve, reject) => {
            sql = null
            sql_condition = ''
            if (condition) {
               keys = Object.keys(condition)
                query_condition = keys.map((key)=>{
                    return `${key} = $${key}`
                })
                sql_condition = `Where ${query_condition.join('AND ')}`
            }

            data_query = null
            if (data)
                keys = Object.keys(data)
                data_query = keys.map((key)=>{
                    return ` ${key} = $${key}`
                })

            sql = `UPDATE ${this._table} SET ${data || ''} ${sql_condition};`

            
            this.db.run(sql, {...data, ...condition}, function(err) {
                if (err) reject(err)

                //else do something with this.object.changes
            })
        }
    }

    public delete(condition?: object) {
        return new Promise((resolve, reject) => {
            sql = null
            sql_condition = ''
            if (condition) {
               keys = Object.keys(condition)
                query_condition = keys.map((key)=>{
                    return `${key} = $${key}`
                })
                sql = `DELETE FROM ${this._table} Where ${query_condition.join('AND ')};`
            }
            else {
                // Truncate table
                sql = `DELETE FROM ${this._table};`
            }
            
            this.db.run(sql, condition, function(err) {
                if (err) reject(err)

                //else do something with this.object.changes
            })
        }
    }
}

class TokenModel extends BaseModel {
    constructor (db: Database) {
        super(db)

        this._table = 'Tokens'
        this._schema = `CREATE TABLE IF NOT EXISTS ${this._table}
        (mintUrl VARCHAR NOT NULL,
        proofID INTEGER NOT NULL,
        memo VARCHAR,
        UNIQUE (proofID),
        FOREIGN KEY (proofID) REFERENCES Proofs(rowid))`
        this._primary_key = false
        this._columns = [
            {
                name: 'mintUrl',
                primay_key: false,
                not_null: true
            },
            {
                name: 'proofID',
                primay_key: false,
                not_null: true
            },
            {
                name: 'memo',
                primay_key: false,
                not_null: false
            }
        ]
    }
}

class ProofsModel extends BaseModel {
    constructor (db: Database) {
        super(db)

        this._table = 'Proofs'
        this._schema = `CREATE TABLE IF NOT EXISTS ${this._table}
        (id VARCHAR NOT NULL,
        amount INT NOT NULL,
        secret VARCHAR NOT NULL,
        C VARCHAR NOT NULL)`
        this._primary_key = false
        this._columns = [
            {
                name: 'id',
                primay_key: false,
                not_null: true
            },
            {
                name: 'amount',
                primay_key: false,
                not_null: true
            },
            {
                name: 'secret',
                primay_key: false,
                not_null: true
            },
            {
                name: 'C',
                primay_key: false,
                not_null: true
            }
        ]
    }
}

class CustomerModel extends BaseModel {
    constructor (db: Database) {
        super(db)

        this._table = 'Customers'
        this._schema = `CREATE TABLE IF NOT EXISTS ${this._table}
        (customerID VARCHAR NOT NULL,
        firstName VARCHAR NOT NULL,
        middleName VARCHAR NOT NULL,
        lastName VARCHAR NOT NULL,
        email VARCHAR,
        UNIQUE (customerID),
        UNIQUE (firstName, middleName, lastName, email))`
        this._primary_key = false
        this._columns = [
            {
                name: 'customerID',
                primay_key: false,
                not_null: true
            },
            {
                name: 'firstName',
                primay_key: false,
                not_null: true
            },
            {
                name: 'middleName',
                primay_key: false,
                not_null: true
            },
            {
                name: 'lastName',
                primay_key: false,
                not_null: true
            },
            {
                name: 'email',
                primay_key: false,
                not_null: false
            }
        ]
    }
}

class PaymentModel extends BaseModel {
    constructor (db: Database) {
        super(db)

        this._table = 'Payments'
        this._schema = `CREATE TABLE IF NOT EXISTS ${this._table}
        (paymentID VARCHAR NOT NULL,
        customerID VARCHAR NOT NULL,
        invoiceID VARCHAR,
        confirmed BOOL NOT NULL,
        amount INT NOT NULL,
        paidAt INT,
        UNIQUE (paymentID),
        FOREIGN KEY (customerID) REFERENCES Customers(customerID),
        FOREIGN KEY (invoiceID) REFERENCES Invoice(invoiceID))`
        this._primary_key = false
        this._columns = [
            {
                name: 'PaymentID',
                primay_key: false,
                not_null: true
            },
            {
                name: 'customerID',
                primay_key: false,
                not_null: true
            },
            {
                name: 'invoiceID',
                primay_key: false,
                not_null: false
            },
            {
                name: 'confirmed',
                primay_key: false,
                not_null: true
            },
            {
                name: 'amount',
                primay_key: false,
                not_null: true
            },
            {
                name: 'paidAt',
                primay_key: false,
                not_null: false
            }
        ]
    }
}

class ItemsModel extends BaseModel {
    constructor (db: Database) {
        super(db)

        this._table = 'Items'
        this._schema = `CREATE TABLE IF NOT EXISTS ${this._table}
        (itemID VARCHAR NOT NULL,
        invoiceID VARCHAR NOT NULL,
        price INT NOT NULL,
        quantity INT NOT NULL,
        description VARCHAR NOT NULL,
        createdAt INT NOT NULL,
        updatedAt INT,
        UNIQUE (itemID),
        FOREIGN KEY (invoiceID) REFERENCES Invoice(invoiceID))`
        this._primary_key = false
        this._columns = [
            {
                name: 'itemID',
                primay_key: false,
                not_null: true
            },
            {
                name: 'invoiceID',
                primay_key: false,
                not_null: true
            },
            {
                name: 'price',
                primay_key: false,
                not_null: true
            },
            {
                name: 'quantity',
                primay_key: false,
                not_null: true
            },
            {
                name: 'description',
                primay_key: false,
                not_null: true
            },
            {
                name: 'createdAt',
                primay_key: false,
                not_null: true
            },
            {
                name: 'updatedAt',
                primay_key: false,
                not_null: false
            },
            {
                name: 'amount',
                primay_key: false,
                not_null: true
            }
        ]
    }
}

class InvoiceModel extends BaseModel {
    constructor (db: Database) {
        super(db)

        this._table = 'Invoice'
        this._schema = `CREATE TABLE IF NOT EXISTS ${this._table}
        (invoiceID VARCHAR NOT NULL,
        totalSum INT NOT NULL,
        description VARCHAR NOT NULL,
        hosted_invoice_url VARCHAR,
        createdAt INT NOT NULL,
        clearedAt INT NOT NULL,
        amount_paid INT NOT NULL,
        amount_due INT NOT NULL,
        status INT NOT NULL,
        UNIQUE (invoiceID),
        FOREIGN KEY (paymentID) REFERENCES Payments(paymentID),
        FOREIGN KEY (itemID) REFERENCES Items(itemID))`
        this._primary_key = false
        this._columns = [
            {
                name: 'invoiceID',
                primay_key: false,
                not_null: true
            },
            {
                name: 'totalSum',
                primay_key: false,
                not_null: true
            },
            {
                name: 'description',
                primay_key: false,
                not_null: true
            },
            {
                name: 'hosted_invoice_url',
                primay_key: false,
                not_null: false
            },
            {
                name: 'createdAt',
                primay_key: false,
                not_null: true
            },
            {
                name: 'clearedAt',
                primay_key: false,
                not_null: true
            },
            {
                name: 'amount_paid',
                primay_key: false,
                not_null: true
            },
            {
                name: 'amount_due',
                primay_key: false,
                not_null: true
            },
            {
                name: 'status',
                primay_key: false,
                not_null: true
            }
        ]
    }
}


export { 
    (new TokenModel(new Database())) as TokenModel,
    (new ProofsModel(new Database()) as ProofsModel),
    (new CustomerModel(new Database())) as CustomerModel,
    (new PaymentModel(new Database())) as PaymentModel,
    (new ItemsModel(new Database()) as ItemsModel),
    (new InvoiceModel(new Database()) as InvoiceModel)
}