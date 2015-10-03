///<reference path='../../typings/tsd.d.ts' />
module CodeEditorCtrl {
  'use strict';

  class CodeEditorCtrl {

    public static $inject = ['$scope', 'AceTsService'];

    constructor(
      private $scope:CodeEditor.ICodeEditorScope,
      private AceTsService:AceTsService.IAceTsService
      ) {

    }

    createExerciseDataLoader() {
      var selectQuestionMark = (editor:AceAjax.Editor) => {
        var range = editor.find("?");
        if(range && range.start.column > 0 && range.start.row > 0){
          editor.selection.addRange(range);
          editor.moveCursorTo(range.end.row, range.end.column);
        }
      };

      var processResults = (allEvents:Rx.Observable<Data.IStatus>) => {
        var successEvents = allEvents.filter(s => s.success);
        var errorEvents = allEvents.filter(s => !s.success);

        successEvents.forEach(s => {
          this.$scope.onSuccess()();
        });

        errorEvents.forEach(s => {
          this.$scope.onError()(s.errors);
        });
      };

      var isRun = () => {
        return this.$scope.onSuccess() || this.$scope.onError();
      };

      return (editor:AceAjax.Editor) => {
        var libs = <Function>this.$scope.libsLoader();
        this.AceTsService.addLibs(editor, libs());
        editor.setValue(this.$scope.initValue);
        editor.clearSelection();
        editor.focus();
        selectQuestionMark(editor);
        if(isRun()) {
          var allEvents = this.AceTsService.start(editor);
          processResults(allEvents);
        }
      };
    }
  }


  /**
  * @ngdoc object
  * @name exercise.controller:CodeEditorCtrl
  *
  * @description
  *
  */
  angular
    .module('exercise')
    .controller('CodeEditorCtrl', CodeEditorCtrl);
}