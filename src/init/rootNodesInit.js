export var rootNodesInit;

rootNodesInit = function() {
    var t = rootNodesInit,
        appManager = t.appManager,
        requestManager = t.requestManager,

        path = appManager.getPath(),
        displayPropertyUrl = appManager.getDisplayPropertyUrl();

    return {
        baseUrl: path + '/api/organisationUnits.json',
        params: [
            'userDataViewFallback=true',
            'fields=id,' + displayPropertyUrl + ',children[id,' + displayPropertyUrl + ']',
            'paging=false'
        ],
        success: function(r) {
            appManager.addRootNodes(r.organisationUnits);
            requestManager.ok(this);
        }
    };
};
