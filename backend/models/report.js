export default class Report {
    constructor(id, razlog, productId, reporterId, reportedId, datum, status) {
        this.id = id;
        this.razlog = razlog;
        this.productId = productId; 
        this.reporterId = reporterId; 
        this.reportedId = reportedId; 
        this.datum = datum;
        this.status = status; 
    }
}