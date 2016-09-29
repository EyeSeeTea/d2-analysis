import {DateManager} from '../manager/DateManager.js';
import {InterpretationWindow} from './InterpretationWindow.js';
import {SharingWindow} from './SharingWindow.js';
import {RenameWindow} from './RenameWindow.js';

export var EastRegion;

EastRegion = function(c){
	
	var t = this,
		uiManager = c.uiManager,
		uiConfig = c.uiConfig,
		instanceManager = c.instanceManager,
		appManager = c.appManager,
		i18nManager = c.i18nManager,
		i18n = i18nManager.get();
	
	var descriptionMaxNumberCharacter = 200;
	
	/*
	 * FAVORITE DETAILS PANEL
	 */ 
	    
	var getDetailsPanelItems = function(layout){
		// Favorite loaded ->  Add favorite detail panel and update
		// Otherwise -> Display No Favorite Panel
		var detailsPanelItems;
		if (instanceManager.isStateFavorite() && !instanceManager.isStateDirty()){

			 // Create Description Panel from description field
	        var getDescriptionPanel = function(description){
	        	var descriptionItems = [];
	        	if (description == undefined){description = 'No description';}
	        	var isLongDescription = (description.length > descriptionMaxNumberCharacter);
	        	
	        	// Description label
	        	descriptionItems.push({
	                xtype: 'label',
	                itemId: 'descriptionLabel',
	                html: (isLongDescription)?description.substring(0,descriptionMaxNumberCharacter):description,
	                cls: 'interpretationActions'
	            });
	        	
	        	// Longer than 200 characters -> Create More/Less link
	        	if (isLongDescription){
	        		var longDescription = description;
	                var shortDescription = description.substring(0, descriptionMaxNumberCharacter);
	        		
	            	descriptionItems.push({
	                    xtype: 'label',
	                    html: '[<span class="link">more</span>]',
	                    moreText: '[<span class="link">more</span>]',
	                    lessText: '[<span class="link">less</span>]',
	                    cls: 'interpretationActions',
	                    isShortDescriptionDisplayed: true,
	                    style: 'margin: 0px 3px;',
	                    listeners: {
	        	        	'render': function(label) {
	        	        		label.getEl().on('click', function(){
	        	        			if (this.isShortDescriptionDisplayed){this.up('#descriptionPanel').down('#descriptionLabel').setText(longDescription,false); this.setText(this.lessText,false)}
	        	        			else{this.up('#descriptionPanel').down('#descriptionLabel').setText(shortDescription,false); this.setText(this.moreText,false)}
	        	        			this.isShortDescriptionDisplayed = !this.isShortDescriptionDisplayed;
	        	        			this.up('#descriptionPanel').doLayout();
	        	        			}, label);
	    	        	    }
	        	        }
	                });
	        	}
	        	
	        	// Change Link
	        	descriptionItems.push({
	                xtype: 'label',
	                html: '[<span style="cursor:pointer;color:#3162C5;">change</span>]',
	                cls: 'interpretationActions',
	                style: 'margin: 0px 3px;',
	                listeners: {
	    	        	'render': function(label) {
	    	        		label.getEl().on('click', function(){RenameWindow(c, instanceManager.getStateFavorite()).show();}, label);
		        	    }
	    	        }
	            });
	        	
	        	return descriptionItems;
	        };
	        
	        // Create Sharing setting text from publicAccess and userGroupAccesses field
	        var getSharingText = function(layout){
	        	// Public permissions
	        	var sharingText = 'Public: ';
	        	if (layout.publicAccess == "r-------"){
	        		sharingText += 'Read';
	        	}
	        	else if (layout.publicAccess == "rw------"){
	        		sharingText += 'Read/Write';
	        	}
	        	else{
	        		sharingText += 'None';
	        	}
	        	
	        	// User Group Accesses permissions
	        	// TODO: Create a tooltip
	        	if (layout.userGroupAccesses != undefined){ 
	            	sharingText += ' + ';
	            	if (layout.userGroupAccesses.length > 2){
	            		sharingText += layout.userGroupAccesses.length + ' groups';
	            	}
	            	else{
	            		for (var i = 0; i < layout.userGroupAccesses.length; i++){
	            			if (i > 0){sharingText += ', '}
	            			sharingText += 'Group ' + layout.userGroupAccesses[i].displayName ;
	            		}
	            	}
	        	}
	        	return sharingText;
	        };
	        
	        // Get Number of Views from analytics api and update label
	        var setNumberOfViews = function(label, favoritesId){
	        	Ext.Ajax.request({
	                url: encodeURI(appManager.getPath() + '/api/dataStatistics/favorites/' + favoritesId + '.json'), 
	                method: 'GET',
	                scope: this,
	                success: function(r) {
	                	label.setValue(Ext.decode(r.responseText).views);
	                }
	            });
	        	return "Retrieving number of views...";
	        }
			
			// Favorite Details Panel content when favorite loaded    
	        detailsPanelItems = [
				{
				    xtype: 'panel',
				    itemId: 'descriptionPanel',
				    bodyStyle: 'border-style:none;',
				    style: 'margin-bottom:5px;',
				    items:[getDescriptionPanel(layout.displayDescription)]
				},
				{
		            xtype: 'displayfield',
		            fieldLabel: 'Owner',
		            itemId: 'owner',
		            value: (layout.user != undefined)?layout.user.displayName:'',
		            cls: 'interpretationDetailsField'
		        },
				{
		            xtype: 'displayfield',
		            itemId: 'created',
		            fieldLabel: 'Created',
		            value: layout.created,
		            cls: 'interpretationDetailsField'
		        },
				{
		            xtype: 'displayfield',
		            itemId: 'lastUpdated',
		            fieldLabel: 'Last Updated',
		            value: layout.lastUpdated,
		            cls: 'interpretationDetailsField',
		        },
		        {
		            xtype: 'displayfield',
		            itemId: 'numberViews',
		            fieldLabel: 'Number of views',
		            value: "Retrieving number of views...",
		            cls: 'interpretationDetailsField',
		            listeners: {
	    	        	'render': function(label) {
	    	        		setNumberOfViews(label, layout.id);
		        	    }
	    	        }
		        },
				{
		            xtype: 'displayfield',
		            itemId: 'sharing',
		            fieldLabel: 'Sharing [<span style="cursor:pointer;color:#3162C5;">change</span>]',
		            value: getSharingText(layout),
		            cls: 'interpretationDetailsField',
	    	        listeners: {
	    	        	'render': function(label) {
	    	        		label.getEl().on('click', function(){instanceManager.getSharingById(instanceManager.getStateFavoriteId(), function(r) {SharingWindow(c, r).show();});}, label);
		        	    }
	    	        }
		        }
	        ];
		}
		else{
			// Favorite Details Panel content when no favorite is loaded
			detailsPanelItems = [{
	            xtype: 'label',
	            text: 'No current favorite',
	            cls: 'interpretationActions'
	        }];
		}
		
		return {
	        xtype: 'panel',
	        bodyStyle: 'border-style:none',
	        style: 'padding:10px',
	        itemId: 'noFavoriteDetailsPanel',
	        items: [detailsPanelItems]
		};
	}
	
	// Main Details Panel Container
	var detailsPanel = {
        xtype: 'panel',
        title: '<div class="ns-panel-title-details">Details</div>',
        itemId: 'detailsPanel',
        
        addAndUpdateFavoritePanel: function(layout){
    		// Remove any previous panel
    		this.removeAll(true);

    		this.add(getDetailsPanelItems(layout));
    	},
    	
        // By default no favorite details panel is displayed
        items: getDetailsPanelItems()
    };
	
	/*
	 * INTERPRETATIONS PANEL
	 */ 
	
	// Create interpretation panel depending on interpretation
	var getInterpretationPanel = function(interpretation) {
		
		// Create inner comments panel depending on comments
		var getCommentsPanel = function (comments){
			var commentsPanel = [];
			for (var i=0; i < comments.length; i++){
				var comment = comments[i];
				
				commentsPanel.push({
	                xtype: 'panel',
	                bodyStyle: 'border-style:none;',
	                cls: 'comment greyBackground',
	                layout: 'column',
	                items: [
							{
								xtype: 'panel',
								bodyStyle: 'border-style:none',
								items: [
										{
										    xtype: 'label',
										    cls: 'avatar',
										    text: comment.user.displayName.split(' ')[0][0] + comment.user.displayName.split(' ')[comment.user.displayName.split(' ').length -1][0]
										}
								],
								columnWidth: 0.20
							},
							{
								xtype: 'panel',
								bodyStyle: 'border-style:none',
								items: [
								        {
											xtype: 'panel',
											bodyStyle: 'border-style:none',
											items: [
											        {
													    xtype: 'label',
													    html: '<a href=\"' + appManager.getPath() + '/dhis-web-dashboard-integration/profile.action?id=' + comment.user.id + '\">' + comment.user.displayName + '<a>',
													    cls: 'link bold',
													    style: 'margin-right:10px;' 
													},
													{
													    xtype: 'label',
													    text: comment.text,
													}
											]
								        },
										{
										    xtype: 'label',
										    text: DateManager.getTimeDifference(comment.lastUpdated),
										} 
								],
								columnWidth: 0.80
							}
	                ]
	            });
	    	}
			
			commentsPanel.push({
                xtype: 'panel',
                bodyStyle: 'border-style:none',
                layout: 'column',
                style: 'margin-bottom: 5px;',
                
                items: [
						{
							xtype: 'panel',
							bodyStyle: 'border-style:none',
							items: [
									{
									    xtype: 'label',
									    cls: 'avatar',
									    text: appManager.userAccount.firstName[0] + appManager.userAccount.surname.split(' ')[appManager.userAccount.surname.split(' ').length -1][0]
									}
							],
							columnWidth: 0.20
						},
						{
							xtype: 'panel',
							bodyStyle: 'border-style:none',
							autoWidth: true,
							layout   : 'fit',
							flex     : 1,
							items: [
							        {
										xtype: 'textarea',
										itemId: 'commentArea',
										emptyText: 'Write a comment',
										submitEmptyText: false,
						                flex: 1,
						                border: 0,
										enableKeyEvents: true,
										listeners: {
											keypress: function (f,e) {    
							                     if (e.getKey() == e.ENTER && !e.shiftKey) {
							                    	 commentInterpretation(f);
							                    }
							                }
			    	        	        }
							        } 
							],
							columnWidth: 0.80
						}
                ]
            });
			return commentsPanel;
		};
		
		// User has liked this interpretation -> true
		// Otherwise -> false
		var isLiked = function(interpretation){
			var userId = appManager.userAccount.id
			for (var i = 0; i < interpretation.likedBy.length; i++){
        		if (interpretation.likedBy[i].id == userId){
        			return true;
        		}
        	}
			return false;
		};
        
		// Call Like or Unlike interpretation, update data model and update/reload panel
        var likeUnlikeInterpretation = function(){
        	var that = this;
			if (isLiked(interpretation)){
				Ext.Ajax.request({
	                url: encodeURI(appManager.getPath() + '/api/interpretations/' + interpretation.id + '/like'),
	                method: 'DELETE',
	                success: function() {
	                	// Updating date model
	                	interpretation.likes--;
	                	for (var i = 0; i < interpretation.likedBy.length; i++){
	                		if (interpretation.likedBy[i].id == appManager.userAccount.id){
	                			interpretation.likedBy.pop(i)
	                			break;
	                		}
	                	}
	                	
	                	// Refreshing interpretation panel
	                	that.up('#interpretationPanel' + interpretation.id).updateInterpretationPanelItems(interpretation);
	                }
	            });
			}
			else{
	        	Ext.Ajax.request({
	                url: encodeURI(appManager.getPath() + '/api/interpretations/' + interpretation.id + '/like'),
	                method: 'POST',
	                success: function() {
	                	// Updating date model
	                	interpretation.likes++;
	                	interpretation.likedBy.push({id: appManager.userAccount.id, displayName: appManager.userAccount.firstName + ' ' + appManager.userAccount.surname});
	                	
	                	// Refreshing interpretation panel
	                	that.up('#interpretationPanel' + interpretation.id).updateInterpretationPanelItems(interpretation);
	                }
	            });
			}
        };
        
        // Call comment interpretation, update data model and update/reload panel
        var commentInterpretation = function(f){
        	if (f.getValue().trim() != ''){
        		Ext.Ajax.request({
	                url: encodeURI(appManager.getPath() + '/api/interpretations/' + interpretation.id + '/comments'),
	                method: 'POST',
	                params: f.getValue(),
	                headers: {'Content-Type': 'text/plain'},
	                success: function(obj, _success, r) {
	                	// Updating data model
	                	var currentComment = {}
	                	currentComment['user'] = {}
	                	currentComment['user']['displayName'] = appManager.userAccount.firstName + ' ' + appManager.userAccount.surname
	                	currentComment['lastUpdated'] = new Date();
	                	currentComment['text'] = f.getValue();
	                	interpretation.comments.push(currentComment)
	                	
	                	// Clear up comment textarea
	                	f.reset();
	                	
	                	// Refreshing interpretation panel
	                	f.up('#interpretationPanel' + interpretation.id).updateInterpretationPanelItems(interpretation);
	                }
	            });
        	}
        };
        
        // Create tooltip for Like link
        var getTooltipLike = function(){
        	var toolTipLike = "";
        	for (var i = 0; i < interpretation.likedBy.length; i++){
        		toolTipLike += interpretation.likedBy[i].displayName + "</br>";
        	}
        	return toolTipLike;
        };
        
        // Get inner items for interpretation panel. 
        var getInterpretationPanelItems = function(interpretation, displayingComments){

			var interpretationPanelItems = [
					{
				    xtype: 'panel',
				    bodyStyle: 'border-style:none',
				    style: 'margin-bottom: 5px;',
				    items: [
						{
						    xtype: 'label',
						    html: '<a href=\"' + appManager.getPath() + '/dhis-web-dashboard-integration/profile.action?id=' + interpretation.user.id + '\">' + interpretation.user.displayName + '<a>',
						    style: 'margin-right:10px;font-weight:bold;color:#3162C5;' 
						},
						{
						    xtype: 'label',
						    text: DateManager.getYYYYMMDD(interpretation.lastUpdated, true),
						}
				    ]
				},
				{
				    xtype: 'panel',
				    bodyStyle: 'border-style:none',
				    style: 'margin-bottom: 10px;',
				    items: [
						{
                            xtype: 'label',
                            text: interpretation.text,
                        }
				    ]
				},
				{
				    xtype: 'panel',
				    bodyStyle: 'border-style:none',
				    cls: 'likeContainer',
				    itemId: 'likePanelUnselected',
				    hidden: displayingComments,
				    items: [
						{
                            xtype: 'label',
                            html: "<div class='thumbs_up greyBackground'>" + interpretation.likes + " people like this. " + interpretation.comments.length + " people commented.</div>",
                        }
				    ]
				},
				{
				    xtype: 'panel',
				    bodyStyle: 'border-style:none',
				    style: 'margin-bottom: 5px;',
				    itemId: 'likePanelSelected',
				    hidden: !displayingComments,
                    
				    items: [
						{
						    xtype: 'panel',
						    bodyStyle: 'border-style:none',
						    style: 'margin-bottom: 5px;',
						    items: [
								{
						            xtype: 'label',
						            text: isLiked(interpretation)?"Unlike":"Like",
						            style: 'margin-right: 5px;cursor:pointer;color:#3162C5;font-weight: bold;',
				                    
						            listeners: {
		    	        	        	'render': function(label) {
		    	        	        	       label.getEl().on('click', likeUnlikeInterpretation, this);
		    	        	        	       
		    	        	        	       if (interpretation.likedBy.length > 0){
		    	        	        	    	   Ext.create('Ext.tip.ToolTip', {
			    	        	        	           target: label.getEl(),
			    	        	        	           html: getTooltipLike(),
			    	        	        	           bodyStyle: 'background-color: white;border' 
			    	        	        	         });   
		    	        	        	    	   
		    	        	        	       }
		    	        	        	    }
		    	        	        }
						        },
						        {
						            xtype: 'label',
						            text: '|',
						            style: 'margin-right: 5px;'
						        },
						        {
						            xtype: 'label',
						            text: 'Comment',
						            style: 'margin-right: 5px;cursor:pointer;color:#3162C5;font-weight: bold;',
				                    
						            listeners: {
		    	        	        	'render': function(label) {
		    	        	        	       label.getEl().on('click', function(){this.up('#interpretationPanel' + interpretation.id).down('#commentArea').focus();}, this);
	    	        	        	    }
		    	        	        }
						        }
						    ]
						},
						{
						    xtype: 'panel',
						    bodyStyle: 'border-style:none',
						    cls: 'likeContainer',
						    items: [
								{
						            xtype: 'label',
						            html: "<div class='thumbs_up greyBackground'><span style='cursor:pointer;color:#3162C5;font-weight: bold;'>" + interpretation.likes + " people</span> like this</div>",
						            listeners: {
		    	        	        	'render': function(label) {
		    	        	        	       
		    	        	        	       if (interpretation.likedBy.length > 0){
		    	        	        	    	   Ext.create('Ext.tip.ToolTip', {
			    	        	        	           target: label.getEl(),
			    	        	        	           html: getTooltipLike(),
			    	        	        	           bodyStyle: 'background-color: white;border' 
			    	        	        	         });   
		    	        	        	    	   
		    	        	        	       }
		    	        	        	    }
		    	        	        }
						        }
						    ]
						}
				    ]
				},
                {
                	xtype: 'panel',
                	hidden: !displayingComments,
                	bodyStyle: 'border-style:none',
                	itemId: 'comments',
                	items: [getCommentsPanel(interpretation.comments)]
                }
			]	
			return interpretationPanelItems;
        }
        
        // Interpretation panel per single interpretation
		var interpretationPanel = {
            xtype: 'panel',
            bodyStyle: 'border-style:none;',
            style: 'padding:10px;',
            cls: 'clickable',
            instanceManager: instanceManager,
            interpretation: interpretation,
            displayingComments: false,
            itemId: 'interpretationPanel' + interpretation.id,
            
            // Update inner interpretation panel items depending on interpretation. If none is provided, previously store one will be used
            updateInterpretationPanelItems: function(interpretation){
            	if (interpretation != undefined){
            		this.interpretation = interpretation;
            	}
            	this.removeAll(true);
            	this.add(getInterpretationPanelItems(this.interpretation, this.displayingComments));
            	
            	// Remove pointer effect. This is not clickable any more
            	if (this.displayingComments){
            		this.removeCls('clickable');
            	}
            	else{
            		this.addCls('clickable');
            	}
            },
            
            // Expand comments on click
            expandComments: function(){
            	if(!this.displayingComments){
            		for (var i = 0; i < this.up("#interpretationsPanel").items.items.length; i++){
            			if (this.up("#interpretationsPanel").items.items[i].interpretation != undefined){
            				this.up("#interpretationsPanel").items.items[i].displayingComments = (this.up("#interpretationsPanel").items.items[i].id == this.id);
            				this.up("#interpretationsPanel").items.items[i].updateInterpretationPanelItems();	
            			}
            		}
            		
            		// Swop top panel
                	this.up("[xtype='panel']").down('#shareInterpretation').hide();
                	this.up("[xtype='panel']").down('#backToToday').show();

                	// Update canvas with favorite as it was by the time the interpretation was created
            		instanceManager.updateInterpretationFunction(interpretation);
                	uiManager.get('northRegion').cmp.title.setTitle(uiManager.get('northRegion').cmp.title.titleText + ' [' + DateManager.getYYYYMMDD(this.interpretation.created, true) + ']')
            	}
            },
                        
            items: getInterpretationPanelItems(interpretation, this.displayingComments),
	        
	        listeners: {
	        	'render': function(panel) {panel.body.on('click', this.expandComments, this, {single: true});}, scope:interpretationPanel
	        }
        };
		return interpretationPanel;
	}
	
	
	var getTopInterpretationsPanel = function (interpretations, displayingInterpretation){
    	var topInterpretationPanelItems = [];
    	
    	var shareInterpretationPanel = {
            xtype: 'panel',
            bodyStyle: 'border-style:none',
            style: 'padding:10px;border-width:0px 0px 1px;border-style:solid;',
            hidden: displayingInterpretation,
            itemId: 'shareInterpretation',
            items: [{
                xtype: 'label',
                html: 'Share interpretation',
                cls: 'interpretationActions',
                style: 'cursor:pointer;color:#3162C5;',
    	        listeners: { 
    	        	'render': function(label) {
    	        	       label.getEl().on('click', function(){instanceManager.getSharingById(instanceManager.getStateFavoriteId(), function(r) {InterpretationWindow(c, r).show();});}, label);
    	        	    }
    	        }
            }]
        };
    	
    	var noInterpretationsPanel = {
            xtype: 'panel',
            bodyStyle: 'border-style:none',
            style: 'padding:10px;border-width:0px 0px 1px;border-style:solid;',
            items: [{
    	        xtype: 'label',
    	        text: 'No interpretations',
    	        cls: 'interpretationActions'
    	    }]
        };
    	
    	var backToTodayPanel = {
            xtype: 'panel',
            bodyStyle: 'border-style:none',
            style: 'padding:10px;border-width:0px 0px 1px;border-style:solid;',
            hidden: !displayingInterpretation,
            itemId: 'backToToday',
            items: [{
			    xtype: 'label',
			    html: '<< Back to today',
			    cls: 'interpretationActions link',
			    listeners: {
			    	'render': function(label) {
			    	       label.getEl().on('click', function(){instanceManager.getById(instanceManager.getStateCurrent().id);}, label);
			    	    }
			    }
			}]
        };
    	
    	if (instanceManager.isStateFavorite() && !instanceManager.isStateDirty()){
	    	// Interpretations Panel when no favorite is loaded
			topInterpretationPanelItems.push(shareInterpretationPanel);
	    	
	    	if (interpretations == undefined){
	    		// Interpretations Panel when no favorite is loaded
	    		topInterpretationPanelItems.push(noInterpretationsPanel);
	    	}
	    	else{
	    		topInterpretationPanelItems.push(backToTodayPanel);
	    	}
    	}
    	else{
    		topInterpretationPanelItems.push(noInterpretationsPanel);
    	}
    	
    	// Add Share/Back to Today Panel.
    	// If displayingInterpretation on canvas -> Back to Today
    	// Otherwise -> Share Interpretation
    	var topInterpretationPanel = {
            xtype: 'panel',
            bodyStyle: 'border-style:none',
            style: 'border-width:0px 0px 1px;border-style:solid;',
            items: topInterpretationPanelItems
        };
        
        return topInterpretationPanel;
    };
	
	// Main Interpretations Panel Container
    var interpretationsPanel = {
        xtype: 'panel',
        title: '<div class="ns-panel-title-interpretation">Interpretations</div>',
        itemId: 'interpretationsPanel',
        displayingInterpretation: false,
        
        getInterpretationPanel: getInterpretationPanel,
        getTopInterpretationsPanel: getTopInterpretationsPanel,
        
        addAndUpdateInterpretationsPanel: function(interpretations){
	    	// Remove any previous panel
        	this.removeAll(true);
        	
        	//Get top interpretations panel depending on interpretations and if we are displaying an interpretation
        	this.add(this.getTopInterpretationsPanel(interpretations));
        	
        	// Add an interpretation panel per interpretation
	    	if (interpretations != undefined && interpretations.length > 0){
	        	for (var i=0; i < interpretations.length; i++){
	        		this.add(this.getInterpretationPanel(interpretations[i]));
	        	}
	    	}
        },
        
        // By default no interpretations panel is displayed
        items: getTopInterpretationsPanel()
    };
	
	/*
	 * RIGHT PANEL CONTAINER
	 */ 
	return Ext.create('Ext.panel.Panel', {
	    region: 'east',
	    border: false,
	    width: uiConfig.west_width + uiManager.getScrollbarSize().width,
	    items: [detailsPanel, interpretationsPanel],
	    cls: 'eastPanel',
	    setState: function(layout) {

	    	this.getComponent('detailsPanel').addAndUpdateFavoritePanel(layout);
	    	
	    	// Favorite loaded with interpretations ->  Add interpretation panel and update
    		this.getComponent('interpretationsPanel').addAndUpdateInterpretationsPanel(layout.interpretations);
	    }
	});
}; 
    
    