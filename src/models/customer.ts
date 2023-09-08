import {generateRandomString} from '../util.js'

type Name = {
    firstName: string
    middleName: string
    lastName: string
}

type CustomerID = string

class Customer {
    customerID: CustomerID;
    name: Name
    email: string;

    constructor(email: string, lastName: string, firstName: string, middleName: string = '') {
        this.customerID = generateRandomString(15);
        this.name = {firstName, middleName, lastName}
        this.email = email
    }

    serialize() {
        return {
            customerID: this.customerID,
            name: this.name,
            email: this.email
        }
    }
}

export { Customer }