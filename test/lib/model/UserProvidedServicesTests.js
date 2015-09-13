/*jslint node: true*/
/*global describe: true, before:true, it: true*/
"use strict";

var chai = require("chai"),
    expect = require("chai").expect;

var nconf = require('nconf');
nconf.argv().env().file({ file: 'config.json' });

var cf_api_url = nconf.get('CF_API_URL'),
    username = nconf.get('username'),
    password = nconf.get('password');

var CloudFoundry = require("../../../lib/model/CloudFoundry");
var CloudFoundrySpaces = require("../../../lib/model/Spaces");
var CloudFoundryUserProvidedServices = require("../../../lib/model/UserProvidedServices");
CloudFoundry = new CloudFoundry(cf_api_url);
CloudFoundrySpaces = new CloudFoundrySpaces(cf_api_url);
CloudFoundryUserProvidedServices = new CloudFoundryUserProvidedServices(cf_api_url);

describe("Cloud foundry User Provided Services", function () {

    var token_endpoint = null;
    var token_type = null;
    var access_token = null;
    var space_guid = null;

    before(function () {
        this.timeout(10000);

        return CloudFoundry.getInfo().then(function (result) {
            token_endpoint = result.token_endpoint;
            return CloudFoundry.login(token_endpoint, username, password);
        }).then(function (result) {
            token_type = result.token_type;
            access_token = result.access_token;
            return CloudFoundrySpaces.getSpaces(token_type, access_token);
        }).then(function (result) {
            space_guid = result.resources[0].metadata.guid;
        });

    });

    it("The platform returns a list of User Provided Services", function () {
        this.timeout(3000);

        return CloudFoundryUserProvidedServices.getServices(token_type, access_token).then(function (result) {
            //console.log(result.resources);
            expect(result.total_results).is.a("number");
        });
    });

    it("The platform returns the first User Provided Service", function () {
        this.timeout(3000);

        var service_guid = null;

        return CloudFoundryUserProvidedServices.getServices(token_type, access_token).then(function (result) {
            service_guid = result.resources[0].metadata.guid;
            return CloudFoundryUserProvidedServices.getService(token_type, access_token, service_guid);
        }).then(function (result) {
            expect(result.metadata.guid).is.a("string");
        });
    });

    it.skip("Create an User Provided Service", function () {
        this.timeout(3000);

        var service_guid = null;
        var credentials = {
            demo : "demo",
            demo2 : "demo2"
        };

        return CloudFoundryUserProvidedServices.create(token_type, access_token, "demo", space_guid, credentials).then(function (result) {
            //console.log(result);
            expect(result.metadata.guid).is.a("string");
        });
    });

    //TODO: Create this tests in a dynamic way.
    it.skip("Delete an User Provided Service", function () {
        this.timeout(3000);

        var service_guid = "df9757f9-6a44-40fc-92a5-4a40ba0e0113";

        return CloudFoundryUserProvidedServices.delete(token_type, access_token, service_guid).then(function (result) {
            expect(true).to.equal(true);
        });
    });

});