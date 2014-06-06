Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    items:{ html:'<a href="https://help.rallydev.com/apps/2.0rc3/doc/">App SDK 2.0rc3 Docs</a>'},
    launch: function() {
        console.log("My first App");
        Ext.create('Rally.ui.dialog.ChooserDialog', {
            artifactTypes: ['userstory','testfolder'],
            autoShow: true,
            height: 250,
            title: 'Choose User Stories',
            listeners: {
                artifactChosen: function(selectedRecord){
                    Ext.Msg.alert('Chooser', selectedRecord.get('Name') + ' was chosen');
                },
                scope: this
            }
        });
    }
});
