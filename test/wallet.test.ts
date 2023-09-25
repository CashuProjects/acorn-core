import nock from 'nock'
import { Wallet } from '../src/wallet.js'
import {TokenModel, ProofsModel} from '../src/models/model.js'

mintUrls = [
    'http://127.0.0.1:3338',
    'https://8333.space:3338'
]
wallet = new Wallet(mintUrls)

// 21000 sats
token = 'cashuAeyJ0b2tlbiI6IFt7InByb29mcyI6IFt7ImlkIjogIjh3a3RYSXRvK3p1LyIsICJhbW91bnQiOiA4LCAic2VjcmV0IjogImJlZmUxYTJhMmI1ZTIyOWVlNjkzYzQyNWFiNjdjM2M4MTYyYTE0MzM1ZGJlZDk2ZWExNDljNzI1ZmVhMjUzNmQiLCAiQyI6ICIwMzVlYWE0YjIzNjQxMWI2NmVmMzNmYTU5Yzc4MjI2OTNjYzU4MjA5YzFhYWI0MmZhYjZmZTQwNWI4MjhjNmRhYzQifSwgeyJpZCI6ICI4d2t0WEl0byt6dS8iLCAiYW1vdW50IjogNTEyLCAic2VjcmV0IjogImM1OGE5ZjBmMzU2ZjhmNjQ4YmQxYmUxYzg0YzAxNWYxMDYxNTIxZmFkZGEzZDU1NGQxMGRmMjhlOWRmMDJjMDciLCAiQyI6ICIwMzZjYzBkMmNiMzk0OGM5OGFjMmFmNDIzMzNiZGU0OWFhYjY4YzY4OGNjYjk0MTU5YWUxNWY2YzU0ZmNjMzEyZTkifSwgeyJpZCI6ICI4d2t0WEl0byt6dS8iLCAiYW1vdW50IjogNDA5NiwgInNlY3JldCI6ICI1NDM1ZmNiMmJjOWVjMTRlMjUzMmUzNjg3ZmQ2ODJlYzU4MDc1MGVhOGIxNDQyNWMyOTVmZjZhYzk5OTIwNzgwIiwgIkMiOiAiMDJhMTFhNmQ1ZDQxYTc0OWZhNTAzN2U1YmQ3MjhiYjE3NDMwNWEzMjQzMWQ2MGI5ZDlkY2I0YWUxOTI5MTI4ZWE1In0sIHsiaWQiOiAiOHdrdFhJdG8renUvIiwgImFtb3VudCI6IDE2Mzg0LCAic2VjcmV0IjogImU3MjRjZGNlMTE1YWY5ZGQxMmIyNTM5YWVlNDVhZjkzNjM0NjgxYWE4OWRjYTdhY2ViZGQyZDlmMDgxZjA2YTQiLCAiQyI6ICIwMjBiOTkxNTY0NDcwNjRhYzNlOTYxYTljYzhlNGFlNzcxZmU5ZGIwNTEzNzI0NWNiZGZiZWQxNzZmNWJlMzBlMmYifV0sICJtaW50IjogImh0dHA6Ly8xMjcuMC4wLjE6MzMzOCJ9XX0='

proofs = [
  {
    id: '8wktXIto+zu/',
    amount: 8,
    secret: 'befe1a2a2b5e229ee693c425ab67c3c8162a14335dbed96ea149c725fea2536d',
    C: '035eaa4b236411b66ef33fa59c7822693cc58209c1aab42fab6fe405b828c6dac4'
  },
  {
    id: '8wktXIto+zu/',
    amount: 512,
    secret: 'c58a9f0f356f8f648bd1be1c84c015f1061521fadda3d554d10df28e9df02c07',
    C: '036cc0d2cb3948c98ac2af42333bde49aab68c688ccb94159ae15f6c54fcc312e9'
  },
  {
    id: '8wktXIto+zu/',
    amount: 4096,
    secret: '5435fcb2bc9ec14e2532e3687fd682ec580750ea8b14425c295ff6ac99920780',
    C: '02a11a6d5d41a749fa5037e5bd728bb174305a32431d60b9d9dcb4ae1929128ea5'
  },
  {
    id: '8wktXIto+zu/',
    amount: 16384,
    secret: 'e724cdce115af9dd12b2539aee45af93634681aa89dca7acebdd2d9f081f06a4',
    C: '020b99156447064ac3e961a9cc8e4ae771fe9db05137245cbdfbed176f5be30e2f'
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
})

