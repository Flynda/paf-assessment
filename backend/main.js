require('dotenv').config()

const morgan = require('morgan')
const express = require('express')
const mysql = require('mysql2/promise')
const sha1 = require ('sha1')
const { MongoClient } = require('mongodb')
const AWS = require('aws-sdk')
const { json } = require('express')
const multer = require('multer')
const fs = require('fs')

const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000

const SQL_checkPassword = `SELECT password FROM user WHERE user_id = ?`

const pool = mysql.createPool({
	host: process.env.SQL_DB_SERVER || 'localhost',
	port: process.env.SQL_DB_PORT || 3306,
	user: process.env.SQL_DB_USER,
	password: process.env.SQL_DB_PASSWORD,
	database: process.env.SQL_DB_SCHEMA,
	connectionLimit: process.env.SQL_CON_LIMIT,
	timezone: '+08:00'
})

const mkQuery = (sqlStatement, pool) => {
	return async (params) => {
		const conn = await pool.getConnection()
		try {
			let results = await conn.query(sqlStatement, params || [])
			return results
		} catch (error) {
			console.error('SQL Query error: ', error);
		} finally {
			conn.release()
		}
	}
}

const MONGO_URL = 'mongodb://localhost:27017'
const MONGO_DB = 'share'
const MONGO_COLLECTION = 'share'
const client = new MongoClient(MONGO_URL, { 
	useNewUrlParser: true, useUnifiedTopology: true 
})

const s3 = new AWS.S3({
    endpoint: new AWS.Endpoint(process.env.S3_HOSTNAME),
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
})

const upload = multer({
    dest: process.env.TMP_DIR || '/temp/uploads'
})

const app = express()

const checkPassword = mkQuery(SQL_checkPassword, pool)

const authenticate = async (user, pw, resp) => {
	const pwFromDB = await checkPassword([user])
	if (!pwFromDB[0].length) {
		resp.status(401)
		resp.json({errorMessage: 'User not in records'})
		return
	}
	const hashedPW = sha1(pw)
	console.info('from login: ', hashedPW)
	console.info('from db:', pwFromDB[0][0]['password'])
	if (hashedPW === pwFromDB[0][0]['password']) {
		resp.status(200)
		resp.json({message: 'login successful!'})
	} else {
		resp.status(401)
		resp.json({errorMessage: 'Password is incorrect!'})
	}
}

const readFile = (path) => new Promise(
    (resolve, reject) => 
        fs.readFile(path, (err, buff) => {
            if (null != err)
                reject (err)
            else
                resolve(buff)
        })
)

const putObject = (file, buff, s3) => new Promise(
    (resolve, reject) => {
        const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: file.filename,
            Body: buff,
            ACL: 'public-read',
            ContentType: file.mimetype,
            ContentLength: file.size
        }
        s3.putObject(params, (err, result) => {
            if (null != err) {
                reject(err)
            } else {
                resolve(result)
            }
        })
    }
)

const mongoDoc = (params, image) => {
	return {
		title: params.title,
		comments: params.comments,
		image: image,
		timestamp: new Date()
	}
}

app.use(morgan('combined'))

app.post('/authentication', express.json(), async (req, resp) => {
	const user = req.body.userName
	const password = req.body.password
	resp.type('application/json')
	authenticate(user, password, resp)
})

app.post('/share', upload.single('share-img'), async (req, resp) => {
    console.info(req.body)
    resp.status(200).end()
	// const doc = mongoDoc (req.body, req.file.filename)

	// resp.on('finish', () => {
    //     console.info('>>> response ended')
    //     // delete the temp file
    //     fs.unlink(req.file.path, () => {})
	// })
	
	// readFile(req.file.path)
    //     .then(buff => 
    //         putObject(req.file, buff, s3)
    //     )
    //     .then(() => 
    //     client.db(DATABASE).collection(COLLECTION)
    //         .insertOne(doc)
    //     )
    //     .then(result => {
    //         console.info('insert result: ', result)
    //         resp.status(200)
    //         resp.json({id: result.ops[0]._id})
    //     })
    //     .catch (e =>  {
    //         console.error('insert error:', e)
    //         resp.status(500)
    //         resp.json({ error: e })
    //     })
})

const p0 = (async () => {
    const conn = await pool.getConnection()
    console.info('Pinging database...')
    await conn.ping()
    conn.release()
    return true
})()

const p1 = (async () => {
    await client.connect()
    client.close()
    return true
})()

const p2 = new Promise(
    (resolve, reject) => {
        if((!!process.env.S3_ACCESS_KEY) && (!!process.env.S3_SECRET_ACCESS_KEY))
            resolve()
        else
            reject('S3 keys not found')
    }
)

Promise.all([p0, p1, p2])
    .then(r => {
		app.listen(PORT, () => {
			console.info(`Application started on port ${PORT} at ${new Date()}`)
		})
    })
    .catch(err => console.error('Cannot connect: ', err))