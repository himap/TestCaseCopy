Ext.define('TestCaseCopyApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    items: [
        {
            xtype: 'rallytextfield',
            fieldLabel: 'Select the object to copy test cases from:'
        }
    ],

    launch: function() {
        var sourceButton = Ext.create('Rally.ui.Button', {
            text: 'Choose Object',
            listeners: {
                click: this._launchSourceArtifactChooser,
                scope: this
            }
        });

        var destUSButton = Ext.create('Rally.ui.Button', {
            text: 'Choose User Story',
            disabled: true,
            listeners: {
                click: this._launchDestUSChooser,
                scope: this
            }
        });

        var destTFButton = Ext.create('Rally.ui.Button', {
            text: 'Choose Test Folder',
            disabled: true,
            listeners: {
                click: this._launchDestTFChooser,
                scope: this
            }
        });

        var radioButton = Ext.create('Ext.form.RadioGroup', {
            xtype: 'radiogroup',
            fieldLabel: 'Do you want to associate new parent with the copy',
            items: [
                { boxLabel: 'Yes', name: 'rb', inputValue: '1' },
                { boxLabel: 'No', name: 'rb', inputValue: '0', checked: true}
            ],
            listeners: {
                change: function(component, newValue) {
                    this.parentingEnabled = newValue.rb === '1';

                    destUSButton.setDisabled(!this.parentingEnabled);
                    destTFButton.setDisabled(!this.parentingEnabled);
                },
                scope: this
            }
        });

        var copyButton = Ext.create('Rally.ui.Button', {
            text: 'Copy',
            listeners: {
                click: this._loadTestCasesForCopy,
                scope: this
            }
        });

        this.add(sourceButton);
        this.add(radioButton);
        this.add(destUSButton);
        this.add(destTFButton);
        this.add(copyButton);
    },

    _loadTestCasesForCopy: function() {
        this.selectedRecord.getCollection('TestCases').load().then({
            success: function(results) {
                this._copyTestCases(results);
            },
            failure: function() {
                debugger;
            },
            scope: this
        });
    },

    _copyTestCases: function(results) {
        var sourceTestCase = results[0];
        var record = Rally.data.util.Record.copyRecord(sourceTestCase);

        record.set('WorkProduct', null);
        record.set('TestFolder', null);
        record.set('c_SignoffApprovaloftestcase', null);
        record.set('c_SignoffReviewofinitialtestresult', null);
        record.set('c_TestCaseActual', null);
        record.set('c_TestCaseToDo', null);

        // record.set('Attachments', sourceTestCase.get('Attachments'));
        if (this.parentingEnabled) {
            if (this.selectedUSRecord) {
                record.set('WorkProduct', this.selectedUSRecord.data);
            }

            if (this.selectedTFRecord) {
                record.set('TestFolder', this.selectedTFRecord.data);
            }
        }

        record.save().then({
            success: function(newTestCase) {
                console.log('Test copied: ', newTestCase.get('FormattedID'));

                results.splice(0, 1);
                this._copyTestCases(results);
            },
            failure: function() {
                debugger;
            },
            scope: this
        });
    },

    _launchSourceArtifactChooser: function() {
        Ext.create('Rally.ui.dialog.ChooserDialog', {
            artifactTypes: ['userstory', 'testfolder'],
            autoShow: true,
            title: 'Choose User Story or Test Folder',
            listeners: {
                artifactChosen: function(selectedRecord) {
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
    },

    _launchDestUSChooser: function() {
        Ext.create('Rally.ui.dialog.ChooserDialog', {
            artifactTypes: ['userstory'],
            autoShow: true,
            title: 'Choose User Story',
            listeners: {
                artifactChosen: function(selectedRecord) {
                    this.selectedUSRecord = selectedRecord;
                },
                scope: this
            }
        });
    },

    _launchDestTFChooser: function() {
        Ext.create('Rally.ui.dialog.ChooserDialog', {
            artifactTypes: ['testfolder'],
            autoShow: true,
            title: 'Choose Test Folder',
            listeners: {
                artifactChosen: function(selectedRecord) {
                    this.selectedTFRecord = selectedRecord;
                },
                scope: this
            }
        });
    }
});
