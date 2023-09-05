import {generateRandomString} from '../util.js'

type Name = {
    firstName: string
    middleName: string
    lastName: string
}

type CustomerId = string

class Customer {
    CustomerId: CustomerId;
    name: Name
    email: string;

    constructor(email: string, lastName: string, firstName: string, middleName: string = '') {
        this.customerId = generateRandomString(15);
        this.name = {firstName, middleName, lastName}
        this.email = email
    }

    serialize() {
        return {
            customerId: this.CustomerId,
            name: this.name,
            email: this.email
        }
    }
}

export { Customer }