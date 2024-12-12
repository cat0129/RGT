const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const { error } = require('console');
const app = express();
const port = 3100;

// MySQL 연결
const connection = require('./db');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'build')));

// 책목록과 전체 항목 수를 MySQL에서 가져오는 엔드포인트
app.get('/api/books', (req, res) => {
  const { page = 1, limit = 10, name = "", author = "" } = req.query;  // 기본 페이지 1, 기본 항목 수 10
  const offset = (page - 1) * limit;

  // 제목과 작가를 기준으로 필터링할 수 있도록 쿼리 수정
  let query = 'SELECT * FROM tbl_book WHERE name LIKE ? AND author LIKE ? LIMIT ? OFFSET ?';
  let queryParams = [`%${name}%`, `%${author}%`, parseInt(limit), offset];

  connection.query(query, queryParams, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: '데이터베이스 조회 오류' });
    }

    // 전체 항목 수 조회 쿼리, 필터링된 조건에 맞게
    const countQuery = 'SELECT COUNT(*) AS totalItems FROM tbl_book WHERE name LIKE ? AND author LIKE ?';
    connection.query(countQuery, [`%${name}%`, `%${author}%`], (err, countResults) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: '전체 항목 수 조회 오류' });
      }
      
      const totalItems = countResults[0].totalItems;
      
      // 응답으로 목록과 전체 항목 수를 반환
      res.json({
        list: results,
        totalItems: totalItems
      });
    });
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
