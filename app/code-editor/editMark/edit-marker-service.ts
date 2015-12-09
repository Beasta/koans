module codeEditor {
  'use strict';

  export class EditMarker {
    mark = "???";

    containsMark = (text:string):boolean => {
      if(text){
        return text.indexOf(this.mark) > -1;
      }else {
        return false;
      }
    };

    /*
    * Only mark is allowed to change.
    * Returns true, if no other text than the mark changes
    * */
    hasOnlyMarkChanged = (origText:string, changedText:string):boolean => {
      if(!this.containsMark(origText)){
        return true;
      }
      var splits = origText.split(this.mark);
      var rs = splits
        .map(this.escape)
        .join('[\\s\\S]+');

      var r = RegExp(rs);
      var matches = r.test(changedText);
      if(matches){
        var match = r.exec(changedText);
        return match[0] === changedText;
      }
      return false;
    };

    private escape = (s) => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  }

  /**
   * @ngdoc service
   * @name codeEditor.service:EditMarker
   *
   * @description
   *
   */
  angular
    .module('codeEditor')
    .service('EditMarker', EditMarker);
}