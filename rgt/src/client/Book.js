import React, { useEffect, useState } from "react";
import axios from "axios";

const Book = () => {
  const [list, setList] = useState([]);
  const [detail, setDetail] = useState(null); 
  const [error, setError] = useState(null);
  // 책 추가 및 수정
  const [newBook, setNewBook] = useState({ name: "", author: "", price: "", sold: "", stock: "" });
  const [editBook, setEditBook] = useState({ id: "", name: "", author: "", price: "", sold: "", stock: "" });
  //페이지네이션
  const [currentPage, setCurrentPage] = useState(1); 
  const [itemsPerPage] = useState(10); 
  const [totalItems, setTotalItems] = useState(0); 
  // 필터
  const [filter, setFilter] = useState({ name: "", author: "" });

  // 책 목록 가져오기
  async function getBookList() {
    try {
      const { name, author } = filter;
      const res = await axios.get(`http://54.180.172.14:3100/api/books?page=${currentPage}&limit=${itemsPerPage}&name=${name}&author=${author}`);
      if (res.data && res.data.list) {
        setList(res.data.list);
        setTotalItems(res.data.totalItems); 
      } else {
        setError("목록이 없습니다.");
      }
    } catch (err) {
      setError("목록을 불러오는 데 실패했습니다.");
      console.error("Error fetching list:", err);
    }
  }
  

  // 책 세부 정보 가져오기
  async function getBookDetail(id) {
    try {
      const res = await axios.get(`http://54.180.172.14:3100/api/books/${id}`);
      if (res.data && res.data.book) {
        setDetail(res.data.book);
      } else {
        setError("세부 정보가 없습니다.");
      }
    } catch (err) {
      setError("세부 정보를 불러오는 데 실패했습니다.");
      console.error("Error fetching detail:", err);
    }
  }

  // 책 추가
  async function addBook() {
    try {
      const res = await axios.post("http://54.180.172.14:3100/api/books", {
        name: newBook.name,
        author: newBook.author,
        price: newBook.price,
        sold: newBook.sold,
        stock: newBook.stock
      });
      getBookList();
      setNewBook({ name: "", author: "", price: "", sold: "", stock: "" });
    } catch (err) {
      setError("책 추가 실패");
      console.error(err);
    }
  }

  // 책 수정
  async function updateBook() {
    try {
      const res = await axios.put(`http://54.180.172.14:3100/api/books/${editBook.id}`, {
        name: editBook.name,
        author: editBook.author,
        price: editBook.price,
        sold: editBook.sold,
        stock: editBook.stock
      });
      getBookList();  
      setEditBook({ id: "", name: "", author: "", price: "", sold: "", stock: "" });  
    } catch (err) {
      setError("책 수정 실패");
      console.error("Error updating book:", err);
    }
  }

  // 책 삭제
  async function deleteBook(id) {
    try {
      await axios.delete(`http://54.180.172.14:3100/api/books/${id}`);
      getBookList();
    } catch (err) {
      setError("책 삭제 실패");
      console.error(err);
    }
  }

  useEffect(() => {
    getBookList();
  }, [currentPage]);

    // 페이지 변경
    const fnPageChange = (pageNumber) => {
      setCurrentPage(pageNumber);
    };

    const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (

    <div>
    {error && <p style={{ color: "red" }}>{error}</p>}
    <h1>책 목록</h1>
    {/* 필터 영역 */}
    <div>
      <input
        type="text"
        placeholder="제목 검색"
        value={filter.name}
        onChange={(e) => setFilter({ ...filter, name: e.target.value })}
      />
      <input
        type="text"
        placeholder="작가 검색"
        value={filter.author}
        onChange={(e) => setFilter({ ...filter, author: e.target.value })}
      />
      <button onClick={() => getBookList()}>검색</button>
    </div>
      {/* 책 목록 */}
      <table>
        <thead>
          <tr>
            <th>번호</th>
            <th>제목</th>
            <th>작가</th>
            <th>가격</th>
            <th>판매량</th>
            <th>재고</th>
            <th>버튼</th>
          </tr>
        </thead>
        <tbody>
          {list.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.name}</td>
              <td>{item.author}</td>
              <td>{item.price}</td>
              <td>{item.sold}</td>
              <td>{item.stock}</td>
              <td>
                <button onClick={() => deleteBook(item.id)}>삭제</button>
                <button onClick={() => setEditBook(item)}>수정</button>
              </td>
              {/* 수정 폼이 열려 있으면 해당 책 바로 아래에 수정 인풋 박스 표시 */}
              {editBook.id === item.id && (
                <tr>
                  <td colSpan="3">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        updateBook();
                      }}
                    >
                      <input
                        type="text"
                        value={editBook.name}
                        onChange={(e) => setEditBook({ ...editBook, name: e.target.value })}
                        placeholder="책 제목"
                      />
                      <input
                        type="text"
                        value={editBook.author}
                        onChange={(e) => setEditBook({ ...editBook, author: e.target.value })}
                        placeholder="작가"
                      />
                      <input
                        type="number"
                        value={editBook.price}
                        onChange={(e) => setEditBook({ ...editBook, price: e.target.value })}
                        placeholder="가격"
                      />
                      <input
                        type="number"
                        value={editBook.sold}
                        onChange={(e) => setEditBook({ ...editBook, sold: e.target.value })}
                        placeholder="판매량"
                      />
                      <input
                        type="number"
                        value={editBook.stock}
                        onChange={(e) => setEditBook({ ...editBook, stock: e.target.value })}
                        placeholder="재고"
                      />
                      <button type="submit">책 수정</button>
                    </form>
                  </td>
                </tr>
              )}
            </tr>
          ))}
        </tbody>
      </table>
       {/* 페이지네이션 버튼 */}
       <div>
        <button
          onClick={() => fnPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          이전
        </button>
        {Array.from({ length: totalPages }).map((_, index) => (
          <button
            key={index}
            onClick={() => fnPageChange(index + 1)}
            style={{ fontWeight: currentPage === index + 1 ? "bold" : "normal" }}
          >
            {index + 1}
          </button>
        ))}
        <button
          onClick={() => fnPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          다음
        </button>
      </div>

      <h2>책 추가</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          addBook();
        }}
      >
        <input
          type="text"
          value={newBook.name}
          onChange={(e) => setNewBook({ ...newBook, name: e.target.value })}
          placeholder="책 제목"
        />
        <input
          type="text"
          value={newBook.author}
          onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
          placeholder="작가"
        />
        <input
          type="number"
          value={newBook.price}
          onChange={(e) => setNewBook({ ...newBook, price: e.target.value })}
          placeholder="가격"
        />
        <input
          type="number"
          value={newBook.sold}
          onChange={(e) => setNewBook({ ...newBook, sold: e.target.value })}
          placeholder="판매량"
        />
        <input
          type="number"
          value={newBook.stock}
          onChange={(e) => setNewBook({ ...newBook, stock: e.target.value })}
          placeholder="재고"
        />
        <button type="submit">책 추가</button>
      </form>
    </div>
  );
};

export default Book;
