var config = {}

config.spUserName = "<sp admin account here>";
config.spPassword = "<password here>";
config.spSite = "https://contoso.sharepoint.com";
config.daysBeforeExpiration = 10; //how many days before the expiration date should 
config.monthsToAddToExpiration = 5; //enter a value between 1 and 6
config.mysql = {
    host: 'hostname.mysql.database.azure.com',
    user: 'admin@host',
    password: '<password here>',
    database: '<db name>',
    port: 3306,
    ssl: true
};

module.exports = config;