let mongoose = require('mongoose');
let Schema = mongoose.Schema;

const detailSchema = new Schema( {
	client_id : {
		type : mongoose.Schema.Types.ObjectID,
		ref : "Client"
	},
	CFDocumentName : String,
	CF:String,
	POODocumentName : String,
	POO:String,
	POBIEDocumentName : String,
	POBIE:String,
	POBIECertificateNumber : Number,
	POIBODocumentName : String,
	POIBO:String,
	POIBOCertificateNumber : Number,
	POABODocumentName : String,
	POABO:String,
	POABOCertificateNumber : Number,
	GSTDocumentName : String,
	GSTCertificate : String,
	GSTCertificateNumber : Number,
	added_date:{
		type: Date,
		default: Date.now
	}
})
const Detail = mongoose.model('Detail', detailSchema);

module.exports = Detail;