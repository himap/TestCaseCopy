Ext.define('TestCaseCopyApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    width: 400,
    layout: {
        type: 'table',
        columns: 2
    },

    launch: function() {
        var sourceTextField = Ext.create('Rally.ui.TextField', {
            fieldLabel: 'Select the artifact to copy test cases from:',
            readOnly: true,
            listeners: {
                focus: this._launchSourceArtifactChooser,
                scope: this
            }
        });

        var sourceButton = Ext.create('Rally.ui.Button', {
            text: 'Choose source',
            listeners: {
                click: this._launchSourceArtifactChooser,
                scope: this
            }
        });

        var destUSButton = Ext.create('Rally.ui.Button', {
            text: 'Choose User Story',
            listeners: {
                click: this._launchDestUSChooser,
                scope: this
            }
        });

        var destTFButton = Ext.create('Rally.ui.Button', {
            text: 'Choose Test Folder',
            listeners: {
                click: this._launchDestTFChooser,
                scope: this
            }
        });

        var radioButton = Ext.create('Ext.form.RadioGroup', {
            xtype: 'radiogroup',
            fieldLabel: 'Do you want to associate new parent with the copy',
            colspan: 2,
            items: [
                { boxLabel: 'Yes', name: 'rb', inputValue: '1', checked: true },
                { boxLabel: 'No', name: 'rb', inputValue: '0'}
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
            colspan: 2,
            disabled: true,
            style: {
                'margin-top': '5px'
            },
            listeners: {
                click: this._loadTestCasesForCopy,
                scope: this
            }
        });

        var destinationUSTextField = Ext.create('Rally.ui.TextField', {
            fieldLabel: 'User Story to Copy to:',
            readOnly: true,
            listeners: {
                focus: this._launchDestUSChooser,
                scope: this
            }
        });

        var destinationTFTextField = Ext.create('Rally.ui.TextField', {
            fieldLabel: 'Test Folder to Copy to:',
            readOnly: true,
            listeners: {
                focus: this._launchDestTFChooser,
                scope: this
            }
        });

        this.add(sourceTextField);
        this.add(sourceButton);
        this.add(radioButton);
        this.add(destinationUSTextField);
        this.add(destUSButton);
        this.add(destinationTFTextField);
        this.add(destTFButton);
        this.add(copyButton);
    },

    _loadTestCasesForCopy: function() {
        this.setLoading(true);
        this.selectedRecord.getCollection('TestCases').load().then({
            success: function(results) {
                this.newTestCases = [];
                this._copyTestCases(results);
            },
            failure: function() {
                console.log('Error has occured');
            },
            scope: this
        });
    },

    _copyTestCases: function(results) {
        var sourceTestCase = results[0];

        sourceTestCase.getCollection('Attachments').load().then({
            success: function(attachments) {
                var record = Rally.data.util.Record.copyRecord(sourceTestCase);

                record.set('WorkProduct', null);
                record.set('TestFolder', null);
                record.set('c_SignoffApprovaloftestcase', null);
                record.set('c_SignoffReviewofinitialtestresult', null);
                record.set('c_TestCaseActual', null);
                record.set('c_TestCaseToDo', null);

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
                        this.newTestCases.push(newTestCase);

                        results.splice(0, 1);

                        if (results.length) {
                            this._copyTestCases(results);
                        } else {
                            this._displayNewTestCases();
                            this._resetApp();
                        }
                    },
                    failure: function() {
                        console.log('Error has occured');
                    },
                    scope: this
                });
            },
            failure: function() {
                console.log('Error has occured');
            },
            scope: this
        });

    },

    _displayNewTestCases: function() {
        var grid = Ext.create('Rally.ui.grid.Grid', {
            columnCfgs: [
                'FormattedID',
                'Name'
            ],
            showRowActionsColumn: false,
            colspan: 2,
            storeConfig: {
                model: 'TestCase',
                autoLoad: false
            }
        });

        _.each(this.newTestCases, function(testCase) {
            grid.store.add(testCase);
        });

        this.grid = grid;
        this.add(grid);
        this.setLoading(false);
    },

    _resetApp: function() {
        this.items.getAt(0).setValue('');
        this.items.getAt(2).setValue({ rb: '1' });
        this.items.getAt(3).setValue('');
        this.items.getAt(5).setValue('');
        this.items.getAt(7).disable();

        delete this.selectedRecord;
        delete this.selectedUSRecord;
        delete this.selectedTFRecord;
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

                    var copyButton = this.items.getAt(7);
                    copyButton.enable();
                    this.remove(this.grid);
                },
                scope: this
            },
            storeConfig: {
                fetch: ['TestCases']
            }
        });
    },

    _launchDestUSChooser: function() {
        if (!this.parentingEnabled) {
            return;
        }
        Ext.create('Rally.ui.dialog.ChooserDialog', {
            artifactTypes: ['userstory'],
            autoShow: true,
            title: 'Choose User Story',
            listeners: {
                artifactChosen: function(selectedRecord) {
                    this.selectedUSRecord = selectedRecord;

                    var textfield = this.items.getAt(3);
                    textfield.setValue(selectedRecord.get('FormattedID'));
                },
                scope: this
            }
        });
    },

    _launchDestTFChooser: function() {
        if (!this.parentingEnabled) {
            return;
        }
        Ext.create('Rally.ui.dialog.ChooserDialog', {
            artifactTypes: ['testfolder'],
            autoShow: true,
            title: 'Choose Test Folder',
            listeners: {
                artifactChosen: function(selectedRecord) {
                    this.selectedTFRecord = selectedRecord;

                    var textfield = this.items.getAt(5);
                    textfield.setValue(selectedRecord.get('FormattedID'));
                },
                scope: this
            }
        });
    }
});
