import {generateRandomString} from '../util.js'
import {CustomerID} from './types.js'
class Customer {
    customerID: CustomerID;
    name: string
    lastName: string
    firstName: string
    middleName: string
    email: string;

    constructor(email: string, lastName: string, firstName: string, middleName?: string) {
        this.customerID = generateRandomString(15);
        this.lastName = lastName
        this.firstName = firstName
        this.middleName = middleName || ''
        this.email = email
    }

    get name () {return `${this.lastName} ${this.firstName} ${this.middleName}`}

    serialize() {
        return {
            customerID: this.customerID,
            name: this.name,
            email: this.email
        }
    }
}

export { Customer }