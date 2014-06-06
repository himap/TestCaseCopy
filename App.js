Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    // items: { html: '<a href="https://help.rallydev.com/apps/2.0rc3/doc/">App SDK 2.0rc3 Docs</a>'},
    items: [{
        xtype: 'rallytextfield',
        fieldLabel: 'Select the object to copy test cases from:'
    }],
    
    launch: function() {
        var button = Ext.create('Rally.ui.Button', {
            text: 'Choose Object',
            listeners: {
                click: this._launchChooser,
                scope: this
            }
        });
        
        var copybutton = Ext.create('Rally.ui.Button', {
            text: 'Copy',
            listeners: {
                click: this._copyTestCase,
                scope: this
            }
        });    
        
        this.add(button);
        this.add(copybutton);
    },
    
    _copyTestCase: function () {
        var rec = Rally.data.util.Record.copyRecord(this.selectedRecord);
    },
    
    _launchChooser: function() {
        console.log("My first App");
        
        Ext.create('Rally.ui.dialog.ChooserDialog', {
            artifactTypes: ['userstory', 'testfolder'],
            autoShow: true,
            // height: 400,
            title: 'Choose User Stories',
            listeners: {
                artifactChosen: function(selectedRecord) {
                    Ext.Msg.alert('Chooser', selectedRecord.get('Name') + ' was chosen');
                    console.log(selectedRecord.get('FormattedID'));
                    this.selectedRecord = selectedRecord;
                    var textfield = this.items.getAt(0);
                    textfield.setValue(selectedRecord.get('FormattedID'));
                },
                scope: this
            },
            storeConfig: {
                fetch: ['TestCases']
            }
        });
        
        // Ext.create('Rally.ui.')
        
        // Ext.create('Rally.ui.dialog.SolrArtifactChooserDialog', {
        //     artifactTypes: ['userstory', 'testfolder'],
        //     autoShow: true,
        //     height: 250,
        //     title: 'Choose User Stories',
        //     listeners: {
        //         artifactChosen: function(selectedRecord){
        //             Ext.Msg.alert('Chooser', selectedRecord.get('Name') + ' was chosen');
        //         },
        //         scope: this
        //     }
        //  });
    }
});
