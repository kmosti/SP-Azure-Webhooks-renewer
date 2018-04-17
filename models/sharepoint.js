var pnp = require('sp-pnp-js');
var NodeFetchClient = require('node-pnp-js').default;
var config = require('../config/config');
var Q = require('q');
var JsomNode = require('sp-jsom-node').JsomNode;
const moment = require('moment');

function spWeb(){

}

module.exports = spWeb;

spWeb.prototype = {
    init: function () {
        pnp.setup({
            sp: {
                fetchClientFactory: () => {
                    let credentials =  {
                        username: config.spUserName,
                        password:  config.spPassword
                    };
                    return new NodeFetchClient(credentials);
                }
            }
        });
    },
    getContext: function ( url ) {
        let deferred = Q.defer();

        let jsomNodeOptions = {
            siteUrl: url,
            authOptions: {
                username: config.spUserName,
                password: config.spPassword
            },
            config: {
                encryptPassword: false
            },
            envCode: "spo"
        };

        (new JsomNode(jsomNodeOptions)).init();

        let ctx = SP.ClientContext.get_current();

        deferred.resolve(ctx);

        return deferred.promise;
    },
    updateExpirationDate: function( url, list, subscription) {
        let deferred = Q.defer();
        let Web = new pnp.Web(url);
        let newDate = moment().add(config.monthsToAddToExpiration, "months").format("YYYY-MM-DDThh:mm:ss");

        Web.lists.getById(list).subscriptions.getById(subscription).update(newDate).then( updateResult => {
            deferred.resolve(updateResult);
        }).catch( err => {
            deferred.reject(err);
        });

        return deferred.promise;
    }
}