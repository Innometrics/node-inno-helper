var InnoHelper = require('./index').InnoHelper;
var Profile = require('./index').Profile;

var inno = new InnoHelper();
console.log(inno.getCollectApp());

var attribute = new Profile.Attribute();
console.log(attribute.getName());