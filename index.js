/*---------------------------------------------------------------------------------------------
 *  Copyright (c) kkChan(694643393@qq.com). All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict'

const request = require('request');
const userAgent = "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36";

class HttpSession {
    constructor() {
        this.cookie = [];
        this.blocks = [];
    }

    clearCookie() {
        this.cookie = [];
    }

    setCookie(cookies) {
        this.cookie.addRange(cookies);
    }

    getCookie() {
        return this.cookie;
    }

    _request(options) {
        return new Promise((resolve, reject) => {
            request(options, (err, res, body) => {
                if (err) {
                    reject(err)
                } else {
                    if (res && res.headers['set-cookie'] instanceof Array) {
                        this.cookie.addRange(res.headers['set-cookie']);
                    }

                    switch (res.statusCode) {
                        case 302:
                            this.get(res.headers['location']).then(result => {
                                resolve(result);
                            }).catch(err => {
                                reject(err);
                            });
                            break;
                        case 200:
                            resolve(body);
                            break;
                        default:
                            resolve(body);
                            break;
                    }
                }
            });
        });
    }

    checkStatusCode(url) {
        return new Promise((resolve, reject) => {
            var options = {
                method: 'GET',
                url: url,
                headers: {
                    'User-Agent': userAgent,
                    'Cookie': this.cookie
                }
            };

            request(options, (err, res, body) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(res.statusCode);
                }
            });
        });
    }

    get(url) {
        return this._request({
            method: 'GET',
            url: url,
            headers: {
                'User-Agent': userAgent,
                'Cookie': this.cookie
            }
        });
    }

    getJson(url) {
        return this._request({
            method: 'GET',
            url: url,
            json: true,
            headers: {
                "content-type": "application/json",
                'User-Agent': userAgent,
                'Cookie': this.cookie
            }
        });
    }

    post(url, data) {
        return this._request({
            method: 'POST',
            url: url,
            headers: {
                "content-type": "application/x-www-form-urlencoded",
                'User-Agent': userAgent,
                'Cookie': this.cookie
            },
            form: data
        });
    }
}

module.exports = HttpSession;