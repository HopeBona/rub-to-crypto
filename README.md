This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

# Live demo

https://ipfs.io/ipfs/QmWXN2NtkaboodSWV5hZH52vat5QD5APBQR2fBKS9EX5Xh

## Description

Find the best rate to exchange your roubles to crypto

### Algorithm

- Downloads zip-archive with data from https://www.bestchange.ru/ in memory of a browser
- Fetches market prices from  https://www.cryptocompare.com/
- Calculates differences between rates of specific assets
    <details><summary>Crypto Assets</summary>
        - BTC
        - ETH
        - BCH
        - BSV
        - BTG
        - ETC
        - LTC
        - XRP
        - XMR
        - DASH
        - ZEC
        - USD
        - PAX
        - XEM
        - REP
        - NEO
        - EOS
        - IOTA
        - LSK
        - ADA
        - XLM
        - WAVES
        - OMG
        - BNB
        - ICX
        - BA
    </details>
    <details><summary>Fiat Assets</summary>    
        - Sberbank Roubles
        - Yandex Money Roubles
        - QIWI Roubles        
    </details>
- Sorts values
- Screens top 12

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!
