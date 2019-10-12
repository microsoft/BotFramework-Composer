var __assign =
  (this && this.__assign) ||
  function() {
    __assign =
      Object.assign ||
      function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
import nanoid from 'nanoid/generate';
var initialDialogShape = {
  'Microsoft.OnConversationUpdateActivity': {
    $type: 'Microsoft.OnConversationUpdateActivity',
    constraint: "toLower(turn.Activity.membersAdded[0].name) != 'bot'",
  },
};
export var seedNewDialog = function($type, designerAttributes) {
  return __assign(
    { $designer: __assign({ id: nanoid('1234567890', 6) }, designerAttributes) },
    initialDialogShape[$type] || {}
  );
};
//# sourceMappingURL=dialogFactory.js.map
