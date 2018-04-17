const mysql = require('mysql2');
const config = require('../config/config');
var Q = require('q');
const moment = require('moment');

function mySQL(){

}

module.exports = mySQL;

mySQL.prototype = {
    init: function(){
      console.log("initialized");
    },
    connect: function() {
        let deferred = Q.defer();
        const conn = new mysql.createConnection(config.mysql);
        conn.connect(
            function (err) {
            if (err) {
                deferred.reject(err);
            }
            else {
                deferred.resolve(conn);
            }
        });
        return deferred.promise
    },
    readData: function ( conn ) {
        let deferred = Q.defer();
        conn.query(`SELECT * FROM ${config.mysql.database} WHERE expirationDateTime <= NOW() + INTERVAL '${config.daysBeforeExpiration}' DAY`,
            function (err, results, fields) {
                if (err) {
                    deferred.reject(err);
                }  else {
                    deferred.resolve(results);
                }
            })
       conn.end(
           function (err) { 
            if (err) {
                deferred.reject(err);
            }  else {
                console.log('Closing connection.');
            }
        });
        return deferred.promise;
    },
    updateExpiryDate: function( conn, listID, subscriptionID ) {
        let deferred = Q.defer();
        let newExpiryDate = moment().add( config.monthsToAddToExpiration, "months" ).format("YYYY-MM-DD HH:mm:ss");
        conn.query(`UPDATE ${config.mysql.database} SET expirationDateTime = '${newExpiryDate}' WHERE subscriptionId = '${subscriptionID}'`,
            function (err, results, fields) {
                if (err) {
                    deferred.reject(err);
                }  else {
                    deferred.resolve(results);
                }
            });
        return deferred.promise;
    }
}