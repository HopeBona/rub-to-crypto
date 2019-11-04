import React, {Component} from "react";
import {Col, Table} from 'reactstrap';

import AdmZip from 'adm-zip';
import request from 'request';
import axios from 'axios';

class FeeTable extends Component {
    constructor(props) {
        super(props);

        this.state = {
            cryptoCurrencies: [],
            fiatCodes: [],
            allRates: [],
            currencyCodes: [],
            results: [],
            infoUrl: 'http://www.bestchange.ru/bm/info.zip',
            opacity: 0,
        };
    }

    componentDidMount() {
        this.opacityChanger();
        this.fetchExchangesData();
    }

    opacityChanger() {
        let up = true;

        const opacityIterator = setInterval(() => {
            if (this.state.results.length) {
                clearInterval(opacityIterator);
            }

            let opacity = this.state.opacity;

            if (up) {
                opacity += 0.01;
            } else {
                opacity -= 0.01;
            }

            if (opacity >= 1) {
                up = false;
            }

            if (opacity <= 0) {
                up = true;
            }

            this.setState({
                opacity,
            });

        }, 9);
    }

    fetchExchangesData() {

        const proxyUrl = 'https://cors-anywhere.herokuapp.com/';

        request.get({url: proxyUrl + this.state.infoUrl, encoding: null}, async (err, res, body) => {

            const zip = new AdmZip(body);
            const zipEntries = zip.getEntries();

            zipEntries.forEach(entry => {
                if (entry.entryName.match(/bm_rates/i)) {
                    let data = zip.readAsText(entry, 'utf8');
                    data = data.split(';1\n');
                    this.setState({ allRates: data });
                } else if (entry.entryName.match(/bm_cycodes/i)) {
                    let data = zip.readAsText(entry, 'utf8');
                    data = data.split("\n");
                    this.setState({ currencyCodes: data });
                }
            });

            await this.unpackData();

            this.calculateFees();

        })
    }

    calculateFees() {
        let currencies = [];

        for (let cc of this.state.cryptoCurrencies) {
            for (let fiat of this.state.fiatCodes) {
                let pairRates = this.state.allRates.filter(s => s.startsWith(`${fiat.code};${cc.code};`));
                pairRates.forEach(s => {
                    s = s.split(';');
                    currencies.push({
                        fee: Number((((Number(s[3]) / cc.price) - 1) * 100).toFixed(3)),
                        cryptoSymbol: cc.name,
                        fiatSymbol: fiat.name.replace('SBERRUB', 'Сбер')
                            .replace('QWRUB', 'Qiwi')
                            .replace('YAMRUB', 'Яндекс'),
                        price: Number(s[3]).toFixed(2),
                        reserve: s[5],
                        cryptoName: cc.fullName,
                        fiatName: fiat.fullName,
                    });
                });
            }
        }

        currencies.sort(function(a, b) {
            if (a.fee > b.fee) return 1;
            if (a.fee < b.fee) return -1;
            return 0;
        });

        this.setState({
            results: currencies.slice(0, 12)
        });
    }

    async unpackData() {
        const cryptoCurrencies = [];
        const fiatCodes = [];
        const symbols = ['ETH', 'BTC', 'BCH', 'BSV', 'BTG', 'ETC', 'LTC', 'XRP', 'XMR', 'DASH', 'ZEC', 'USDT',
            'PAX', 'XEM', 'REP', 'NEO', 'EOS', 'IOTA', 'LSK', 'ADA', 'XLM', 'WAVES', 'OMG', 'BNB',
            'ICX', 'BAT'];

        const cryptoFullNames = ['ethereum', 'bitcoin', 'bitcoin-cash', 'bitcoin-sv', 'bitcoin-gold', 'ethereum-classic',
            'litecoin', 'ripple', 'monero', 'dash', 'zcash', 'tether',
            'paxos', 'nem', 'augur', 'neo', 'eos', 'iota', 'lisk', 'cardano', 'stellar', 'waves', 'omg', 'binance-coin',
            'icon', 'bat'];

        const pricesPromises = [];

        symbols.map(symbol => pricesPromises.push(FeeTable.getMarketPrice(symbol)));

        const prices = await Promise.all(pricesPromises);

        prices.forEach((price, i) => {
            cryptoCurrencies.push({
                name: symbols[i],
                code: this.getCurrencyCode(symbols[i]),
                price,
                fullName: cryptoFullNames[i],
            });
        });

        const fiatFullName = ['sberbank', 'yandex-money', 'qiwi'];
        ['SBERRUB', 'YAMRUB', 'QWRUB'].forEach((name, i) => {
            fiatCodes.push({
                name,
                code: this.getCurrencyCode(name),
                fullName: fiatFullName[i],
            });
        });

        this.setState({ cryptoCurrencies, fiatCodes });
    }

    getCurrencyCode(name) {
        for (let code of this.state.currencyCodes) {
            code = code.split(';');
            if (code[1] === name) {
                return code[0];
            }
        }
    }

    static async getMarketPrice(symbol) {
        const url = `https://min-api.cryptocompare.com/data/price?fsym=${symbol}&tsyms=RUB`;
        let res = await axios.get(url);
        return res.data.RUB;
    }

    render() {

        if (!this.state.results.length) return <p style={{opacity: this.state.opacity }}>Calculations...</p>;

        return (
            <Col sm="12" md={{ size: 8}}>
            <Table dark striped responsive="md">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>fee, %</th>
                        <th>currency</th>
                        <th>buy with</th>
                        <th>price, rub</th>
                        <th>reserve</th>
                    </tr>
                </thead>
                <tbody>
                {this.state.results.map((item, i) => {
                    return (
                        <tr key={i}>
                            <th scope="row">
                                <a href={`https://www.bestchange.ru/${item.fiatName}-to-${item.cryptoName}.html`}
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   style={{textDecorationLine: "underline"}}
                                >{i + 1}
                                </a>
                            </th>
                            <td>{ item.fee }</td>
                            <td>{ item.cryptoSymbol }</td>
                            <td>{ item.fiatSymbol }</td>
                            <td>{ item.price }</td>
                            <td>{ item.reserve }</td>
                        </tr>
                    )
                })}
                </tbody>
            </Table>
            </Col>
        );
    }
}

export default FeeTable;
