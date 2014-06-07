Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    // items: { html: '<a href="https://help.rallydev.com/apps/2.0rc3/doc/">App SDK 2.0rc3 Docs</a>'},
    items: [
        {
            xtype: 'rallytextfield',
            fieldLabel: 'Select the object to copy test cases from:'
        }
    ],

//?project=/project/403565371&projectScopeDown=true
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
                // parentingmodechanged: function(parentingEnabled) {
                //     debugger;
                //     this.setDisabled(!parentingEnabled);
                // },
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

        // debugger;
        record.set('WorkProduct', null);
        record.set('TestFolder', null);
        record.set('c_SignoffApprovaloftestcase', null);
        record.set('c_SignoffReviewofinitialtestresult', null);
        record.set('c_TestCaseActual', null);
        record.set('c_TestCaseToDo', null);

        // debugger;
        // record.set('Attachments', sourceTestCase.get('Attachments'));
        if (this.parentingEnabled) {
            if (this.selectedUSRecord) {
                record.set('WorkProduct', this.selectedUSRecord.data);
            }

            if (this.selectedTFRecord) {
                record.set('TestFolder', this.selectedTFRecord.data);
            }
        }
        // debugger;
        record.save().then({
            success: function(newTestCase) {
                console.log('Test copied: ', newTestCase.get('FormattedID'));
                debugger;
                results.splice(0, 1);
                this._copyTestCases(results);
            },
            failure: function() {
                console.log(arguments[0]);
                debugger;
            },
            scope: this
        });
    },

    _parentTestCases: function(newTestCases) {
        // get parents, then add test cases as children
        var testCaseStore = this.selectedUSRecord.getCollection('TestCases');

        testCaseStore.load().then({
            success: function(testCases) {
                // var deferred = Ext.create('Deft.Deferred');
                testCaseStore.add(newTestCases);
                testCaseStore.sync({
                    success: function() {
                        this._displayResults(testCases);
                        // deferred.resolve(copiedRecord);
                        // Rally.environment.getMessageBus().publish(Rally.Message.objectUpdate, config.record, ['TestCases'], this);
                    },
                    failure: function() {
                        debugger;
                    },
                    scope: this
                });
                // return deferred.promise;
            },
            failure: function() {
                debugger;
            },
            scope: this
        });

        // then this._displayResults(testCases)
    },

    _displayResults: function(testCases) {
        console.log(testCases);
    },

    // _copyTestCases: function() {
    //     var testCaseStore = this.selectedRecord.getCollection('TestCases', { fetch: true });
    //     // debugger;
    //     // testCaseStore.fetch.push('Attachments');
    //
    //     testCaseStore.load().then({
    //         success: this._createNewTestCases,
    //         scope: this
    //     });
    // },

    _launchSourceArtifactChooser: function() {
        Ext.create('Rally.ui.dialog.ChooserDialog', {
            artifactTypes: ['userstory', 'testfolder'],
            autoShow: true,
            // height: 400,
            title: 'Choose User Story or Test Folder',
            listeners: {
                artifactChosen: function(selectedRecord) {
                    // Ext.Msg.alert('Chooser', selectedRecord.get('Name') + ' was chosen');
                    // console.log(selectedRecord.get('FormattedID'));
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
            // height: 400,
            title: 'Choose User Story',
            listeners: {
                artifactChosen: function(selectedRecord) {
                    // Ext.Msg.alert('Chooser', selectedRecord.get('Name') + ' was chosen');
                    // console.log(selectedRecord.get('FormattedID'));
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
            // height: 400,
            title: 'Choose Test Folder',
            listeners: {
                artifactChosen: function(selectedRecord) {
                    // Ext.Msg.alert('Chooser', selectedRecord.get('Name') + ' was chosen');
                    // console.log(selectedRecord.get('FormattedID'));
                    this.selectedTFRecord = selectedRecord;
                },
                scope: this
            }
        });
    }
});
