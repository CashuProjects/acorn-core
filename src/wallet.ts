import {
    CashuMint,
    CashuWallet,
    getEncodedToken,
    getDecodedToken,
    getDecodedLnInvoice,
    Token,
    TokenEntry,
    Proof
} from '@cashu/cashu-ts';

import {TokenModel, ProofsModel} from './models/model.js'
import {cleanToken} from './util.js'

interface WalletIndexedWithMintUrl {
    [index: string]: CashuWallet
}

interface Balance {
    [index: string]: number
}

class Wallet {
    _wallets: WalletIndexedWithMintUrl[]
    _mints: CashuMint[]

    constructor(mintUrls: string[]) {
        this._mints = []
        this._wallets = []

        for (mintUrl of mintUrls) {
            mint = new CashuMint(mintUrl)
            wallet = new CashuWallet(mint)
            this._wallets[mintUrl] = wallet
            this._mints.push(mint)
        }
    }

    async addfunds(tokenStr: string, amount?: number){
        const response = cleanToken(getDecodedToken(encodedToken));
        tokenFromUnsupportedMint: Array<TokenEntry> = []
        const tokenEntries: Array<TokenEntry> = [];
        const tokenEntriesWithError: Array<TokenEntry> = [];
        for (const tokenEntry of response.token) {
            if (!tokenEntry?.proofs?.length) {
                continue;
            }
            
            if (!(tokenEntry.mint in this._wallets)) {
                tokenFromUnsupportedMint.push(tokenEntry)
            }

            try {
                const {
                    proofsWithError,
                    proofs,
                } = await CashuWallet.receiveTokenEntry(tokenEntry);
                if (proofsWithError?.length) {
                    tokenEntriesWithError.push(tokenEntry);
                    continue;
                }
                tokenEntries.push({ mint: tokenEntry.mint, proofs: [...proofs] });
                
            } catch (error) {
                console.error(error);
                tokenEntriesWithError.push(tokenEntry);
            }
        }
        // There is a possibility of a token having some error or been spent alreadly spent

        totalSum = 0
        // Add tokens to db
        for (token of tokenEntries) {
            for (proof of token.proofs) {
                totalSum += proof.amount
                rowid = await ProofsModel.insert(proof)
                await TokenModel.insert({proofID: rowid, mintUrl: token.mint})
            }
        }

        return {
            token: {token: tokenEntries},
            tokensWithErrors,
            tokenFromUnsupportedMint,
            totalSum
        }
    }

    async getbalance(mintUrl?: string): Balance {
        tokens = await TokenModel.get({mintUrl: mintUrl} ? mintUrl : {}, ['mintUrl', 'proofID'])
        balance = {}
        for (token of tokens) {
            proof = await ProofsModel.get({rowid :token[0].proofID}, ['amount'])
            if (balance[tokens.mintUrl])
                balance[tokens.mintUrl] += proof.amount
            else
                balance[tokens.mintUrl] = proof.amount 

        }

        return balance
    }

    async payoutToLN(invoice: string, mintUrl: string, amount?: number): boolean {
        wallet = this._wallets[mintUrl]
        feeReserve =  wallet.getFee(invoice)

        decodedInvoice = getDecodedLnInvoice(invoice)

        for (section of decodedInvoice.sections) {
            if (section['name'] == 'amount') {
                amount = amount || section['value']
                //assert(amount == section['value'])
            }
        }

        // Get proof for amount
        proofs = await this.getProofs(amount, mintUrl)

        // Melt tokens and pay Invoice
        const {isPaid, preimage, change} = wallet.payLnInvoice(invoice, proofs, feeReserve)

        if (isPaid) {
            // Delete proofs
            await this.deleteProofs(proofs)
        }
        return isPaid
    }

    async swap(from: string, to: string, amount) {
        wallet1 = this._wallets[to]
        data1 = this._wallets[to].requestMint(amount)
        feeReserve1 = this._wallets[from].getFee(data1.pr)
        spend_proofs = getProofs(amount+feeReserve, from)
        const {isPaid, preimage, change} = this._wallets[from].payLnInvoice(data1.pr, spend_proofs, feeReserve)
        if (isPaid) {
            const { proofs } = this._wallets[to].requestTokens(amount, data.hash)

            await this.storeProofs(proofs, to)
            await this.deleteProofs(spend_proofs) 
        }
        return {success: isPaid, amount: amount}
    }

    async storeProofs(proofs: Proof[], mintUrl: string) {
            for (proof of proofs) {
                rowid = await ProofsModel.insert(proof)
                await TokenModel.insert({proofID: rowid, mintUrl: mintUrl})
            }
    }

    async getProofs(amount: number, mintUrl: string) : Proof {
        totalSum = 0
        proofs = []
        tokens = await TokenModel.get({mintUrl: mintUrl}, ['proofID'])
        iterator = 0
        while (totalSum <= (amount) && iterator < tokens.length) {
            proof  = await ProofsModel.get({rowid: tokens[iterator].mintUrl})
            totalSum += proof[0].amount
            proofs.push(proof[0])
            iterator++
        }
        if (totalSum > amount) {
            response = this._wallets[mintUrl].send(amount, proofs)
            await this.deleteProofs(proofs)
            await this.storeProofs(response.returnChange)
            await this.storeProofs(response.send)
            proofs = response.send
            totalSum = amount
        }
        return {proofs, totalSum}
    }

     async deleteProofs(proofs: Proof[]) {
        for (proof of proofs) {
                proof_rowid = (await ProofsModel.get(proof, ['rowid']))[0].rowid
                await TokenModel.delete({proofID: proof_rowid})
                await ProofsModel.delete(proof)
        }
    }

}