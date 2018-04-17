'use strict';
var config = require("./config/config");
var spWeb = require("./models/sharepoint");
const mySQL = require("./models/mysql");
const Q = require('q');

//initiate sharepoint service
var getWeb = new spWeb();
getWeb.init();

//initiate mysql service
var sql = new mySQL();
sql.init();

sql.connect().then( connection => {
    sql.readData( connection ).then( result => {
        //console.dir(JSON.stringify(result));
        getWeb.getContext( config.spSite ).then( ctx => {
            let promises = [];
            let updateResults = [];
            for ( let item of result ) {
                let update = getWeb.updateExpirationDate( item.siteURL, item.listId, item.subscriptionId ).then( updateResult => {
                    //console.dir( JSON.stringify(updateResult) );
                    //console.log( item.siteURL );
                    updateResults.push(updateResult);
                }).catch( err => {
                    console.error( err );
                });
                promises.push(update);
            } //end for loop sharepoint updates
            //once all updates in SharePoint have been completed successfully, update the DB with the new values:
            Q.all(promises).then( results => {
                console.log("all promises resolved");
                console.log( JSON.stringify(updateResults) );
                sql.connect().then( connection => {
                    let dbPromises = [];
                    let dbUpdateResults = [];

                    for (let item of result) {
                        let dbUpdate = sql.updateExpiryDate( connection, item.listId, item.subscriptionId).then( dbUpdateResult => {
                            dbUpdateResults.push(dbUpdateResult);
                        }).catch( err => {
                            console.error( err );
                        });
                        dbPromises.push(dbUpdate);
                    } //end for loop db updates

                    //done updating DB, closing connection
                    Q.all(dbPromises).then( dbResults => {
                        console.log( JSON.stringify(dbUpdateResults) );
                        connection.end(
                            function (err) { 
                             if (err) {
                                 console.error(err);
                             } else {
                                 console.log("Executed webhook update function successfully!");
                             }
                         });
                    }).catch( err => {
                        console.error( err );
                        connection.end(
                            function (err) { 
                                if (err) {
                                    console.error(err);
                                }
                            });
                    });
                }).catch( err => {
                    console.error( err );
                });
            }).catch( err => {
                console.error( err );
            });
        }).catch( err => {
            console.error( err );
        });
    }).catch( err => {
        console.error( err );
    });
}).catch( err => {
    console.error( err );
});