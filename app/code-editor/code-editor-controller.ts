module codeEditor {
  'use strict';

  export interface  ICodeEditorModel {
    editor:AceAjax.Editor;
    handleChange:Function;
    createExerciseDataLoader:Function;
  }

  class CodeEditorCtrl implements ICodeEditorModel {

    editor:AceAjax.Editor;

    public static $inject = ['$scope', 'AceTsService', 'EditMarker'];

    constructor(private $scope:ICodeEditorScope,
                private AceTsService:ts.IAceTsService,
                private editMarker:EditMarker) {

    }

    handleChange = () => {
      this.$scope.handleEditorChange(this.editor);
      this.selectEditMark();
    };

    selectEditMark = () => {
      var range = this.editor.find(this.editMarker.mark, {
        backwards: false,
        wrap: true,
        caseSensitive: false,
        wholeWord: false,
        regExp: false
      });
      if (range && range.start.column > 0 && range.start.row > 0) {
        this.editor.selection.addRange(range);
        this.editor.moveCursorTo(range.end.row, range.end.column);
        this.editor.focus();
      }
    };

    initProperties = () => {
      this.editor.$blockScrolling = Infinity;
      this.editor.setOptions({
        maxLines: Infinity,
      });

      this.editor.commands.addCommands([{
        name: "blur",
        bindKey: "Escape",
        exec: () => {this.editor.blur();}
      }]);
    };

    processResults = (allEvents:Rx.Observable<Data.IStatus>) => {
      var successEvents = allEvents.filter(s => s.success);
      var errorEvents = allEvents.filter(s => !s.success);

      if (this.isSuccessDefined()) {
        successEvents.forEach(s => {
          this.$scope.onSuccess()();
        });
      }

      errorEvents.forEach(s => {
        this.$scope.onError()(s.errors);
      });
    };

    isSuccessDefined = () => this.$scope.onSuccess && this.$scope.onSuccess();

    isRun = () => this.isSuccessDefined() || (this.$scope.onError && this.$scope.onError());

    createExerciseDataLoader() {
      return (editor:AceAjax.Editor) => {
        this.editor = editor;
        this.initProperties();
        var libs = <Function>this.$scope.libsLoader();
        this.AceTsService.addLibs(editor, libs());
        if (this.isRun()) {
          var allEvents = this.AceTsService.start(editor, this.$scope.origModel);
          this.processResults(allEvents);
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
    .module('codeEditor')
    .controller('CodeEditorCtrl', CodeEditorCtrl);
}
