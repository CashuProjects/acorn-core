const sqlite3 = require('sqlite3').verbose();

class Database {
    constructor(path = 'acorn.db') {
        this.db = new sqlite3.Database(path);
        db.on('error', (err)=>{
            console.err(err)
            // Todo: log
        })
    }

    get_db() {
        return this.db
    }
}

exports.Database = Database