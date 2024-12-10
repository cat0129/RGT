const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const { error } = require('console');
const app = express();
const port = 3100;

// MySQL 연결 설정
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',     // MySQL 사용자 이름
  password: 'test1234',     // MySQL 비밀번호
  database: 'rgt'   // 사용 중인 데이터베이스 이름
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'build')));

// 책제목과 번호를 MySQL에서 가져오는 엔드포인트
app.get('/api/books', (req, res) => {
  const query = 'SELECT * FROM tbl_book';  
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: '데이터베이스 조회 오류' });
    }
    res.json({ list: results });
  });
});

// 책 세부 정보를 MySQL에서 가져오는 엔드포인트
app.get('/api/books/:id', (req, res) => {
  const id = req.params.id;
  const query = 'SELECT * FROM tbl_book WHERE id=?';  
  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: '데이터베이스 조회 오류' });
    }
    res.json({ book: results[0] });
  });
});

//책 추가
app.post('/api/books/', (req,res)=>{
  const {name, author, price, sold, stock} = req.body;
  const query = 'INSERT INTO tbl_book (name, author, price, sold, stock) VALUES (?,?,?,?,?)';
  connection.query(query, [name, author, price, sold, stock], (err, results) => {
    if(err){
      console.error('Database error:', err);
      return res.status(500).json({ error: '데이터베이스 오류' });
    }
    res.json({newBook : results});
  })
})

//책 정보 수정
app.put('/api/books/:id', (req,res)=>{
  const {name, author, price, sold, stock} = req.body;
  const { id } = req.params;
  console.log("!!!!"+name, author, id);
  const query = 'UPDATE tbl_book SET name=?, author=?, price=?, sold=?, stock=? WHERE id=?';
  connection.query(query, [name, author, price, sold, stock, id], (err, results) => {
    if(err){
      console.error('Database error:', err);
      return res.status(500).json({ error: '데이터베이스 수정 오류' });
    }
    res.json({message : '수정 성공'});
  })
})

//책 삭제
app.delete('/api/books/:id', (req,res)=>{
  const id = req.params.id;
  const query = 'DELETE FROM tbl_book WHERE id=?';
  connection.query(query, [id], (err, results) => {
    if(err){
      console.error('Database error:', err);
      return res.status(500).json({ error: '데이터베이스 삭제 오류'});
    }
    res.json({message:'삭제 성공'})
  })
})

// 서버 시작
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