describe('test wallet api', async () => {
    test('test proofs handling', ()=>{
        await wallet.storeProofs(proofs, mintUrls[0])
        balance = await wallet.getBalance()

        expect(balance[mintUrls[0]]).toBe(21000)

        {proofs: _proofs, totalSum} = await wallet.getProofs(21000, mintUrls[0])
        expect(totalSum).toBe(21000)

        await wallet.deleteProofs(_proofs)
        balance = await wallet.getBalance()
        expect(balance[mintUrls[0]]).toBe(0)

    })

    test('test swaps', async () => {
        await wallet.storeProofs(proofs, mintUrls[0])

        nock(mintUrls[1]).get('/mint').reply(200, {hash:'J1FaMvr-jQFkgT_USiG7_0fln7ncp04VeOclADQT', pr:'lnbc5400n1pj3pvjwsp59mvjnxjm03nrdufvfnkfprrurqpe5qje70f3rvlejnxkz5s2nzwspp5xpqceksq2y2w2yn7nddqqh4xk3m3xdfhf6q9depmy8v977cynlpqdq4gdshx6r4ypjx2ur0wd5hgxqzjccqpjrzjq23l9tvdqdx2hn8gr7xr3gjmnlnhcplz8ak235wsf5wm95tflyxmcze2agqqdggqqqqqqqqqqqqqztqq9q9qxpqysgqzsg4jemzdlmaqjgrqv967udf8l8ltm8c7eg2luwnd7wd0xhevc4qfu96e5v2pz3tw68yqlhlvwnxwj4ntph9pncmenxp6clsgmewtysp2qhfz3'})

        nock(mintUrls[0]).post('/checkfees').reply(200, { fee: 0 });

        nock(mintUrls[0]).post('/melt').reply(200, { paid: true, preimage: '' });
        nock(mintUrls[1])
            .post('/mint?hash=J1FaMvr-jQFkgT_USiG7_0fln7ncp04VeOclADQT')
            .reply(200, {
                promises: [
                    {
                        id: '8wktXIto+zu/',
                        amount: 4,
                        C_: '0260e17987589b0f2fc818d3cebd1ec6072951adfe0e5a66d0ef9163f2d9c260b0'
                    },
                    {
                        id: '8wktXIto+zu/',
                        amount: 8,
                        C_: '0374e1cb4ba9f8443e0bbc6ddee7944bfbe0b0b7e9e05bd54752a7e94ffc5115ef'
                    },
                    {
                        id: '8wktXIto+zu/',
                        amount: 16,
                        C_: '02a4cc74acfa3c15caa6175dc69a2947e86f6e6af36ba52d57dc99f47068172ffa'
                    },
                    {
                        id: '8wktXIto+zu/',
                        amount: 512,
                        C_: '03340562190a5b7b7427aa2d3a021464ce17dc88177397368a605fafe218507f6c'
                    }
                ]

            });
    })
    nock(mintUrls[0])
            .post('/split')
            .reply(200, {
                promises: [
                    {
                        id: '8wktXIto+zu/',
                        amount: 4,
                        C_: '0260e17987589b0f2fc818d3cebd1ec6072951adfe0e5a66d0ef9163f2d9c260b0'
                    },
                    {
                        id: '8wktXIto+zu/',
                        amount: 8,
                        C_: '0374e1cb4ba9f8443e0bbc6ddee7944bfbe0b0b7e9e05bd54752a7e94ffc5115ef'
                    },
                    {
                        id: '8wktXIto+zu/',
                        amount: 16,
                        C_: '02a4cc74acfa3c15caa6175dc69a2947e86f6e6af36ba52d57dc99f47068172ffa'
                    },
                    {
                        id: '8wktXIto+zu/',
                        amount: 512,
                        C_: '03340562190a5b7b7427aa2d3a021464ce17dc88177397368a605fafe218507f6c'
                    }
                ]
            });

    {success} = await wallet.swap(...mintUrls, 540)
    expect(success).toBe(true)
    balance = await wallet.getBalance(mintUrls[1])
    expect(balance[mintUrls[1]]).toBe(540)



    test('test payoutTOLN', async ()=>{
        await wallet.storeProofs(proofs, mintUrls[0])
        nock(mintUrls[0])
            .post('/split')
            .reply(200, {
                promises: [
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
                ]
            });
        nock(mintUrls[0]).post('/checkfees').reply(200, { fee: 0 });

        nock(mintUrls[0]).post('/melt').reply(200, { paid: true, preimage: '' })

        success = await wallet.payoutToLN(
            'lnbc210u1pj3p4c6sp5edhncx0a5ham8y6fcht0396v6afp45qzcmxjamu7nx8gfa99r3xspp54qlf0qtfjel7l2arv5f35qf33nd2znqnm7w46zp03qj7v0xwk3aqdq4gdshx6r4ypjx2ur0wd5hgxqzjccqpjrzjqwswm5jmjcv58elkepa2van6vzcreml4y4ufspcgy8ym4fxmqpr2kz70nsqqw2cqqyqqqqlgqqqqqqgq9q9qxpqysgqrrfqxqgkm8ty0e6m5z4dwpt25rnp2n0l8v3udny08e67vvhqfw9s3dnen47g6l4xtfke7g6ac593xny6j3l6u6u6f4npe6jk54ff9uqpce4vyz',
            mintUrls[0],
            21000
        )
        expect(success).toBe(true)
    })

})
